const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4, // Force IPv4 connection to solve ENETUNREACH on Render
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : ''
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// Verify SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP Connection Error ❌:", error);
    } else {
        console.log("SMTP Server Ready to Send Emails ✅");
    }
});

const sendEmail = async (options) => {
    try {
        console.log(`Sending email to: ${options.to}`);
        const mailOptions = {
            from: `"Nexus HR" <${process.env.EMAIL_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            attachments: options.attachments || []
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true, info };
    } catch (error) {
        console.error('Email error: ', error);
        return { success: false, error };
    }
};

const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: white; border-radius: 0 0 20px 20px; }
        .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
        .content { padding: 30px; background: white; margin: -20px 20px 20px 20px; border-radius: 12px; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .info-card { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .status-pill { padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .approved { background: #dcfce7; color: #166534; }
        .rejected { background: #fee2e2; color: #991b1b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">NEXUS HR</div>
            <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">Enterprise Management System</div>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Nexus HR Solutions. All rights reserved.<br>
            Tech Park, Sector 62, Noida, India
        </div>
    </div>
</body>
</html>
`;

exports.sendSalaryEmail = async (employee, salaryData, pdfBuffer) => {
    const html = getBaseTemplate(`
        <h2 style="color: #1f2937;">Salary Payslip - ${salaryData.month} ${salaryData.year}</h2>
        <p>Dear <strong>${employee.name}</strong>,</p>
        <p>Your salary for the month of <strong>${salaryData.month} ${salaryData.year}</strong> has been processed.</p>
        
        <div class="info-card">
            <table style="width: 100%;">
                <tr><td><strong>Basic Salary:</strong></td><td style="text-align: right;">₹${salaryData.basic_salary.toLocaleString()}</td></tr>
                <tr><td><strong>Bonus:</strong></td><td style="text-align: right; color: #059669;">+₹${salaryData.bonus.toLocaleString()}</td></tr>
                <tr><td><strong>Overtime:</strong></td><td style="text-align: right; color: #059669;">+₹${salaryData.overtime.toLocaleString()}</td></tr>
                <tr><td><strong>Deductions:</strong></td><td style="text-align: right; color: #dc2626;">-₹${(salaryData.deduction + salaryData.tax).toLocaleString()}</td></tr>
                <tr style="border-top: 1px solid #ccc;"><td style="padding-top: 10px;"><strong>Net Payout:</strong></td><td style="text-align: right; padding-top: 10px; font-size: 18px; color: #4f46e5;"><strong>₹${salaryData.net_salary.toLocaleString()}</strong></td></tr>
            </table>
        </div>
        
        <p>Please find your detailed payslip attached to this email.</p>
        <p style="font-size: 12px; color: #6b7280;">If you have any queries regarding your compensation, please reach out to the HR department.</p>
    `);

    return sendEmail({
        to: employee.email,
        subject: `Salary Slip - ${salaryData.month} ${salaryData.year}`,
        html,
        attachments: [{
            filename: `Payslip_${salaryData.month}_${salaryData.year}.pdf`,
            content: pdfBuffer
        }]
    });
};

exports.sendLeaveStatusEmail = async (employee, leaveData) => {
    const isApproved = leaveData.status === 'Approved';
    const html = getBaseTemplate(`
        <h2 style="color: #1f2937;">Leave Request Update</h2>
        <p>Dear <strong>${employee.name}</strong>,</p>
        <p>Your leave request for <strong>${leaveData.request_type}</strong> has been updated.</p>
        
        <div class="info-card">
            <p><strong>Period:</strong> ${new Date(leaveData.from_date).toLocaleDateString()} to ${new Date(leaveData.to_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-pill ${isApproved ? 'approved' : 'rejected'}">${leaveData.status}</span></p>
            ${leaveData.admin_remark ? `<p><strong>Remarks:</strong> ${leaveData.admin_remark}</p>` : ''}
        </div>
        
        <p>Thank you for using the Nexus HR Portal.</p>
    `);

    return sendEmail({
        to: employee.email,
        subject: `Leave Request ${leaveData.status}`,
        html
    });
};

exports.sendOTPEmail = async (email, name, otp) => {
    const html = getBaseTemplate(`
        <h2 style="color: #1f2937;">Password Reset Verification</h2>
        <p>Hello ${name || 'User'},</p>
        <p>We received a request to reset your password. Use the following 6-digit OTP to proceed:</p>
        
        <div style="text-align: center; padding: 20px; background: #f3f4f6; border-radius: 12px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>
        
        <p><strong>Note:</strong> This OTP is valid for 5 minutes only. If you did not request this reset, please ignore this email.</p>
    `);

    return sendEmail({
        to: email,
        subject: "Password Reset OTP - Nexus HR",
        html
    });
};
