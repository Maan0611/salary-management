const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendSalaryEmail, sendLeaveStatusEmail } = require('../utils/sendEmail');

// POST /api/email/send-salary
router.post('/send-salary', async (req, res) => {
    const { salaryId } = req.body;
    
    try {
        const query = `
            SELECT s.*, e.name, e.email 
            FROM salary s 
            JOIN employees e ON s.employee_id = e.id 
            WHERE s.id = ?
        `;
        
        db.query(query, [salaryId], async (err, result) => {
            if (err || result.length === 0) {
                console.error("Salary Email Error: Record not found", err);
                return res.status(404).json({ message: "Salary record not found" });
            }
            
            const data = result[0];
            console.log(`Attempting to send salary email to: ${data.email}`);

            const emailResult = await sendSalaryEmail(
                { name: data.name, email: data.email },
                { 
                    month: data.month, 
                    year: data.year, 
                    basic_salary: data.basic_salary,
                    bonus: data.bonus,
                    overtime: data.overtime,
                    deduction: data.deduction,
                    tax: data.tax,
                    net_salary: data.net_salary
                },
                null 
            );

            if (emailResult.success) {
                console.log("Salary Email Sent Successfully ✅");
                res.json({ message: "Salary slip email sent successfully to " + data.email });
            } else {
                console.error("Salary Email Failed ❌:", emailResult.error);
                res.status(500).json({ message: "Failed to send email: " + emailResult.error });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/email/send-leave-status
router.post('/send-leave-status', async (req, res) => {
    const { requestId } = req.body;
    
    try {
        const query = `
            SELECT r.*, e.name, e.email 
            FROM requests r 
            JOIN employees e ON r.employee_id = e.id 
            WHERE r.id = ?
        `;
        
        db.query(query, [requestId], async (err, result) => {
            if (err || result.length === 0) {
                console.error("Leave Email Error: Record not found", err);
                return res.status(404).json({ message: "Request not found" });
            }
            
            const data = result[0];
            console.log(`Attempting to send leave status email to: ${data.email}`);

            const emailResult = await sendLeaveStatusEmail(
                { name: data.name, email: data.email },
                { 
                    request_type: data.request_type,
                    from_date: data.from_date,
                    to_date: data.to_date,
                    status: data.status,
                    admin_remark: data.admin_remark
                }
            );

            if (emailResult.success) {
                console.log("Leave Email Sent Successfully ✅");
                res.json({ message: "Leave status email sent successfully to " + data.email });
            } else {
                console.error("Leave Email Failed ❌:", emailResult.error);
                res.status(500).json({ message: "Failed to send email: " + emailResult.error });
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
