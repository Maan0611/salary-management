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

exports.approveRequest = async (req, res) => {
    const { id } = req.params;
    const { admin_remark } = req.body;

    try {
        // 1. Get request details to calculate leave days
        const [request] = await db.promise().query("SELECT * FROM requests WHERE id = ?", [id]);
        if (request.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const { employee_id, request_type, from_date, to_date } = request[0];

        // 2. Update request status
        await db.promise().query(
            "UPDATE requests SET status = 'Approved', admin_remark = ? WHERE id = ?",
            [admin_remark, id]
        );

        // 3. Update Leave Balance and Attendance if applicable
        const leaveTypes = ['Leave Request', 'Half Day', 'Casual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity/Paternity'];
        
        if (leaveTypes.includes(request_type)) {
            let daysToSubtract = 0;
            const datesToUpdate = [];

            if (request_type === 'Half Day') {
                daysToSubtract = 0.5;
                if (from_date) datesToUpdate.push(new Date(from_date));
            } else if (from_date && to_date) {
                const start = new Date(from_date);
                const end = new Date(to_date);
                daysToSubtract = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                
                // Collect all dates in range
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    datesToUpdate.push(new Date(d));
                }
            }

            // A. Deduct Leave Balance
            if (daysToSubtract > 0) {
                await db.promise().query(
                    "UPDATE employees SET leave_balance = leave_balance - ? WHERE id = ?",
                    [daysToSubtract, employee_id]
                );
            }

            // B. Auto-Update Attendance Table
            const attendanceStatus = request_type === 'Half Day' ? 'Half Day' : 'Leave';
            for (const dateObj of datesToUpdate) {
                const formattedDate = dateObj.toISOString().slice(0, 10);
                
                await db.promise().query(`
                    INSERT INTO attendance (emp_id, date, status, notes) 
                    VALUES (?, ?, ?, ?) 
                    ON DUPLICATE KEY UPDATE status = VALUES(status), notes = VALUES(notes)
                `, [employee_id, formattedDate, attendanceStatus, `Approved ${request_type}: ${admin_remark || ''}`]);
            }
        }

        res.json({ message: "Request approved, balance updated, and attendance synced" });
    } catch (err) {
        console.error("Error in approveRequest:", err);
        res.status(500).json({ message: "Failed to approve request", detail: err.message });
    }
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
