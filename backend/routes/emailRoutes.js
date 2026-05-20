const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../db");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");
const { 
  sendSalaryEmail, 
  sendLeaveStatusEmail, 
  sendAnnouncementEmail, 
  sendWelcomeEmail 
} = require("../utils/mailer");

// Multer memory storage (loads upload directly into memory buffer, no disk pollution)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// All routes here are admin-only secure routes
router.use(verifyToken);
router.use(isAdmin);

// 1. POST /api/email/send-salary
router.post("/send-salary", upload.single("pdf"), async (req, res) => {
  const { salary_id } = req.body;

  if (!salary_id) {
    return res.status(400).json({ message: "Salary record ID is required." });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Salary slip PDF attachment is required." });
  }

  try {
    // Fetch salary and employee details from database
    const [records] = await db.promise().query(
      `SELECT s.*, e.name, e.email 
       FROM salary s 
       JOIN employees e ON s.employee_id = e.id 
       WHERE s.id = ?`,
      [salary_id]
    );

    if (records.length === 0) {
      return res.status(404).json({ message: "Salary record not found." });
    }

    const { email, name, month, year, bonus, deduction, net_salary } = records[0];

    if (!email) {
      return res.status(400).json({ message: "Employee does not have a registered email address." });
    }

    // Send email with PDF buffer attachment
    await sendSalaryEmail(
      email,
      name,
      month,
      year,
      bonus,
      deduction,
      net_salary,
      req.file.buffer,
      req.file.originalname
    );

    res.json({ message: `Salary slip email successfully dispatched to ${email}!` });
  } catch (err) {
    console.error("Failed to send salary slip email:", err);
    res.status(500).json({ message: "Failed to dispatch salary slip email.", error: err.message });
  }
});

// 2. POST /api/email/send-leave-status
router.post("/send-leave-status", async (req, res) => {
  const { requestId } = req.body;

  if (!requestId) {
    return res.status(400).json({ message: "Request ID is required." });
  }

  try {
    const [requests] = await db.promise().query(
      `SELECT r.*, e.name, e.email 
       FROM requests r 
       JOIN employees e ON r.employee_id = e.id 
       WHERE r.id = ?`,
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    const { email, name, request_type, status, from_date, to_date, admin_remark } = requests[0];

    if (!email) {
      return res.status(400).json({ message: "Employee does not have a registered email address." });
    }

    await sendLeaveStatusEmail(
      email,
      name,
      request_type,
      status,
      from_date,
      to_date,
      admin_remark
    );

    res.json({ message: `Leave status email successfully sent to ${email}!` });
  } catch (err) {
    console.error("Failed to send leave status email:", err);
    res.status(500).json({ message: "Failed to dispatch leave status email.", error: err.message });
  }
});

// 3. POST /api/email/send-announcement
router.post("/send-announcement", async (req, res) => {
  const { title, message, priority } = req.body;

  if (!title || !message || !priority) {
    return res.status(400).json({ message: "Title, message, and priority are required." });
  }

  try {
    const [employees] = await db.promise().query("SELECT email FROM employees WHERE status = 'Active'");

    if (employees.length === 0) {
      return res.json({ message: "No active employees found to notify." });
    }

    let dispatchedCount = 0;
    for (const emp of employees) {
      try {
        await sendAnnouncementEmail(emp.email, title, message, priority);
        dispatchedCount++;
      } catch (mailErr) {
        console.error(`Failed to send announcement to ${emp.email}:`, mailErr.message);
      }
    }

    res.json({ message: `Announcement successfully emailed to ${dispatchedCount} active employees!` });
  } catch (err) {
    console.error("Failed to distribute announcement emails:", err);
    res.status(500).json({ message: "Failed to dispatch announcement emails.", error: err.message });
  }
});

// 4. POST /api/email/send-welcome
router.post("/send-welcome", async (req, res) => {
  const { employeeId, tempPassword } = req.body;

  if (!employeeId) {
    return res.status(400).json({ message: "Employee ID is required." });
  }

  try {
    const [employees] = await db.promise().query("SELECT * FROM employees WHERE id = ?", [employeeId]);

    if (employees.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const { email, name } = employees[0];
    const portalLink = req.get('origin') || "http://localhost:3000";

    await sendWelcomeEmail(
      email,
      name,
      email,
      tempPassword || "Temporary123", // fallback password if not provided
      portalLink
    );

    res.json({ message: `Welcome email successfully sent to ${email}!` });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    res.status(500).json({ message: "Failed to dispatch welcome email.", error: err.message });
  }
});

module.exports = router;
