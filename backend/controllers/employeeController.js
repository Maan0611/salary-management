const db = require('../db');

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

exports.addEmployee = (req, res) => {
  const { emp_id, name, email, department, position, basic_salary, join_date, leave_balance, status, password } = req.body;
  if (!emp_id || !name || !email || !department || !position || !basic_salary || !join_date || !password) {
    return res.status(400).json({ message: "All fields including password are required" });
  }

  const sql = "INSERT INTO employees (emp_id, name, email, department, position, basic_salary, join_date, leave_balance, status, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [emp_id, name, email, department, position, basic_salary, join_date, leave_balance || 0, status || 'Active', password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: "Employee ID or Email already exists" });
      }
      return res.status(500).json({ message: "Failed to add employee" });
    }
    res.status(201).json({ message: "Employee added successfully" });
  });
};

exports.updateEmployee = (req, res) => {
  const { id } = req.params;
  const { emp_id, name, email, department, position, basic_salary, join_date, leave_balance, status, password } = req.body;
  
  let sql = "UPDATE employees SET emp_id=?, name=?, email=?, department=?, position=?, basic_salary=?, join_date=?, leave_balance=?, status=? WHERE id=?";
  let params = [emp_id, name, email, department, position, basic_salary, join_date, leave_balance || 0, status, id];

  if (password && password.trim() !== "") {
    sql = "UPDATE employees SET emp_id=?, name=?, email=?, department=?, position=?, basic_salary=?, join_date=?, leave_balance=?, status=?, password=? WHERE id=?";
    params = [emp_id, name, email, department, position, basic_salary, join_date, leave_balance || 0, status, password, id];
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
};

exports.deleteEmployee = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM employees WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to delete employee" });
    res.json({ message: "Employee deleted successfully" });
  });
};
