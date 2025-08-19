// controllers/checkinController.js
import crypto from "crypto";
import knex from "../db/knex.js";
import nodemailer from "nodemailer";
import { sendCheckinEmailTemplate } from "../utils/email.js";

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

    // Send email (reuse same design language as invite)
    const checkInUrl = `${process.env.FRONTEND_URL}/checkin/${token}`;
    await sendCheckinEmailTemplate({
      to: invite.candidate_email,
      name: invite.candidate_name,
      link: checkInUrl,
      interviewDateTime,
      windowMinutes: CHECKIN_WINDOW_MINUTES,
      radiusMeters: OFFICE_RADIUS_METERS,
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
    // Prefer the original metadata timestamp (what HR scheduled) to avoid timezone drift
    let scheduledFromMeta = null;
    try {
      if (invite.metadata) {
        const meta = typeof invite.metadata === "string" ? JSON.parse(invite.metadata) : invite.metadata;
        if (meta?.interviewDateTime) scheduledFromMeta = meta.interviewDateTime;
      }
    } catch (_) {}

    if (invite.interview_start_time || scheduledFromMeta) {
      // Normalize to local time if an ISO UTC string is encountered
      let raw = scheduledFromMeta || invite.interview_start_time;
      let scheduled;
      if (typeof raw === "string") {
        const normalized = /Z$/.test(raw) ? raw.replace(/Z$/, "") : raw;
        scheduled = new Date(normalized);
      } else {
        scheduled = new Date(raw);
      }
      // Compute time difference in the server's local timezone
      const deltaMs = now.getTime() - scheduled.getTime();
      const windowMs = CHECKIN_WINDOW_MINUTES * 60 * 1000;

      // Outside the valid window → decide based on whether current time is before or after scheduled
      if (Math.abs(deltaMs) > windowMs) {
        if (deltaMs >= 0) {
          return res.status(400).json({
            statusCode: "too_late",
            error: "Your Check-in time has passed."
          });
        } else {
          return res.status(400).json({
            statusCode: "too_early",
            error: `Too early. Please check in within ${CHECKIN_WINDOW_MINUTES} minutes before interview.`
          });
        }
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
