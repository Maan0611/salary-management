const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
// FORGOT PASSWORD (DISABLED)
router.post("/send-otp", (req, res) => {
    res.status(501).json({ message: "Password reset feature currently unavailable." });
});

module.exports = router;