const db = require('../db');

const upgradeEmployeePortalDB = () => {
  // 1. Add extra fields to employees
  const addFieldsSql = `
    ALTER TABLE employees 
    ADD COLUMN phone VARCHAR(20) DEFAULT NULL,
    ADD COLUMN address TEXT DEFAULT NULL,
    ADD COLUMN emergency_contact VARCHAR(100) DEFAULT NULL,
    ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL,
    ADD COLUMN leave_balance INT DEFAULT 12
  `;
  db.query(addFieldsSql, (err) => {
    if (err && err.code !== 'ER_DUP_COLUMN') {
      console.error("Error upgrading employees table:", err);
    } else {
      console.log("Employees table fields upgraded ✅");
    }
  });

  // 2. Create notifications table
  const createNotificationsSql = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type ENUM('info', 'success', 'warning', 'danger') DEFAULT 'info',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `;
  db.query(createNotificationsSql, (err) => {
    if (err) console.error("Error creating notifications table:", err);
    else console.log("Notifications table ready ✅");
  });
};

module.exports = upgradeEmployeePortalDB;
