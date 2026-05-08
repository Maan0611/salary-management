require('dotenv').config();
const db = require('./db');

async function checkColumnType() {
    try {
        const [rows] = await db.promise().query("DESCRIBE employees");
        const balance = rows.find(r => r.Field === 'leave_balance');
        console.log("Leave Balance Column Details:");
        console.table([balance]);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkColumnType();
