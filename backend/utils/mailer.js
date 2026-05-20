const nodemailer = require("nodemailer");
const dns = require("dns");

// Ensure IPv4 is preferred for stable SMTP resolving on Render
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// A premium reusable wrapper template for a highly polished email experience
const getEmailWrapper = (title, content, actionHtml = "") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background-color: #f1f5f9;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          padding: 40px 32px;
          text-align: center;
          position: relative;
        }
        .logo {
          color: #ffffff;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.05em;
          margin: 0;
          text-transform: uppercase;
        }
        .subtitle {
          color: #818cf8;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          margin-top: 8px;
        }
        .content {
          padding: 48px 32px;
          color: #334155;
          line-height: 1.7;
          font-size: 15px;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }
        .details-box {
          background-color: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 24px;
          margin: 24px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px dashed #e2e8f0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #64748b;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .detail-value {
          color: #0f172a;
          font-weight: 700;
          font-size: 14px;
        }
        .detail-value.highlight {
          color: #4f46e5;
          font-size: 16px;
        }
        .button-container {
          margin-top: 32px;
          text-align: center;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #ffffff !important;
          padding: 16px 36px;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          border-radius: 14px;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          transition: all 0.2s ease-in-out;
        }
        .footer {
          background-color: #f8fafc;
          padding: 32px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #f1f5f9;
        }
        .footer p {
          margin: 6px 0;
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-radius: 8px;
        }
        .badge-success {
          background-color: #d1fae5;
          color: #065f46;
        }
        .badge-danger {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .badge-warning {
          background-color: #fef3c7;
          color: #92400e;
        }
        .badge-indigo {
          background-color: #e0e7ff;
          color: #3730a3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">NEXUS HR</h1>
          <div class="subtitle">Enterprise Workforce System</div>
        </div>
        <div class="content">
          ${content}
          ${actionHtml}
        </div>
        <div class="footer">
          <p>This is an automated system email from Nexus HR Portal.</p>
          <p>&copy; ${new Date().getFullYear()} Nexus Enterprise Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 1. Welcome Email
const sendWelcomeEmail = async (to, name, email, tempPassword, portalLink) => {
  const content = `
    <h2 class="title">Welcome to the Nexus Family!</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are absolutely thrilled to welcome you to our organization. Your employee account has been successfully configured and activated.</p>
    <p>Please utilize the secure credentials supplied below to login to your Employee Portal, update your profile, and synchronize your attendance dashboard:</p>
    
    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">Portal URL</span>
        <span class="detail-value"><a href="${portalLink}" style="color: #4f46e5; text-decoration: none;">${portalLink}</a></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Login Username</span>
        <span class="detail-value">${email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Temporary Password</span>
        <span class="detail-value" style="font-family: monospace; letter-spacing: 0.1em; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span>
      </div>
    </div>
    
    <p style="color: #ef4444; font-size: 13px; font-weight: 700; margin-top: 16px;">
      ⚠️ IMPORTANT: For safety reasons, please proceed to change your password immediately in the "Settings" panel of your dashboard upon your initial login.
    </p>
  `;

  const actionHtml = `
    <div class="button-container">
      <a href="${portalLink}" class="button" target="_blank">Access Employee Portal</a>
    </div>
  `;

  const mailOptions = {
    from: `"Nexus HR" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to Nexus HR - Your Employee Portal Account is Ready!",
    html: getEmailWrapper("Welcome to Nexus HR", content, actionHtml),
  };

  return transporter.sendMail(mailOptions);
};

// 2. Leave Approval / Rejection Email
const sendLeaveStatusEmail = async (to, name, requestType, status, fromDate, toDate, adminRemarks) => {
  const isApproved = status.toLowerCase() === "approved";
  const badgeClass = isApproved ? "badge-success" : "badge-danger";
  const formattedFrom = new Date(fromDate).toLocaleDateString("en-US", { dateStyle: "long" });
  const formattedTo = toDate ? new Date(toDate).toLocaleDateString("en-US", { dateStyle: "long" }) : formattedFrom;

  const content = `
    <h2 class="title">Leave Request Decision</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are writing to notify you that the administrative review of your recent leave request has been completed.</p>
    
    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">Request Type</span>
        <span class="detail-value">${requestType}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Leave Period</span>
        <span class="detail-value">${formattedFrom} - ${formattedTo}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Decision Status</span>
        <span class="detail-value"><span class="badge ${badgeClass}">${status.toUpperCase()}</span></span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Manager's Remarks</span>
        <span class="detail-value" style="font-style: italic; color: #475569;">"${adminRemarks || 'No remarks provided.'}"</span>
      </div>
    </div>
    
    <p>For more details on your leave balances, check the "My Leave" panel inside your dashboard portal.</p>
  `;

  const mailOptions = {
    from: `"Nexus HR" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Leave Request Notification: ${status.toUpperCase()} - ${requestType}`,
    html: getEmailWrapper("Leave Request Decision", content),
  };

  return transporter.sendMail(mailOptions);
};

// 3. Password Reset OTP Email
const sendOTPEmail = async (to, otp) => {
  const content = `
    <h2 class="title">Password Reset Authorization</h2>
    <p>A request was recently logged in our system to perform a security credentials reset for your email address.</p>
    <p>Please utilize the secure, 6-digit One-Time Password (OTP) supplied below to complete the reset workflow:</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; font-size: 36px; font-weight: 900; letter-spacing: 0.25em; color: #4f46e5; background-color: #e0e7ff; padding: 16px 36px; border-radius: 16px; font-family: monospace; border: 2px solid #c7d2fe;">
        ${otp}
      </div>
    </div>
    
    <div class="details-box" style="text-align: center; background-color: #fffbeb; border: 1px solid #fef3c7;">
      <span style="font-weight: 700; color: #b45309; font-size: 13px;">
        ⏳ Security Notice: This code is highly confidential and will expire in <strong>5 minutes</strong>.
      </span>
    </div>
    
    <p style="color: #64748b; font-size: 13px;">
      If you did not initiate this request, you can safely ignore this email. Your credentials remain safe, and your account is secure.
    </p>
  `;

  const mailOptions = {
    from: `"Nexus Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Password: Secure OTP Verification Code",
    html: getEmailWrapper("Password Reset Authorization", content),
  };

  return transporter.sendMail(mailOptions);
};

// 4. Announcement Email
const sendAnnouncementEmail = async (to, title, message, priority, attachmentUrl = null) => {
  let badgeColor = "badge-indigo";
  if (priority.toLowerCase() === "urgent") badgeColor = "badge-danger";
  else if (priority.toLowerCase() === "important") badgeColor = "badge-warning";

  let attachmentLinkHtml = "";
  if (attachmentUrl) {
    // Render absolute attachment URL
    const cleanUrl = attachmentUrl.startsWith("http") ? attachmentUrl : `${process.env.BACKEND_URL || 'http://localhost:5000'}${attachmentUrl}`;
    attachmentLinkHtml = `
      <div style="margin-top: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 13px; font-weight: 600; color: #475569;">Paperwork / Reference Attachment</span>
        <a href="${cleanUrl}" target="_blank" style="font-size: 12px; font-weight: 700; color: #4f46e5; text-decoration: none;">Download File &rarr;</a>
      </div>
    `;
  }

  const content = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span class="badge ${badgeColor}">${priority.toUpperCase()}</span>
    </div>
    <h2 class="title" style="margin-top: 10px;">${title}</h2>
    
    <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 18px; font-style: italic; color: #1e293b; border-radius: 0 12px 12px 0; margin-bottom: 24px; line-height: 1.8;">
      ${message.replace(/\n/g, "<br />")}
    </div>
    
    ${attachmentLinkHtml}
    
    <p>Please login to your portal system if you wish to acknowledge this announcement as read.</p>
  `;

  const mailOptions = {
    from: `"Nexus Announcements" <${process.env.EMAIL_USER}>`,
    to,
    subject: `[Company Announcement] ${priority.toUpperCase()}: ${title}`,
    html: getEmailWrapper("Nexus Company Announcement", content),
  };

  return transporter.sendMail(mailOptions);
};

// 5. Salary Slip Email (with attachment)
const sendSalaryEmail = async (to, name, month, year, bonus, deduction, netSalary, pdfBuffer, filename) => {
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[parseInt(month) - 1] || month;

  const content = `
    <h2 class="title">Salary Slip Released</h2>
    <p>Dear <strong>${name}</strong>,</p>
    <p>We are pleased to inform you that your compensation payroll has been compiled and completed for the period of <strong>${monthName} ${year}</strong>.</p>
    <p>Your net salary has been authorized and dispatched to your registered financial institution account. A summary breakdown is available below:</p>
    
    <div class="details-box">
      <div class="detail-row">
        <span class="detail-label">Employee Name</span>
        <span class="detail-value">${name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payroll Month</span>
        <span class="detail-value">${monthName} ${year}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Performance Bonus</span>
        <span class="detail-value" style="color: #10b981;">+₹${parseFloat(bonus || 0).toLocaleString('en-IN')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Deductions</span>
        <span class="detail-value" style="color: #ef4444;">-₹${parseFloat(deduction || 0).toLocaleString('en-IN')}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Net Take Home Pay</span>
        <span class="detail-value highlight">₹${parseFloat(netSalary).toLocaleString('en-IN')}</span>
      </div>
    </div>
    
    <p>Your comprehensive digital payslip PDF is attached directly to this email notification for your compliance records.</p>
  `;

  const mailOptions = {
    from: `"Nexus Payroll" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Payslip Notification: ${monthName} ${year} Compensation Summary`,
    html: getEmailWrapper("Salary Slip Released", content),
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  transporter,
  sendWelcomeEmail,
  sendLeaveStatusEmail,
  sendOTPEmail,
  sendAnnouncementEmail,
  sendSalaryEmail,
};
