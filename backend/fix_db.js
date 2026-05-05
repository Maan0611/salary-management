const db = require('./db');

const testAnnouncements = () => {
  const sql = `
        INSERT INTO announcements (title, message, priority, target_type, target_id, publish_date, expiry_date, status, attachment)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Published', ?)
    `;
    
  db.query(sql, ['Title', 'Message', 'Normal', 'All Employees', '', null, null, null], (err, result) => {
      console.log("Announcements insert err:", err ? err.message : "Success");
      process.exit(0);
  });
};

const alterRequests = () => {
    db.query("ALTER TABLE requests MODIFY COLUMN request_type ENUM('Leave Request', 'Half Day', 'Work From Home', 'Salary Advance', 'Profile Update', 'Casual Leave', 'Sick Leave', 'Emergency Leave', 'Maternity/Paternity') NOT NULL", (err, res) => {
        console.log("Requests alter err:", err ? err.message : "Success");
        testAnnouncements();
    });
};

alterRequests();
