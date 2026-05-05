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

// Database Initialization (Attendance Table)
const db = require("./db");
const initDB = () => {
  const attendanceTable = `
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      emp_id INT NOT NULL,
      date DATE NOT NULL,
      status ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Present',
      check_in VARCHAR(20),
      check_out VARCHAR(20),
      notes TEXT,
      FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE
    )
  `;
  db.query(attendanceTable, (err) => {
    if (err) console.error("Error creating attendance table:", err);
    else console.log("Attendance table verified ✅");
  });
};
initDB();

// Initialize Automated Cron Jobs
const initSalaryCron = require("./utils/salaryCron");
initSalaryCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});