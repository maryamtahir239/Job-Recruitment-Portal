import express from "express";
import { createEvaluation, getEvaluations } from "../controllers/evaluationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add authentication middleware to all evaluation routes
router.use(verifyToken);

router.post("/", createEvaluation);  // to handle evaluation submission
router.get("/", getEvaluations);     // ✅ this is to fetch evaluations

export default router;
