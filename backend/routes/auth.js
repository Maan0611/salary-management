const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/sendEmail");

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

// OTP FORGOT PASSWORD
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Find user by Email OR Employee ID (for employees)
    const query = `
        SELECT name, email FROM users WHERE email = ? 
        UNION 
        SELECT name, email FROM employees WHERE email = ? OR emp_id = ?
    `;
    
    db.query(query, [email, email, email], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ message: "No account found with this Email or Employee ID" });
        }
        
        const user = result[0];
        const userEmail = user.email;
        const userName = user.name;
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

        // Insert OTP then send email
        db.query("INSERT INTO otp_codes (email, otp, expires_at) VALUES (?, ?, ?)", [userEmail, otp, expiresAt], async (err) => {
            if (err) {
                console.error("OTP DB Error:", err);
                return res.status(500).json({ message: "Error generating verification code" });
            }

            const emailSent = await sendOTPEmail(userEmail, userName, otp);
            if (emailSent.success) {
                res.json({ message: "OTP sent successfully to " + userEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3") });
            } else {
                console.error("OTP Email Error:", emailSent.error);
                res.status(500).json({ 
                    message: "Failed to send email. " + (emailSent.error?.message || "Check SMTP settings."),
                    debug: process.env.NODE_ENV === 'development' ? emailSent.error : undefined
                });
            }
        });
    });
});

router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    db.query("SELECT * FROM otp_codes WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1", [email, otp], (err, result) => {
        if (err || result.length === 0) return res.status(400).json({ message: "Invalid or expired OTP" });
        res.json({ message: "OTP verified", success: true });
    });
});

router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    // Verify OTP one last time
    db.query("SELECT * FROM otp_codes WHERE email = ? AND otp = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1", [email, otp], async (err, result) => {
        if (err || result.length === 0) return res.status(400).json({ message: "Invalid session" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update in both potential tables (one will fail silently or update 0 rows)
        db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (err, res1) => {
            db.query("UPDATE employees SET password = ? WHERE email = ?", [hashedPassword, email], (err, res2) => {
                // Delete used OTP
                db.query("DELETE FROM otp_codes WHERE email = ?", [email]);
                res.json({ message: "Password reset successful" });
            });
        });
    });
});

module.exports = router;