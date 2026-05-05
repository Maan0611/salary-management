const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "mysecretkey";

// LOGIN API
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // 1. First check in Admin 'users' table
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.length > 0) {
      const user = result[0];
      const isMatch = await checkPassword(password, user.password);
      if (isMatch) return sendToken(res, user, 'admin');
    }

    // 2. Not an admin, check in 'employees' table
    db.query("SELECT * FROM employees WHERE email = ?", [email], async (err, empResult) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (empResult.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const emp = empResult[0];
      
      // For employees, we might have plain passwords initially if they haven't set one
      // If password is NULL in DB, maybe we should allow them to set it up or use a default
      if (!emp.password) {
        return res.status(401).json({ message: "Account not set up. Please contact admin." });
      }

      const isMatch = await checkPassword(password, emp.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

      return sendToken(res, emp, 'employee');
    });
  });
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

module.exports = router;