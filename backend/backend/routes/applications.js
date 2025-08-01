import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getSubmittedApplications, getAllApplications, getApplicationById, updateApplicationStatus } from "../controllers/applicationsController.js";
import db from "../db/knex.js";

const router = express.Router();

router.get("/", verifyToken, getAllApplications);
router.get("/submitted", verifyToken, getSubmittedApplications);
router.get("/debug", verifyToken, async (req, res) => {
  try {
    const applications = await db("candidate_applications").select("*");
    const candidates = await db("candidates").select("*");
    const invites = await db("application_invites").select("*");
    
    console.log("Debug endpoint called");
    console.log("Applications count:", applications.length);
    console.log("Candidates count:", candidates.length);
    console.log("Invites count:", invites.length);
    
    res.json({
      applications: applications.length,
      candidates: candidates.length,
      invites: invites.length,
      sampleApplication: applications[0] || null,
      sampleCandidate: candidates[0] || null,
      sampleInvite: invites[0] || null,
      allApplications: applications,
      allCandidates: candidates,
      allInvites: invites
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/:id", verifyToken, getApplicationById);
router.put("/:id", verifyToken, updateApplicationStatus);

export default router;
