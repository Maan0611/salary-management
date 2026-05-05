const db = require('../db');

const setupEmployeePortalDB = () => {
  // 1. Add password field to employees
  const addPasswordSql = "ALTER TABLE employees ADD COLUMN password VARCHAR(255) DEFAULT NULL";
  db.query(addPasswordSql, (err) => {
    if (err && err.code !== 'ER_DUP_COLUMN') {
      console.error("Error adding password to employees:", err);
    } else {
      console.log("Password column ready in employees ✅");
    }
  });

  // 2. Create leaves table
  const createLeavesSql = `
    CREATE TABLE IF NOT EXISTS leaves (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      leave_type VARCHAR(50) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `;
  db.query(createLeavesSql, (err) => {
    if (err) console.error("Error creating leaves table:", err);
    else console.log("Leaves table ready ✅");
  });
};

module.exports = setupEmployeePortalDB;
