// backend/backend/routes/candidates.js
import express from "express";
import { importCandidates, getAllCandidates, updateEvaluationStatus } from "../controllers/candidatesController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add authentication middleware to all candidate routes
router.use(verifyToken);

router.get("/", getAllCandidates);
router.post("/import", importCandidates);
router.put("/:id/evaluation-status", updateEvaluationStatus);

export default router;
