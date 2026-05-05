const db = require('./db');

const migration = `
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS title VARCHAR(255) AFTER user_id,
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'info' AFTER message;
`;

db.query(migration, (err) => {
    if (err) console.error("Notification table migration failed:", err);
    else console.log("Notification table updated successfully ✅");
    process.exit();
});
