// backend/backend/routes/invites.js
import express from "express";
import {
  bulkSendInvites,
  validateInvite,
  submitApplication,
} from "../controllers/invitesController.js";

const router = express.Router();
router.post("/bulk", bulkSendInvites);
router.get("/:token/validate", validateInvite);
router.post("/:token/submit", submitApplication);

export default router;
