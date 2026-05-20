const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/mailer");

const SECRET = process.env.JWT_SECRET || "mysecretkey";

// LOGIN API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. First check in Admin 'users' table
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) {
        console.error("ADMIN LOOKUP ERROR:", err);
        return res.status(500).json({ 
          message: "Database error during admin lookup",
          error: process.env.NODE_ENV === 'development' ? err.message : undefined 
        });
      }

      if (result.length > 0) {
        try {
          const user = result[0];
          const isMatch = await checkPassword(password, user.password);
          if (isMatch) return sendToken(res, user, 'admin');
        } catch (pwErr) {
          console.error("Password check error (Admin):", pwErr);
          return res.status(500).json({ message: "Error verifying credentials" });
        }
      }

      // 2. Not an admin, check in 'employees' table
      db.query("SELECT * FROM employees WHERE email = ?", [email], async (err, empResult) => {
        if (err) {
          console.error("Employee query error:", err);
          return res.status(500).json({ message: "Database error during employee lookup" });
        }

        if (empResult.length === 0) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        try {
          const emp = empResult[0];
          if (!emp.password) {
            return res.status(401).json({ message: "Account not set up. Please contact admin." });
          }

          const isMatch = await checkPassword(password, emp.password);
          if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

          return sendToken(res, emp, 'employee');
        } catch (pwErr) {
          console.error("Password check error (Employee):", pwErr);
          return res.status(500).json({ message: "Error verifying credentials" });
        }
      });
    });
  } catch (globalErr) {
    console.error("Global login error:", globalErr);
    res.status(500).json({ message: "Server error during authentication" });
  }
});

async function checkPassword(input, stored) {
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
    return await bcrypt.compare(input, stored);
  }
  return input === stored;
}

function sendToken(res, user, role) {
  const token = jwt.sign(
    { id: user.id, role: role },
    SECRET,
    { expiresIn: "8h" }
  );

  return res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role
    }
  });
}

// CHANGE PASSWORD API
router.put("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, SECRET);
    const userId = decoded.id;
    const role = decoded.role;

    const table = role === 'admin' ? 'users' : 'employees';

    db.query(`SELECT password FROM ${table} WHERE id = ?`, [userId], async (err, result) => {
      if (err || result.length === 0) return res.status(500).json({ message: "User not found" });

      const isMatch = await checkPassword(oldPassword, result[0].password);
      if (!isMatch) return res.status(401).json({ message: "Current password incorrect" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, userId], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Password updated successfully" });
      });
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});
// FORGOT PASSWORD - SEND OTP API
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // 1. Validate if user exists in either table
    const [admins] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
    const [employees] = await db.promise().query("SELECT id FROM employees WHERE email = ?", [email]);

    if (admins.length === 0 && employees.length === 0) {
      return res.status(404).json({ message: "No account registered with this email address." });
    }

    // 2. Check rate-limit (60 seconds)
    const [recentOtps] = await db.promise().query(
      "SELECT created_at FROM otps WHERE email = ? ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (recentOtps.length > 0) {
      const lastSentTime = new Date(recentOtps[0].created_at).getTime();
      const elapsedSeconds = (Date.now() - lastSentTime) / 1000;
      if (elapsedSeconds < 60) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(60 - elapsedSeconds)} seconds before requesting another code.`
        });
      }
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // 4. Store in database
    await db.promise().query(
      "INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    // 5. Send via mailer
    await sendOTPEmail(email, otp);

    res.json({ message: "A secure verification code has been dispatched to your email address." });
  } catch (err) {
    console.error("OTP send failure:", err);
    res.status(500).json({ message: "Failed to dispatch verification code. Please check SMTP settings." });
  }
});

// FORGOT PASSWORD - VERIFY OTP & RESET PASSWORD API
router.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, code, and new password are required." });
  }

  try {
    // 1. Verify OTP matching and expiry
    const [matches] = await db.promise().query(
      "SELECT * FROM otps WHERE email = ? AND otp = ? AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1",
      [email, otp]
    );

    if (matches.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    // 2. Determine target table (admin or employee)
    const [admins] = await db.promise().query("SELECT id FROM users WHERE email = ?", [email]);
    const [employees] = await db.promise().query("SELECT id FROM employees WHERE email = ?", [email]);

    let targetTable = "";
    if (admins.length > 0) {
      targetTable = "users";
    } else if (employees.length > 0) {
      targetTable = "employees";
    } else {
      return res.status(404).json({ message: "Account mapping not found." });
    }

    // 3. Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password in respective table
    await db.promise().query(
      `UPDATE ${targetTable} SET password = ? WHERE email = ?`,
      [hashedPassword, email]
    );

    // 5. Delete OTP to prevent reuse
    await db.promise().query("DELETE FROM otps WHERE email = ?", [email]);

    res.json({ message: "Your security credentials have been successfully updated!" });
  } catch (err) {
    console.error("OTP verify/reset failure:", err);
    res.status(500).json({ message: "System error during password reset process." });
  }
});

module.exports = router;