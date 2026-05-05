const db = require('../db');

const addStatusToEmployees = () => {
  const sql = "ALTER TABLE employees ADD COLUMN status ENUM('Active', 'Inactive') DEFAULT 'Active' AFTER join_date";
  db.query(sql, (err) => {
    if (err) {
      if (err.code === 'ER_DUP_COLUMN') {
        console.log("Status column already exists ✅");
      } else {
        console.error("Error adding status column:", err);
      }
    } else {
      console.log("Status column added to employees ✅");
    }
  });
};

module.exports = addStatusToEmployees;
