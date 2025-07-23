// backend/routes/testEmail.js
import express from "express";
import { sendInviteEmail } from "../utils/email.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await sendInviteEmail({
      to: "mirsad.asif@gmail.com", // test email
      name: "Test Candidate",
      message: "This is a test invite email.",
      link: "http://localhost:5173/apply/test",
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    });
    res.json(result);
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
