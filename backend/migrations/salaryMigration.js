const db = require('../db');

const createSalaryTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS salary (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id INT NOT NULL,
      month VARCHAR(10) NOT NULL,
      year VARCHAR(10) NOT NULL,
      basic_salary DECIMAL(15, 2) NOT NULL,
      bonus DECIMAL(15, 2) DEFAULT 0,
      overtime DECIMAL(15, 2) DEFAULT 0,
      deduction DECIMAL(15, 2) DEFAULT 0,
      tax DECIMAL(15, 2) DEFAULT 0,
      net_salary DECIMAL(15, 2) NOT NULL,
      status ENUM('Paid', 'Pending') DEFAULT 'Pending',
      payment_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error("Error creating salary table:", err);
    } else {
      console.log("Salary table ready ✅");
    }
  });
};

module.exports = createSalaryTable;
