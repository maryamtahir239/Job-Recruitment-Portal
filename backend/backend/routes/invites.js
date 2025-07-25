// backend/routes/invites.js
import express from "express";
import {
  bulkSendInvites,
  validateInvite,
  submitApplication,
} from "../controllers/invitesController.js";

const router = express.Router();

// Send invites to multiple candidates
router.post("/bulk", bulkSendInvites);

// Validate token and return invite + candidate data
router.get("/:token/validate", validateInvite);

// Submit filled application form
router.post("/:token/submit", submitApplication);

export default router;
