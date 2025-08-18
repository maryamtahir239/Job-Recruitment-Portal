// controllers/checkinController.js
import crypto from "crypto";
import knex from "../db/knex.js";
import nodemailer from "nodemailer";

// Constants
const OFFICE_LAT = 31.47212;
const OFFICE_LNG = 74.26388;
const OFFICE_RADIUS_METERS = 500;
const CHECKIN_WINDOW_MINUTES = 10;



// --- Send Check-in Email ---
// --- Send Check-in Email ---
export const sendCheckinEmail = async (req, res) => {
  const { candidateId } = req.params;

  try {
    const invite = await knex("application_invites as ai")
      .join("candidates as c", "ai.candidate_id", "c.id")
      .where("ai.candidate_id", candidateId)
      .select("ai.*", "c.email as candidate_email", "c.name as candidate_name")
      .first();

    if (!invite) return res.status(404).json({ error: "Invite not found" });

    // Read interviewDateTime from metadata
    let interviewDateTime = null;
    if (invite.metadata) {
      try {
        const meta =
          typeof invite.metadata === "string"
            ? JSON.parse(invite.metadata)
            : invite.metadata;
        if (meta?.interviewDateTime) {
          interviewDateTime = meta.interviewDateTime;
        }
      } catch (err) {
        console.error("Error parsing metadata:", err);
      }
    }

    if (!interviewDateTime) {
      return res
        .status(400)
        .json({ error: "No interview date/time in metadata" });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");

    // Update DB
     await knex("application_invites")
      .where({ id: invite.id })
      .update({
        checkin_token: token,
        checkin_sent_at: new Date(),
        checkin_mail_status: "sent", // THIS IS CRUCIAL
        interview_start_time: interviewDateTime,
        updated_at: knex.fn.now(),
      });

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const checkInUrl = `${process.env.FRONTEND_URL}/checkin/${token}`;
    const interviewTimeFormatted = new Date(interviewDateTime).toLocaleString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );

    await transporter.sendMail({
      from: `"HR Team" <${process.env.SMTP_USER}>`,
      to: invite.candidate_email,
      subject: "Your Interview Check-In Link",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f9fc; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background-color: #2563eb; color: white; padding: 16px; text-align: center; font-size: 20px; font-weight: bold;">
              Interview Check-In
            </div>
            <div style="padding: 20px; color: #333;">
              <p>Dear <strong>${invite.candidate_name || "Candidate"}</strong>,</p>
              <p>Your interview is scheduled for:</p>
              <p style="font-size: 16px; font-weight: bold; color: #2563eb;">${interviewTimeFormatted}</p>
              <p>Please use the button below to check in when you arrive at the office:</p>
              
              <div style="margin: 25px 0; text-align: center;">
                <a href="${checkInUrl}" 
                  style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
                  Check-In Here
                </a>
              </div>

              <p style="font-size: 14px; color: #555; line-height: 1.6;">
                ⏳ This link will only work <strong>within ${CHECKIN_WINDOW_MINUTES} minutes before and after your scheduled interview time</strong>.
                <br>
                📍 You must also be <strong>within ${OFFICE_RADIUS_METERS} meters</strong> of our office location to check in.
              </p>

              <p style="margin-top: 20px;">We look forward to meeting you!</p>
              <p style="font-weight: bold;">${process.env.COMPANY_NAME || "Symtera Technologies"}</p>
            </div>
          </div>
          <p style="text-align:center; font-size: 12px; color: #888; margin-top: 10px;">
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    });

    

    res.json({ success: true, message: "Check-in mail sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send check-in mail" });
  }
};


// --- Confirm Check-in ---
// --- Confirm Check-in ---
export const confirmCheckin = async (req, res) => {
  const { token } = req.params;
  const { lat, lng } = req.query;

  try {
    const invite = await knex("application_invites as ai")
      .join("candidates as c", "ai.candidate_id", "c.id")
      .where("checkin_token", token)
      .select("ai.*", "c.name as candidate_name")
      .first();

    if (!invite) {
      return res.status(404).json({ statusCode: "invalid_link", error: "Invalid check-in link" });
    }

    // ✅ New: Already checked in check
    if (invite.checkin_status === "arrived" && invite.checked_in_at) {
      return res.status(400).json({
        statusCode: "already_checked_in",
        error: "You have already checked in."
      });
    }

    const now = new Date();
    if (invite.interview_start_time) {
      const scheduled = new Date(invite.interview_start_time);
      const earliest = new Date(scheduled.getTime() - CHECKIN_WINDOW_MINUTES * 60 * 1000);
      const latest = new Date(scheduled.getTime() + CHECKIN_WINDOW_MINUTES * 60 * 1000);

      if (now < earliest) {
        return res.status(400).json({
          statusCode: "too_early",
          error: `Too early. Please check in within ${CHECKIN_WINDOW_MINUTES} minutes before interview.`
        });
      }
      if (now > latest) {
        return res.status(400).json({
          statusCode: "too_late",
          error: "Your Check-in time has passed."
        });
      }
    }

    if (!lat || !lng) {
      return res.status(400).json({
        statusCode: "location_required",
        error: "Location required for check-in"
      });
    }

    const distance = getDistanceFromLatLonInM(
      OFFICE_LAT,
      OFFICE_LNG,
      parseFloat(lat),
      parseFloat(lng)
    );
    if (distance > OFFICE_RADIUS_METERS) {
      return res.status(400).json({
        statusCode: "wrong_location",
        error: "You must be at the office to check in."
      });
    }

    

     // In confirmCheckin function
 await knex("application_invites")
      .where({ id: invite.id })
      .update({
        checkin_status: "arrived",
        checked_in_at: new Date(),
        updated_at: knex.fn.now(),
      });
    const io = req.app.get("io");
    io.emit("candidate-arrived", {
      candidateId: invite.candidate_id,
      candidateName: invite.candidate_name || "Candidate",
      time: new Date().toISOString()
    });

    res.json({
      statusCode: "success",
      success: true,
      message: "Check-in successful. Welcome!"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ statusCode: "server_error", error: "Failed to process check-in" });
  }
};

// Helper function: distance calculation
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
