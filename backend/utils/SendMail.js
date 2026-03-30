const nodemailer = require("nodemailer");

let transporter;

const getMailConfig = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.NODEMAILER_EMAIL;
  const smtpPass = process.env.SMTP_PASS || process.env.NODEMAILER_PASS;
  const smtpSecure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  const hasCustomSmtpConfig = Boolean(smtpHost && smtpUser && smtpPass);
  const hasGmailConfig = Boolean(
    process.env.NODEMAILER_EMAIL && process.env.NODEMAILER_PASS
  );

  if (hasCustomSmtpConfig) {
    return {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    };
  }

  if (hasGmailConfig) {
    return {
      service: "Gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    };
  }

  return null;
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const mailConfig = getMailConfig();

  if (!mailConfig) {
    throw new Error(
      "Mail service is not configured. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS or NODEMAILER_EMAIL/NODEMAILER_PASS in backend/.env."
    );
  }

  transporter = nodemailer.createTransport(mailConfig);
  return transporter;
};

const sendEmail = async (email, subject, html, text) => {
  const mailTransporter = getTransporter();
  const fromAddress =
    process.env.MAIL_FROM || process.env.SMTP_USER || process.env.NODEMAILER_EMAIL;

  const mailOptions = {
    from: fromAddress,
    to: email,
    subject,
    html,
    text,
  };

  const info = await mailTransporter.sendMail(mailOptions);
  console.log(`Email sent successfully: ${subject} (${info.messageId})`);
  return info;
};

module.exports = sendEmail;
