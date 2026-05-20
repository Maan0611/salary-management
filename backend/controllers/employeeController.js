const db = require('../db');
const bcrypt = require('bcryptjs');
const { sendWelcomeEmail } = require('../utils/mailer');

exports.getAllEmployees = (req, res) => {
  db.query("SELECT * FROM employees ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "Database fetch error" });
    res.json(result);
  });
};

exports.getEmployeeById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database fetch error" });
    if (result.length === 0) return res.status(404).json({ message: "Employee not found" });
    res.json(result[0]);
  });
};

exports.addEmployee = async (req, res) => {
  const { emp_id, name, email, department, position, basic_salary, join_date, leave_balance, status, password } = req.body;
  if (!emp_id || !name || !email || !department || !position || !basic_salary || !join_date || !password) {
    return res.status(400).json({ message: "All fields including password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO employees (emp_id, name, email, department, position, basic_salary, join_date, leave_balance, status, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [emp_id, name, email, department, position, basic_salary, join_date, leave_balance || 0, status || 'Active', hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: "Employee ID or Email already exists" });
        }
        return res.status(500).json({ message: "Failed to add employee" });
      }

      // Automatically fire off Welcome Email in background
      const portalLink = req.get('origin') || "http://localhost:3000";
      sendWelcomeEmail(email, name, email, password, portalLink).catch(mailErr => {
        console.error("Welcome email async delivery failure:", mailErr.message);
      });

      res.status(201).json({ message: "Employee added successfully and welcome email queued!" });
    });
  } catch (hashErr) {
    console.error("Employee bcrypt hashing error:", hashErr);
    res.status(500).json({ message: "Secure authentication setup failed." });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { emp_id, name, email, department, position, basic_salary, join_date, leave_balance, status, password } = req.body;
  
  try {
    let sql = "UPDATE employees SET emp_id=?, name=?, email=?, department=?, position=?, basic_salary=?, join_date=?, leave_balance=?, status=? WHERE id=?";
    let params = [emp_id, name, email, department, position, basic_salary, join_date, leave_balance || 0, status, id];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql = "UPDATE employees SET emp_id=?, name=?, email=?, department=?, position=?, basic_salary=?, join_date=?, leave_balance=?, status=?, password=? WHERE id=?";
      params = [emp_id, name, email, department, position, basic_salary, join_date, leave_balance || 0, status, hashedPassword, id];
    }

    db.query(sql, params, (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: "Employee ID or Email already exists" });
        }
        return res.status(500).json({ message: "Failed to update employee" });
      }
      res.json({ message: "Employee updated successfully" });
    });
  } catch (hashErr) {
    console.error("Employee update password hash failed:", hashErr);
    res.status(500).json({ message: "Failed to securely update employee credentials." });
  }
};

exports.deleteEmployee = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete employee" });
    res.json({ message: "Employee deleted successfully" });
  });
};
