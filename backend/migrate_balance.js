require('dotenv').config();
const db = require('./db');

async function migrateColumn() {
    try {
        console.log("Changing leave_balance to DECIMAL(5,2)...");
        await db.promise().query("ALTER TABLE employees MODIFY COLUMN leave_balance DECIMAL(5,2) DEFAULT 12.00");
        console.log("Migration successful.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err.message);
        process.exit(1);
    }
}

migrateColumn();
