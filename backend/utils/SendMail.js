const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL || process.env.EMAIL,
      to: email,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${subject}`);
  } catch (error) {
    console.error("Error sending email:", error);
    // Log but don't throw to avoid breaking the main process if email fails
  }
};

module.exports = sendEmail;
