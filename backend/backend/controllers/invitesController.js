// backend/controllers/invitesController.js
import db from "../db/knex.js";
import { generateInviteToken, hashInviteToken } from "../utils/token.js";
import { sendInviteEmail } from "../utils/email.js";

function resolveExpiry({ expiryDays, expiryDate }) {
  if (expiryDate) {
    const d = new Date(expiryDate);
    if (!isNaN(d)) return d;
  }
  const days = Number(expiryDays) || 4;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export const bulkSendInvites = async (req, res) => {
  const { candidateIds, expiryDays, expiryDate, message } = req.body;
  console.log("▶ bulkSendInvites called with candidateIds:", candidateIds);

  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    return res.status(400).json({ error: "candidateIds required" });
  }

  try {
    const expiresAt = resolveExpiry({ expiryDays, expiryDate });
    const frontendBase = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const results = [];

    const candidates = await db("candidates").whereIn("id", candidateIds);
    const now = db.fn.now();

    for (const cand of candidates) {
      console.log(`→ Processing candidate: ${cand.email}`);
      if (!cand.email) {
        results.push({ candidateId: cand.id, error: "missing_email" });
        continue;
      }

      const { token, tokenHash } = generateInviteToken();
      const [inviteId] = await db("application_invites").insert({
        candidate_id: cand.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        status: "sent",
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
    console.error("bulkSendInvites error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const validateInvite = async (req, res) => {
  const { token } = req.params;
  const tokenHash = hashInviteToken(token);

  try {
    const invite = await db("application_invites").where({ token_hash: tokenHash }).first();
    if (!invite) return res.status(404).json({ error: "Invalid link" });
    if (new Date() > invite.expires_at) return res.status(410).json({ error: "Link expired" });

    if (!invite.opened_at) {
      await db("application_invites")
        .where({ id: invite.id })
        .update({ opened_at: db.fn.now(), status: "opened" });
    }

    const cand = await db("candidates").where({ id: invite.candidate_id }).first();
    return res.json({
      inviteId: invite.id,
      candidate: { id: cand.id, name: cand.name, email: cand.email },
      expiresAt: invite.expires_at,
      formVersion: "ST-HR-F-001 v6.0",
    });
  } catch (err) {
    console.error("validateInvite error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const submitApplication = async (req, res) => {
  const { token } = req.params;
  const payload = req.body;
  const tokenHash = hashInviteToken(token);

  try {
    const invite = await db("application_invites").where({ token_hash: tokenHash }).first();
    if (!invite) return res.status(404).json({ error: "Invalid link" });
    if (new Date() > invite.expires_at) return res.status(410).json({ error: "Link expired" });

    await db("candidate_applications").insert({
      invite_id: invite.id,
      candidate_id: invite.candidate_id,
      form_version: "ST-HR-F-001 v6.0",
      payload: JSON.stringify(payload),
      is_complete: true,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    await db("application_invites")
      .where({ id: invite.id })
      .update({
        submitted_at: db.fn.now(),
        status: "submitted",
        updated_at: db.fn.now(),
      });

    res.json({ success: true, message: "Application submitted" });
  } catch (err) {
    console.error("submitApplication error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
