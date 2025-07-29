// backend/utils/email.js
import nodemailer from "nodemailer";

let cachedTransport = null;
let cachedTestAccount = null;

async function getTransporter() {
  if (cachedTransport) return cachedTransport;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const hasSMTP = SMTP_HOST && SMTP_USER && SMTP_PASS;

  if (hasSMTP) {
    cachedTransport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false, // STARTTLS
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    try {
      await cachedTransport.verify();
    } catch (err) {
      // Removed all console.log and console.error statements
    }

    return cachedTransport;
  }

  // Fallback: Ethereal
  cachedTestAccount = await nodemailer.createTestAccount();
  cachedTransport = nodemailer.createTransport({
    host: cachedTestAccount.smtp.host,
    port: cachedTestAccount.smtp.port,
    secure: cachedTestAccount.smtp.secure,
    auth: {
      user: cachedTestAccount.user,
      pass: cachedTestAccount.pass,
    },
  });
  return cachedTransport;
}

export async function sendInviteEmail({ to, name, message, link, expiresAt }) {
  try {
    const transporter = await getTransporter();

    const expiryStr = new Date(expiresAt).toLocaleString();
    const html = `
      <p>Dear ${name || "Candidate"},</p>
      <p>${message || "Please complete your job application using the secure link below."}</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 16px;background:#0EA5E9;color:#fff;text-decoration:none;border-radius:4px;"> Complete Job Application</a></p>
      <p>This link expires on <strong>${expiryStr}</strong>.</p>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || SMTP_USER || "hr@example.com",
      to,
      subject: "Job Application Invite",
      html,
    });

    if (cachedTestAccount) {
      // Removed all console.log and console.error statements
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    // Removed all console.log and console.error statements
    return { success: false, error: err.message };
  }
}
