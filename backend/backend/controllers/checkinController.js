// controllers/checkinController.js
import crypto from "crypto";
import knex from "../db/knex.js";
import nodemailer from "nodemailer";
import { sendCheckinEmailTemplate } from "../utils/email.js";

// Constants (configurable via ENV)
function getNumberEnv(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === "") return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

const OFFICE_LAT = getNumberEnv("OFFICE_LAT", 31.47212);
const OFFICE_LNG = getNumberEnv("OFFICE_LNG", 74.26388);
const OFFICE_RADIUS_METERS = getNumberEnv("OFFICE_RADIUS_METERS", 500);
// Additional tolerance to account for GPS drift/indoor positioning
const LOCATION_TOLERANCE_METERS = getNumberEnv("LOCATION_TOLERANCE_METERS", 100);
const CHECKIN_WINDOW_MINUTES = getNumberEnv("CHECKIN_WINDOW_MINUTES", 10);



// Robust date parser that respects timezone if present and treats naive strings as local time
function parseScheduledDate(raw) {
  try {
    if (!raw) return null;
    if (raw instanceof Date) return raw;
    if (typeof raw === "number") return new Date(raw);
    if (typeof raw === "string") {
      const s = raw.trim();
      // If contains explicit timezone (Z or +hh:mm/-hh:mm), trust native parser
      if (/Z$|[+-]\d{2}:?\d{2}$/.test(s)) {
        const d = new Date(s);
        if (!isNaN(d.getTime())) return d;
      }
      // Normalize space to 'T' for ISO-like parsing
      const withT = s.replace(" ", "T");
      const d2 = new Date(withT);
      if (!isNaN(d2.getTime())) return d2;
      // Manual fallback: YYYY-MM-DD[ T]HH:mm[:ss]
      const m = s.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
      if (m) {
        const [, y, mo, da, h, mi, se] = m;
        return new Date(Number(y), Number(mo) - 1, Number(da), Number(h), Number(mi), se ? Number(se) : 0);
      }
    }
    const d3 = new Date(raw);
    return isNaN(d3.getTime()) ? null : d3;
  } catch (_) {
    return null;
  }
}

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
    const parsedInterviewDate = parseScheduledDate(interviewDateTime) || interviewDateTime;
     await knex("application_invites")
      .where({ id: invite.id })
      .update({
        checkin_token: token,
        checkin_sent_at: new Date(),
        checkin_mail_status: "sent", // THIS IS CRUCIAL
        interview_start_time: parsedInterviewDate,
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
      // Respect timezone info if present and support naive local strings
      const raw = scheduledFromMeta || invite.interview_start_time;
      const scheduled = parseScheduledDate(raw);
      if (!scheduled) {
        return res.status(400).json({
          statusCode: "server_error",
          error: "Invalid interview schedule format"
        });
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

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const distance = getDistanceFromLatLonInM(
      OFFICE_LAT,
      OFFICE_LNG,
      userLat,
      userLng
    );
    if (distance > (OFFICE_RADIUS_METERS + LOCATION_TOLERANCE_METERS)) {
      return res.status(400).json({
        statusCode: "wrong_location",
        error: "You must be at the office to check in.",
        details: {
          office: { lat: OFFICE_LAT, lng: OFFICE_LNG },
          received: { lat: userLat, lng: userLng },
          distanceMeters: Math.round(distance),
          allowedMeters: OFFICE_RADIUS_METERS + LOCATION_TOLERANCE_METERS,
        }
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
