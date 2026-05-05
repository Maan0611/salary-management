const db = require('../db');

const setupRequestsTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      request_type ENUM('Leave Request', 'Half Day', 'Work From Home', 'Salary Advance', 'Profile Update') NOT NULL,
      reason TEXT,
      from_date DATE,
      to_date DATE,
      amount DECIMAL(10,2) DEFAULT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
      admin_remark TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("Error creating requests table:", err);
    else console.log("Requests table ready ✅");
  });
};

module.exports = setupRequestsTable;
