const db = require('../db');

db.query("SELECT id, emp_id, name, email FROM employees", (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.table(result);
    }
    process.exit();
});
