const db = require('../db');
const { notifyAdmins, sendNotification } = require('../utils/notificationHelper');

// GET /api/salary - Fetch all records or filter by month/year
exports.getAllSalary = (req, res) => {
    const { month, year } = req.query;
    let query = `
        SELECT s.*, e.name, e.emp_id as employee_code, e.department, e.position 
        FROM salary s 
        JOIN employees e ON s.employee_id = e.id
    `;
    const params = [];

    if (month && year) {
        query += " WHERE s.month = ? AND s.year = ?";
        params.push(month, year);
    }

    query += " ORDER BY s.id DESC";

    db.query(query, params, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
};

// POST /api/salary/generate - Auto-generate salaries for all employees for a given month/year
exports.generateSalary = async (req, res) => {
    const { month, year } = req.body;

    if (!month || !year) return res.status(400).json({ message: "Month and Year are required" });

    // 1. Get all employees
    db.query("SELECT id, basic_salary FROM employees", (err, employees) => {
        if (err) return res.status(500).json({ message: "Error fetching employees" });

        if (employees.length === 0) return res.status(404).json({ message: "No employees found" });

        // 2. Check if salaries already generated for this month/year
        db.query("SELECT employee_id FROM salary WHERE month = ? AND year = ?", [month, year], (err, existing) => {
            if (err) return res.status(500).json({ message: "Error checking existing records" });

            const existingIds = existing.map(s => s.employee_id);
            const toGenerate = employees.filter(e => !existingIds.includes(e.id));

            if (toGenerate.length === 0) return res.status(200).json({ message: "Salaries already generated for all employees for this period" });

            // 3. Insert records (Default status: Draft)
            const values = toGenerate.map(e => [
                e.id, month, year, e.basic_salary, 0, 0, 0, 0, e.basic_salary, 'Draft'
            ]);

            const sql = "INSERT INTO salary (employee_id, month, year, basic_salary, bonus, overtime, deduction, tax, net_salary, status) VALUES ?";
            db.query(sql, [values], (err) => {
                if (err) return res.status(500).json({ message: "Error generating salaries" });
                
                // Notify Admins
                notifyAdmins(`New salaries generated for ${month}/${year}. Review required.`, "Payroll Drafts Ready");
                
                res.status(201).json({ message: `Successfully generated ${toGenerate.length} salary records as Draft` });
            });
        });
    });
};

// PUT /api/salary/approve/:id - Approve salary
exports.approveSalary = (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const approved_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.query("UPDATE salary SET status = 'Approved', approved_by = ?, approved_at = ? WHERE id = ?", [adminId, approved_at, id], (err) => {
        if (err) return res.status(500).json({ message: "Approval failed" });
        
        // Notify Employee
        db.query("SELECT employee_id, month, year FROM salary WHERE id = ?", [id], (err, rows) => {
            if (!err && rows.length > 0) {
                sendNotification(rows[0].employee_id, `Your salary for ${rows[0].month}/${rows[0].year} has been approved.`, "Salary Approved", "success");
            }
        });

        res.json({ message: "Salary approved successfully" });
    });
};

// PUT /api/salary/reject/:id - Reject salary
exports.rejectSalary = (req, res) => {
    const { id } = req.params;
    const { remarks } = req.body;

    db.query("UPDATE salary SET status = 'Rejected', remarks = ? WHERE id = ?", [remarks, id], (err) => {
        if (err) return res.status(500).json({ message: "Rejection failed" });
        
        // Notify Employee
        db.query("SELECT employee_id, month, year FROM salary WHERE id = ?", [id], (err, rows) => {
            if (!err && rows.length > 0) {
                sendNotification(rows[0].employee_id, `Your salary for ${rows[0].month}/${rows[0].year} was rejected for correction. Reason: ${remarks}`, "Salary Rejected", "danger");
            }
        });

        res.json({ message: "Salary rejected" });
    });
};

// POST /api/salary/bulk-approve - Bulk approve
exports.bulkApprove = (req, res) => {
    const { ids } = req.body;
    const adminId = req.user.id;
    const approved_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (!ids || !ids.length) return res.status(400).json({ message: "No IDs provided" });

    db.query("UPDATE salary SET status = 'Approved', approved_by = ?, approved_at = ? WHERE id IN (?) AND status IN ('Draft', 'Rejected')", [adminId, approved_at, ids], (err) => {
        if (err) return res.status(500).json({ message: "Bulk approval failed" });

        // Notify Employees (Bulk)
        db.query("SELECT employee_id, month, year FROM salary WHERE id IN (?)", [ids], (err, rows) => {
            if (!err) {
                rows.forEach(row => {
                    sendNotification(row.employee_id, `Your salary for ${row.month}/${row.year} has been approved.`, "Salary Approved", "success");
                });
            }
        });

        res.json({ message: `Successfully approved ${ids.length} records` });
    });
};

// PUT /api/salary/pay/:id - Mark salary as paid
exports.paySalary = (req, res) => {
    const { id } = req.params;
    const payment_date = new Date().toISOString().slice(0, 10);

    db.query("UPDATE salary SET status = 'Paid', payment_date = ? WHERE id = ? AND status = 'Approved'", [payment_date, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Payment update failed" });
        if (result.affectedRows === 0) return res.status(400).json({ message: "Only approved salaries can be marked as paid" });

        // Notify Employee
        db.query("SELECT employee_id, month, year, net_salary FROM salary WHERE id = ?", [id], (err, rows) => {
            if (!err && rows.length > 0) {
                sendNotification(rows[0].employee_id, `Salary for ${rows[0].month}/${rows[0].year} has been credited. Net: $${rows[0].net_salary.toLocaleString()}`, "Salary Credited", "success");
            }
        });

        res.json({ message: "Salary marked as Paid" });
    });
};

// PUT /api/salary/update/:id - Update bonus/deductions and recalculate net_salary
exports.updateSalary = (req, res) => {
    const { id } = req.params;
    const { bonus, overtime, deduction, tax, remarks } = req.body;

    db.query("SELECT basic_salary, status FROM salary WHERE id = ?", [id], (err, result) => {
        if (err || result.length === 0) return res.status(500).json({ message: "Record not found" });

        const record = result[0];
        const basic = parseFloat(record.basic_salary);
        const b = parseFloat(bonus) || 0;
        const o = parseFloat(overtime) || 0;
        const d = parseFloat(deduction) || 0;
        const t = parseFloat(tax) || 0;

        const net_salary = (basic + b + o) - (d + t);
        
        // If updated after approval, maybe revert to Draft? Or just flag it.
        // User said: "Warning if salary edited after approval" - so I'll set is_modified = 1
        const newStatus = record.status === 'Approved' ? 'Draft' : record.status;

        const sql = "UPDATE salary SET bonus=?, overtime=?, deduction=?, tax=?, net_salary=?, status=?, remarks=?, is_modified=1 WHERE id=?";
        db.query(sql, [b, o, d, t, net_salary, newStatus, remarks, id], (err) => {
            if (err) return res.status(500).json({ message: "Update failed" });
            res.json({ message: "Salary record updated and set to " + newStatus, net_salary });
        });
    });
};

// DELETE /api/salary/:id
exports.deleteSalary = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM salary WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Salary record deleted" });
    });
};
