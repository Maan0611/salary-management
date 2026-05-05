const db = require('../db');

/**
 * Send a notification to a user
 * @param {number} userId - The ID of the user to notify
 * @param {string} message - The notification message
 * @param {string} title - The notification title
 * @param {string} type - The notification type (info, success, warning, danger)
 */
exports.sendNotification = (userId, message, title = "System Notification", type = "info") => {
    const sql = "INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)";
    db.query(sql, [userId, title, message, type], (err) => {
        if (err) console.error("Failed to send notification:", err);
    });
};

/**
 * Send a notification to all admins
 * @param {string} message - The notification message
 * @param {string} title - The notification title
 */
exports.notifyAdmins = (message, title = "Admin Alert") => {
    db.query("SELECT id FROM users WHERE role = 'admin'", (err, admins) => {
        if (err) return console.error("Error fetching admins for notification", err);
        
        const values = admins.map(admin => [admin.id, title, message, 'info', 0]);
        if (values.length > 0) {
            db.query("INSERT INTO notifications (user_id, title, message, type, is_read) VALUES ?", [values], (err) => {
                if (err) console.error("Failed to notify admins:", err);
            });
        }
    });
};
