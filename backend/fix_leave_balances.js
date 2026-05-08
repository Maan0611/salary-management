require('dotenv').config({ path: './backend/.env' });
const db = require('../backend/db');

async function checkLeaveBalances() {
    try {
        const [rows] = await db.promise().query("SELECT id, name, leave_balance FROM employees");
        console.log("Current Leave Balances:");
        console.table(rows);
        
        const zeros = rows.filter(r => r.leave_balance === 0);
        if (zeros.length > 0) {
            console.log(`Found ${zeros.length} employees with 0 leave balance. Updating to 12...`);
            await db.promise().query("UPDATE employees SET leave_balance = 12 WHERE leave_balance = 0");
            console.log("Update successful.");
        } else {
            console.log("No employees found with 0 leave balance.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLeaveBalances();
