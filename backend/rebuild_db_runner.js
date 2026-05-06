const db = require('./db');
const fs = require('fs');
const path = require('path');

const runRebuild = async () => {
  try {
    console.log("Reading SQL file...");
    const sqlPath = path.join(__dirname, '../rebuild_database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon, but be careful with ENUM values
    // A better way is to use a library or just run the whole thing if the driver supports multiple statements
    // mysql2 supports multiple statements if configured

    console.log("Connecting to database...");

    // We need to enable multiple statements for this connection
    const mysql = require('mysql2/promise');
    require('dotenv').config();

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log(`Connected to ${process.env.DB_NAME} at ${process.env.DB_HOST} ✅`);
    console.log("Executing SQL...");

    await connection.query(sql);

    console.log("Database rebuilt successfully! 🚀");
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("Failed to rebuild database ❌");
    console.error(err.message);
    process.exit(1);
  }
};

runRebuild();
