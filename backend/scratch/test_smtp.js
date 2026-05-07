const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("Testing SMTP with:");
console.log("User:", process.env.EMAIL_USER);
console.log("Pass:", process.env.EMAIL_PASS ? "PRESENT (hidden)" : "MISSING");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : ''
    },
    connectionTimeout: 10000,
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Verification Failed:");
        console.error(error);
    } else {
        console.log("✅ SMTP Server is ready!");
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to self for testing
            subject: "SMTP Test",
            text: "This is a test email."
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("❌ Mail Send Failed:");
                console.error(err);
            } else {
                console.log("✅ Email sent successfully!");
                console.log(info.response);
            }
            process.exit();
        });
    }
});
