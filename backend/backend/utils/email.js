// backend/utils/email.js
import nodemailer from "nodemailer";

let cachedTransport = null;
let cachedTestAccount = null;

async function getTransporter() {
  if (cachedTransport) return cachedTransport;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const hasSMTP = SMTP_HOST && SMTP_USER && SMTP_PASS;

  if (hasSMTP) {
    console.log("ℹ️ Using real SMTP provider:", SMTP_HOST, "as user:", SMTP_USER);

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
      console.log("✅ SMTP connected successfully.");
    } catch (err) {
      console.error("❌ SMTP verify failed:", err);
    }

    return cachedTransport;
  }

  // Fallback: Ethereal
  console.log("⚠️ No SMTP credentials found, using Ethereal test account...");
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
  console.log("ℹ️ Ethereal test account ready.");
  return cachedTransport;
}

export async function sendInviteEmail({ to, name, message, link, expiresAt }) {
  try {
    console.log(`📨 Attempting to send email to: ${to}`);
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

    console.log(`✅ Email sent successfully to ${to} | MessageID: ${info.messageId}`);
    if (cachedTestAccount) {
      console.log(`🔗 Ethereal preview: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Email send error to ${to}:`, err);
    return { success: false, error: err.message };
  }
}
