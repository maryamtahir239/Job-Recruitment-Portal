// routes/checkinRoutes.js
import express from "express";
import {
  sendCheckinEmail,
  confirmCheckin
} from "../controllers/checkinController.js";

const router = express.Router();

// Send check-in email to a candidate
router.post("/send-checkin/:candidateId", sendCheckinEmail);

// Confirm candidate check-in
router.get("/checkin/:token", confirmCheckin);

export default router;
