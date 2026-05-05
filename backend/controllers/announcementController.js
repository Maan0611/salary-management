const db = require('../db');

// ADMIN APIs
exports.createAnnouncement = (req, res) => {
    const { title, message, priority, target_type, target_id, publish_date, expiry_date } = req.body;
    const attachment = req.file ? `/uploads/announcements/${req.file.filename}` : null;

    const sql = `
        INSERT INTO announcements (title, message, priority, target_type, target_id, publish_date, expiry_date, status, attachment)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Published', ?)
    `;
    
    db.query(sql, [title, message, priority, target_type, target_id, publish_date || null, expiry_date || null, attachment], (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to create announcement", error: err.message });
        res.status(201).json({ message: "Announcement published successfully", id: result.insertId });
    });
};

exports.getAllAnnouncements = (req, res) => {
    db.query("SELECT * FROM announcements ORDER BY created_at DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
};

exports.updateAnnouncement = (req, res) => {
    const { id } = req.params;
    const { title, message, priority, target_type, target_id, publish_date, expiry_date, status } = req.body;
    let attachment = req.body.attachment;
    if (req.file) {
        attachment = `/uploads/announcements/${req.file.filename}`;
    }

    const sql = `
        UPDATE announcements 
        SET title=?, message=?, priority=?, target_type=?, target_id=?, publish_date=?, expiry_date=?, status=?, attachment=?
        WHERE id=?
    `;
    
    db.query(sql, [title, message, priority, target_type, target_id, publish_date || null, expiry_date || null, status, attachment, id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Announcement updated successfully" });
    });
};

exports.deleteAnnouncement = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM announcements WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Announcement deleted" });
    });
};

// EMPLOYEE APIs
exports.getEmployeeAnnouncements = async (req, res) => {
    const employeeId = req.user.id;
    try {
        // Get employee details for targeting
        const [emp] = await db.promise().query("SELECT emp_id, department FROM employees WHERE id = ?", [employeeId]);
        if (!emp[0]) return res.status(404).json({ message: "Employee not found" });

        const { emp_id, department } = emp[0];

        // Fetch announcements targeted at this employee
        const sql = `
            SELECT a.*, COALESCE(ar.is_read, 0) as is_read 
            FROM announcements a
            LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.employee_id = ?
            WHERE ((a.target_type = 'All Employees')
               OR (a.target_type = 'Department Wise' AND FIND_IN_SET(?, a.target_id) > 0)
               OR (a.target_type = 'Specific Employee' AND TRIM(a.target_id) = TRIM(?)))
            AND a.status = 'Published'
            AND (a.publish_date IS NULL OR a.publish_date <= CURDATE())
            AND (a.expiry_date IS NULL OR a.expiry_date >= CURDATE())
            ORDER BY a.priority = 'Urgent' DESC, a.created_at DESC
        `;

        const [rows] = await db.promise().query(sql, [employeeId, department, emp_id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.markAsRead = (req, res) => {
    const { id } = req.params; // announcement_id
    const employeeId = req.user.id;

    const sql = `
        INSERT INTO announcement_reads (announcement_id, employee_id, is_read, read_at)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE is_read = 1, read_at = CURRENT_TIMESTAMP
    `;

    db.query(sql, [id, employeeId], (err) => {
        if (err) return res.status(500).json({ message: "Failed to mark as read" });
        res.json({ message: "Marked as read" });
    });
};
