import formidable from "formidable";
import fs from "fs";
import path from "path";
import db from "@/lib/db";
import { getInviteByToken } from "@/lib/invites";

// Disable Next.js body parsing for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const form = formidable({ multiples: false, uploadDir: "./public/uploads", keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ error: "File upload error" });
    }

    const { token } = req.query;

    const invite = await getInviteByToken(token);
    if (!invite) return res.status(400).json({ error: "Invalid invite token" });

    try {
      const payload = JSON.parse(fields.payload);

      // Store file names if uploaded
      const photo = files.photo ? path.basename(files.photo[0].filepath) : null;
      const resume = files.resume ? path.basename(files.resume[0].filepath) : null;

      if (photo) payload.personal.photo = photo;
      if (resume) payload.personal.resume = resume;

      // Save to DB
      await db("candidate_applications").insert({
        invite_id: invite.id,
        candidate_id: invite.candidate_id,
        job_id: invite.job_id,
        payload: JSON.stringify(payload),
        is_complete: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error saving application:", error);
      return res.status(500).json({ error: "Submission failed" });
    }
  });
}
