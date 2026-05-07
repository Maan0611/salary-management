const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "mysecretkey";

const verifyToken = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Format: "Bearer token"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify token
    const decoded = jwt.verify(token, SECRET);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  // If role is explicitly set to admin in token
  if (req.user && req.user.role === 'admin') {
    return next();
  } 
  
  // Backward compatibility: If role is missing in older tokens, check DB
  if (req.user && req.user.id && !req.user.role) {
    const db = require("../db");
    db.query("SELECT * FROM users WHERE id = ?", [req.user.id], (err, result) => {
      if (!err && result.length > 0) {
        req.user.role = 'admin';
        return next();
      }
      return res.status(403).json({ message: "Require Admin Role" });
    });
  } else {
    return res.status(403).json({ message: "Require Admin Role" });
  }
};

module.exports = { verifyToken, isAdmin };