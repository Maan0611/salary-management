const db = require('./db');

db.query("DESCRIBE users", (err, result) => {
    if (err) console.error(err);
    else console.log(result);
    process.exit();
});
