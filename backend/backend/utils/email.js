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

export async function sendInviteEmail({ to, name, message, link, expiresAt, interviewDateTime }) {
  try {
    const transporter = await getTransporter();

    const expiryStr = new Date(expiresAt).toLocaleString();
    let interviewInfo = "";
    
    if (interviewDateTime) {
      const interviewStr = new Date(interviewDateTime).toLocaleString();
      interviewInfo = `
        <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">📅 Interview Scheduled</h3>
          <p style="margin: 0; color: #0c4a6e;"><strong>Date & Time:</strong> ${interviewStr}</p>
          <p style="margin: 5px 0 0 0; color: #0c4a6e; font-size: 14px;">Please complete your application before the interview.</p>
        </div>
      `;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Job Application Invitation</h2>
        
        <p>Dear ${name || "Candidate"},</p>
        
        <p>${message || "You have been invited to apply for a position. Please complete your job application using the secure link below."}</p>
        
        ${interviewInfo}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Complete Job Application
          </a>
        </div>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            <strong>Important:</strong> This application link will expire on <strong>${expiryStr}</strong>.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have any questions, please contact the HR department.
        </p>
      </div>
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
