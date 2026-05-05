const cron = require('node-cron');
const db = require('../db');
const { notifyAdmins } = require('./notificationHelper');

/**
 * Automatically generate Draft salary records on the 1st of every month
 */
const initSalaryCron = () => {
    // Schedule for 00:00 on day 1 of every month
    // Format: minute hour day-of-month month day-of-week
    cron.schedule('0 0 1 * *', async () => {
        console.log('--- RUNNING MONTHLY SALARY GENERATION CRON ---');
        
        const now = new Date();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear().toString();

        try {
            // 1. Get all active employees
            const [employees] = await db.promise().query("SELECT id, basic_salary FROM employees WHERE status = 'Active'");
            
            if (employees.length === 0) return console.log('No active employees found for payroll.');

            // 2. Check if records already exist for this month
            const [existing] = await db.promise().query("SELECT employee_id FROM salary WHERE month = ? AND year = ?", [month, year]);
            const existingIds = existing.map(e => e.employee_id);

            const toGenerate = employees.filter(emp => !existingIds.includes(emp.id));

            if (toGenerate.length === 0) return console.log('Salary already generated for all employees this month.');

            // 3. Insert new records as Draft
            const values = toGenerate.map(emp => [
                emp.id, month, year, emp.basic_salary, 0, 0, 0, 0, emp.basic_salary, 'Draft'
            ]);

            const sql = "INSERT INTO salary (employee_id, month, year, basic_salary, bonus, overtime, deduction, tax, net_salary, status) VALUES ?";
            await db.promise().query(sql, [values]);

            // 4. Notify Admins
            notifyAdmins(`Automated: New salary drafts generated for ${month}/${year} for ${toGenerate.length} staff members.`, "Auto Payroll Generated");
            
            console.log(`Successfully auto-generated ${toGenerate.length} salary records.`);
        } catch (err) {
            console.error('CRON ERROR: Failed to generate salaries automatically:', err);
        }
    });
    
    console.log('✅ Salary Generation Cron initialized (Monthly on the 1st)');
};

module.exports = initSalaryCron;
