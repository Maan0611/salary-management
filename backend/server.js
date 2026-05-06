const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const employeePortalRoutes = require("./routes/employeePortalRoutes");
const requestRoutes = require("./routes/requestRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/profiles", express.static(path.join(__dirname, "uploads/profiles")));
app.use("/uploads/announcements", express.static(path.join(__dirname, "uploads/announcements")));

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/employee-portal", employeePortalRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/announcements", announcementRoutes);

const db = require("./db");
const bcrypt = require("bcryptjs");

const initDB = async () => {
  try {
    const queries = [
      // Users Table (Admin)
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role ENUM('admin', 'employee') DEFAULT 'admin',
        profile_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      // Employees Table
      `CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        emp_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(100),
        position VARCHAR(100),
        basic_salary DECIMAL(10,2),
        join_date DATE,
        leave_balance INT DEFAULT 12,
        status ENUM('Active', 'Inactive', 'Terminated') DEFAULT 'Active',
        phone VARCHAR(20),
        address TEXT,
        emergency_contact VARCHAR(100),
        profile_photo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      // Attendance Table
      `CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        emp_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Present',
        check_in VARCHAR(20),
        check_out VARCHAR(20),
        notes TEXT,
        FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE
      )`
    ];

    for (const q of queries) {
      await db.promise().query(q);
    }
    console.log("Core tables verified ✅");

    // Check if admin exists, if not create one
    const [admins] = await db.promise().query("SELECT * FROM users WHERE role = 'admin'");
    if (admins.length === 0) {
      const hashedPw = await bcrypt.hash("123456", 10);
      await db.promise().query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin", "admin@gmail.com", hashedPw, "admin"]
      );
      console.log("Default admin created (admin@gmail.com / 123456) 👤");
    }
  } catch (err) {
    console.error("Database initialization error ❌:", err.message);
  }
};
initDB();

// Initialize Automated Cron Jobs
const initSalaryCron = require("./utils/salaryCron");
initSalaryCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});