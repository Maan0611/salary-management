const db = require('../db');
const bcrypt = require('bcryptjs');

// GET /api/employee-portal/dashboard
exports.getDashboardStats = async (req, res) => {
    const employeeId = req.user.id;
    try {
        const stats = {};

        // 1. Attendance Stats (Current Month)
        const currentMonthNum = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const currentYear = new Date().getFullYear().toString();
        
        const [attendance] = await db.promise().query(
            "SELECT status, COUNT(*) as count FROM attendance WHERE emp_id = ? AND MONTH(date) = ? AND YEAR(date) = ? GROUP BY status",
            [employeeId, currentMonthNum, currentYear]
        );
        stats.presentDays = attendance.find(a => a.status === 'Present')?.count || 0;
        stats.absentDays = attendance.find(a => a.status === 'Absent')?.count || 0;
        stats.leaveDays = attendance.find(a => a.status === 'Leave')?.count || 0;
        stats.halfDays = attendance.find(a => a.status === 'Half Day')?.count || 0;
        stats.lateDays = attendance.find(a => a.status === 'Late')?.count || 0;

        // 2. Salary Stats (Current Month + Total Paid)
        const [salary] = await db.promise().query(
            "SELECT status, net_salary FROM salary WHERE employee_id = ? AND month = ? AND year = ?",
            [employeeId, currentMonthNum, currentYear]
        );
        stats.salaryStatus = salary[0]?.status || 'Not Generated';
        stats.currentNetSalary = salary[0]?.net_salary || 0;

        const [totalSalary] = await db.promise().query(
            "SELECT SUM(net_salary) as total FROM salary WHERE employee_id = ? AND status = 'Paid'",
            [employeeId]
        );
        stats.totalEarnings = totalSalary[0]?.total || 0;

        // 3. Leave Stats
        const [leaves] = await db.promise().query(
            "SELECT status, COUNT(*) as count FROM requests WHERE employee_id = ? AND request_type IN ('Leave Request', 'Half Day', 'Casual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity/Paternity') GROUP BY status",
            [employeeId]
        );
        stats.pendingLeaves = leaves.find(l => l.status === 'Pending')?.count || 0;

        // 4. Employee Details (Joining Date + Leave Balance)
        const [emp] = await db.promise().query("SELECT join_date, leave_balance, name FROM employees WHERE id = ?", [employeeId]);
        stats.joinDate = emp[0]?.join_date;
        stats.leaveBalance = emp[0]?.leave_balance || 0;
        stats.name = emp[0]?.name;

        // 5. Unread Notifications Count (Optional check if needed, but keeping for compatibility)
        // ... (removed unreadNotifications logic as per previous user request if you want, but sticking to stats improvement here)

        // 6. Targeted Announcements for Dashboard
        const [empData] = await db.promise().query("SELECT emp_id, department FROM employees WHERE id = ?", [employeeId]);
        if (!empData[0]) return res.status(404).json({ message: "Employee not found" });

        const { emp_id, department } = empData[0];

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

        const [rows] = await db.promise().query(sql + " LIMIT 5", [employeeId, department, emp_id]);
        stats.announcements = rows;

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// PROFILE
exports.getProfile = (req, res) => {
    const employeeId = req.user.id;
    db.query("SELECT * FROM employees WHERE id = ?", [employeeId], (err, result) => {
        if (err || result.length === 0) return res.status(404).json({ message: "Profile not found" });
        res.json(result[0]);
    });
};

exports.updateProfile = (req, res) => {
    const employeeId = req.user.id;
    const { email, phone, address, emergency_contact } = req.body;

    const sql = "UPDATE employees SET email = ?, phone = ?, address = ?, emergency_contact = ? WHERE id = ?";
    db.query(sql, [email, phone, address, emergency_contact, employeeId], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Profile updated successfully" });
    });
};

exports.uploadPhoto = (req, res) => {
    const employeeId = req.user.id;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const photoPath = `/uploads/profiles/${req.file.filename}`;
    db.query("UPDATE employees SET profile_photo = ? WHERE id = ?", [photoPath, employeeId], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update photo path" });
        res.json({ message: "Photo uploaded successfully", photoPath });
    });
};

// NOTIFICATIONS
exports.getNotifications = (req, res) => {
    const employeeId = req.user.id;
    db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [employeeId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
};

exports.markNotificationRead = (req, res) => {
    const { id } = req.params;
    db.query("UPDATE notifications SET is_read = TRUE WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Failed to update notification" });
        res.json({ message: "Notification marked as read" });
    });
};

exports.changePassword = async (req, res) => {
    const employeeId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    db.query("SELECT password FROM employees WHERE id = ?", [employeeId], async (err, result) => {
        if (err || result.length === 0) return res.status(500).json({ message: "Auth error" });

        const storedPassword = result[0].password;
        let isMatch = false;
        if (storedPassword && (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$"))) {
            isMatch = await bcrypt.compare(oldPassword, storedPassword);
        } else {
            isMatch = oldPassword === storedPassword;
        }
        if (!isMatch) return res.status(401).json({ message: "Incorrect old password" });

        const hashed = await bcrypt.hash(newPassword, 10);
        db.query("UPDATE employees SET password = ? WHERE id = ?", [hashed, employeeId], (err) => {
            if (err) return res.status(500).json({ message: "Password update failed" });
            res.json({ message: "Password changed successfully" });
        });
    });
};

// ATTENDANCE HISTORY
exports.getAttendanceHistory = async (req, res) => {
    const employeeId = req.user.id;
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM attendance WHERE emp_id = ? ORDER BY date DESC",
            [employeeId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// SALARY HISTORY
exports.getSalaryHistory = async (req, res) => {
    const employeeId = req.user.id;
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM salary WHERE employee_id = ? ORDER BY year DESC, month DESC",
            [employeeId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// LEAVE STATUS
exports.getLeaveStatus = async (req, res) => {
    const employeeId = req.user.id;
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM requests WHERE employee_id = ? AND request_type IN ('Leave Request', 'Half Day', 'Casual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity/Paternity') ORDER BY created_at DESC",
            [employeeId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// APPLY LEAVE
exports.applyLeave = async (req, res) => {
    const employeeId = req.user.id;
    const { reason, from_date, to_date } = req.body;

    if (!reason || !from_date || !to_date) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const type = req.body.leave_type || 'Leave Request';
        const sql = "INSERT INTO requests (employee_id, request_type, reason, from_date, to_date, status) VALUES (?, ?, ?, ?, ?, 'Pending')";
        await db.promise().query(sql, [employeeId, type, reason, from_date, to_date]);
        res.status(201).json({ message: "Leave request submitted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
