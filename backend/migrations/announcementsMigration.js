const db = require('../db');

const setupAnnouncementsTable = () => {
  const announcementsSql = `
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      priority ENUM('Normal', 'Important', 'Urgent') DEFAULT 'Normal',
      target_type ENUM('All Employees', 'Department Wise', 'Specific Employee') DEFAULT 'All Employees',
      target_id VARCHAR(255) DEFAULT NULL,
      publish_date DATE,
      expiry_date DATE,
      attachment VARCHAR(255) DEFAULT NULL,
      status ENUM('Published', 'Draft', 'Expired') DEFAULT 'Published',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const announcementReadsSql = `
    CREATE TABLE IF NOT EXISTS announcement_reads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      announcement_id INT NOT NULL,
      employee_id INT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP NULL DEFAULT NULL,
      FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `;

  db.query(announcementsSql, (err) => {
    if (err) console.error("Error creating announcements table:", err);
    else {
      console.log("Announcements table ready ✅");
      db.query(announcementReadsSql, (err) => {
        if (err) console.error("Error creating announcement_reads table:", err);
        else console.log("Announcement Reads table ready ✅");
      });
    }
  });
};

module.exports = setupAnnouncementsTable;
