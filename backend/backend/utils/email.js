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

// Helper to format date as '22/ August/2025, 12:00 AM' from date and time string, no seconds
function formatDateTimeLocal(dateString) {
  if (!dateString) return '';
  // Accepts 'YYYY-MM-DDTHH:mm:ss' or 'YYYY-MM-DDTHH:mm' or Date object
  let d;
  if (typeof dateString === 'string') {
    // If string, parse as local
    const [datePart, timePart] = dateString.split('T');
    if (datePart && timePart) {
      const [year, month, day] = datePart.split('-');
      const [hour, minute] = timePart.split(':');
      d = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute)
      );
    } else {
      d = new Date(dateString);
    }
  } else {
    d = dateString;
  }
  if (isNaN(d)) return '';
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('default', { month: 'long' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formatted = `${day}/ ${month}/${year}, ${hours}:${minutes} ${ampm}`;
  console.log('EMAIL DEBUG: formatted date/time:', formatted);
  return formatted;
}

export async function sendInviteEmail({ to, name, message, link, expiresAt, interviewDateTime }) {
  try {
    const transporter = await getTransporter();
    // Format expiry and interview date/time
    const expiryStr = formatDateTimeLocal(expiresAt);
    let interviewInfo = "";
    if (interviewDateTime) {
      const interviewStr = formatDateTimeLocal(interviewDateTime);
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
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "hr@example.com",
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

export async function sendCheckinEmailTemplate({ to, name, link, interviewDateTime, windowMinutes = 10, radiusMeters = 500 }) {
  try {
    const transporter = await getTransporter();
    const interviewStr = interviewDateTime ? formatDateTimeLocal(interviewDateTime) : null;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Interview Check-In</h2>
        <p>Dear ${name || "Candidate"},</p>
        ${interviewStr ? `<p>Your interview is scheduled for <strong>${interviewStr}</strong>.</p>` : ""}
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Check-In Here
          </a>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; color: #374151;">
          <p style="margin: 0; font-size: 14px;">
            ⏳ This link works only within <strong>${windowMinutes} minutes before and after</strong> your scheduled interview time.<br/>
            📍 You must be within <strong>${radiusMeters} meters</strong> of our office to check in.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">We look forward to meeting you!</p>
      </div>
    `;
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "hr@example.com",
      to,
      subject: "Interview Check-In Link",
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
