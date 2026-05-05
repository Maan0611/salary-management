const db = require('./db');

const updateSalaryTable = async () => {
    console.log("Starting Salary Table Migration (Safe Mode)...");
    
    // Check current columns
    db.query("DESCRIBE salary", async (err, columns) => {
        if (err) {
            console.error("Error describing table", err);
            process.exit(1);
        }
        
        const columnNames = columns.map(c => c.Field);
        const queries = [];
        
        // 1. Modify status
        queries.push("ALTER TABLE salary MODIFY COLUMN status ENUM('Draft', 'Approved', 'Paid', 'Rejected', 'Pending') DEFAULT 'Draft'");
        
        // 2. Add columns if they don't exist
        if (!columnNames.includes('approved_by')) {
            queries.push("ALTER TABLE salary ADD COLUMN approved_by INT DEFAULT NULL");
        }
        if (!columnNames.includes('approved_at')) {
            queries.push("ALTER TABLE salary ADD COLUMN approved_at DATETIME DEFAULT NULL");
        }
        if (!columnNames.includes('remarks')) {
            queries.push("ALTER TABLE salary ADD COLUMN remarks TEXT DEFAULT NULL");
        }
        if (!columnNames.includes('is_modified')) {
            queries.push("ALTER TABLE salary ADD COLUMN is_modified TINYINT(1) DEFAULT 0");
        }
        
        // 3. Update existing records
        queries.push("UPDATE salary SET status = 'Draft' WHERE status = 'Pending'");

        for (let sql of queries) {
            try {
                await new Promise((resolve, reject) => {
                    db.query(sql, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log(`Executed: ${sql.substring(0, 50)}...`);
            } catch (error) {
                console.error(`Error executing query: ${sql}`, error);
            }
        }
        
        console.log("Migration completed!");
        process.exit();
    });
};

updateSalaryTable();
