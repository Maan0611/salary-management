const db = require('../db');

// EMPLOYEE PORTAL APIs
exports.createRequest = (req, res) => {
    const employee_id = req.user.id;
    console.log("Received Request Payload:", req.body);
    let { request_type, reason, from_date, to_date, amount } = req.body;

    // Clean empty strings to NULL for DB compatibility
    from_date = from_date || null;
    to_date = to_date || null;
    amount = amount || null;

    const sql = "INSERT INTO requests (employee_id, request_type, reason, from_date, to_date, amount) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [employee_id, request_type, reason, from_date, to_date, amount], (err) => {
        if (err) {
            console.error("SQL Error in createRequest:", err);
            return res.status(500).json({ message: "Failed to submit request", error: err.message });
        }
        res.status(201).json({ message: "Request submitted successfully" });
    });
};

exports.getMyRequests = (req, res) => {
    const employee_id = req.user.id;
    const sql = "SELECT * FROM requests WHERE employee_id = ? ORDER BY created_at DESC";
    db.query(sql, [employee_id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
};

// ADMIN PORTAL APIs
exports.getAllRequests = (req, res) => {
    console.log(`[Admin] getAllRequests called by user id=${req.user?.id} role=${req.user?.role}`);
    const sql = `
        SELECT r.*, e.name as employee_name, e.emp_id as employee_code, e.department, e.position 
        FROM requests r 
        LEFT JOIN employees e ON r.employee_id = e.id 
        ORDER BY r.created_at DESC
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('[getAllRequests] DB Error:', err.message);
            return res.status(500).json({ message: "Database error", detail: err.message });
        }
        console.log(`[getAllRequests] Returning ${result.length} records`);
        res.json(result);
    });
};

exports.approveRequest = (req, res) => {
    const { id } = req.params;
    const { admin_remark } = req.body;
    const sql = "UPDATE requests SET status = 'Approved', admin_remark = ? WHERE id = ?";
    db.query(sql, [admin_remark, id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        
        res.json({ message: "Request approved" });
    });
};

exports.rejectRequest = (req, res) => {
    const { id } = req.params;
    const { admin_remark } = req.body;
    const sql = "UPDATE requests SET status = 'Rejected', admin_remark = ? WHERE id = ?";
    db.query(sql, [admin_remark, id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        
        res.json({ message: "Request rejected" });
    });
};

// Stats for Admin Dashboard
exports.getPendingRequestsCount = (req, res) => {
    db.query("SELECT COUNT(*) as count FROM requests WHERE status = 'Pending'", (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ count: result[0].count });
    });
};
