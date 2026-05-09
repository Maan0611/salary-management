const db = require('../db');
const bcrypt = require('bcryptjs');
const fs = require('fs');

exports.getProfile = (req, res) => {
  const userId = req.user.id;
  db.query("SELECT id, name, email, phone, address, role, profile_image, created_at FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(result[0]);
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, phone, address } = req.body;

  const sql = "UPDATE users SET name=?, phone=?, address=? WHERE id=?";
  db.query(sql, [name, phone, address, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to update profile" });
    res.json({ message: "Profile updated successfully" });
  });
};

exports.changePassword = (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  db.query("SELECT password FROM users WHERE id = ?", [userId], async (err, result) => {
    if (err || result.length === 0) return res.status(500).json({ message: "Database error" });

    const user = result[0];
    
    // Check old password (supports plaintext and bcrypt depending on how the user was created)
    let isMatch = false;
    if (user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"))) {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      isMatch = currentPassword === user.password;
    }

    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    db.query("UPDATE users SET password=? WHERE id=?", [hashedPassword, userId], (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to update password" });
      res.json({ message: "Password changed successfully" });
    });
  });
};

exports.uploadPhoto = (req, res) => {
  const userId = req.user.id;
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const imageUrl = `/uploads/profiles/${req.file.filename}`;

  db.query("UPDATE users SET profile_image=? WHERE id=?", [imageUrl, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to save image" });
    res.json({ message: "Profile photo updated", profile_image: imageUrl });
  });
};
