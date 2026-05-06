const mysql = require("mysql2");
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Use the pool to verify connection
db.getConnection((err, connection) => {
  if (err) {
    console.log("DB Connection Failed ❌", err.message);
  } else {
    console.log(`MySQL Connected ✅ (Host: ${process.env.DB_HOST}, DB: ${process.env.DB_NAME})`);
    connection.release();
  }
});

module.exports = db;