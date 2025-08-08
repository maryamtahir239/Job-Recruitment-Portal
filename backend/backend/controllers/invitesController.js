// backend/controllers/invitesController.js
import db from "../db/knex.js";
import { generateInviteToken, hashInviteToken } from "../utils/token.js";
import { sendInviteEmail } from "../utils/email.js";
import multer from "multer";
import path from "path";
import fs from "fs";

function resolveExpiry({ expiryDays, expiryDate }) {
  if (expiryDate) {
    const d = new Date(expiryDate);
    if (!isNaN(d)) return d;
  }
  const days = Number(expiryDays) || 4;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export const bulkSendInvites = async (req, res) => {
  const { candidateIds, jobId, expiryDays, expiryDate, message, interviewDateTime } = req.body;

  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return res.status(400).json({ error: "candidateIds required" });
  }

  if (!jobId) {
    return res.status(400).json({ error: "jobId required" });
  }

  try {
    const expiresAt = resolveExpiry({ expiryDays, expiryDate });
    const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const results = [];

    const candidates = await db("candidates").whereIn("id", candidateIds);
    const now = db.fn.now();

    for (const cand of candidates) {
      if (!cand.email) {
        results.push({ candidateId: cand.id, error: "missing_email" });
        continue;
      }

      const { token, tokenHash } = generateInviteToken();
      const [inviteId] = await db("application_invites").insert({
        candidate_id: cand.id,
        job_id: jobId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        status: "sent",
        sent_at: now,
        metadata: JSON.stringify({
          message: message || null,
          interviewDateTime: interviewDateTime || null,
          sentVia: "bulk_invite",
          jobId: jobId
        }),
        created_at: now,
        updated_at: now,
      });

      const link = `${frontendBase}/apply/${token}`;
      const emailRes = await sendInviteEmail({
        to: cand.email,
        name: cand.name || cand.first_name || "Candidate",
        message,
        link,
        expiresAt,
        interviewDateTime,
      });

      results.push({
        candidateId: cand.id,
        inviteId,
        link,
        emailSuccess: emailRes.success,
        error: emailRes.success ? null : emailRes.error,
      });
    }

    const sent = results.filter((r) => r.emailSuccess).length;
    const failed = results.length - sent;

    res.json({ success: failed === 0, sent, failed, results });
  } catch (err) {
    res.status(500).json({ error: "Failed to send invites" });
  }
};

export const validateInvite = async (req, res) => {
  const { token } = req.params;
  const tokenHash = hashInviteToken(token);

  try {
    const invite = await db("application_invites").where({ token_hash: tokenHash }).first();
    if (!invite) return res.status(404).json({ error: "Invalid link" });
    if (new Date() > invite.expires_at) return res.status(410).json({ error: "Link expired" });

    // Mark as opened if not already
    if (!invite.opened_at) {
      await db("application_invites")
        .where({ id: invite.id })
        .update({ opened_at: db.fn.now(), status: "opened" });
    }

    const cand = await db("candidates").where({ id: invite.candidate_id }).first();
    if (!cand) return res.status(404).json({ error: "Candidate not found" });

    return res.json({
      invite: {
        id: invite.id,
        token: token,
        expiresAt: invite.expires_at,
        status: invite.status, // THIS IS THE CRUCIAL LINE!
        candidate: {
          id: cand.id,
          name: cand.name,
          email: cand.email,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/applications";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  },
});

const upload = multer({ storage });

export const submitApplication = [
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  async (req, res) => {
    const { token } = req.params;
    let payload;

    try {
      payload = JSON.parse(req.body.payload);

      if (!payload || !payload.personal || !payload.personal.full_name) {
          return res.status(400).json({ error: "Incomplete application data." });
      }

      const tokenHash = hashInviteToken(token);

      const invite = await db("application_invites").where({ token_hash: tokenHash }).first();
      if (!invite) return res.status(404).json({ error: "Invalid link" });
      if (new Date() > invite.expires_at) return res.status(410).json({ error: "Link expired" });
      if (invite.status === "submitted") return res.status(409).json({ error: "Application already submitted" });

      const photoPath = req.files?.photo?.[0]?.path || null;
      const resumePath = req.files?.resume?.[0]?.path || null;

      const applicationData = {
        invite_id: invite.id,
        candidate_id: invite.candidate_id,
        job_id: invite.job_id, // Add the job_id from the invite
        payload: JSON.stringify({ ...payload, files: { photo: photoPath, resume: resumePath } }),
        is_complete: true,
        photo_filename: photoPath,
        resume_filename: resumePath,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      };

      await db("candidate_applications").insert(applicationData);

      await db("application_invites")
        .where({ id: invite.id })
        .update({
          submitted_at: db.fn.now(),
          status: "submitted",
          updated_at: db.fn.now(),
        });

      res.json({ success: true, message: "Application submitted successfully" });
    } catch (err) {
      if (err instanceof SyntaxError && err.message.includes("JSON")) {
          return res.status(400).json({ error: "Invalid form data format." });
      }
      res.status(500).json({ error: "Server error" });
    }
  },
];