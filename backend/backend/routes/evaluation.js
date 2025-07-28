import express from "express";
import { createEvaluation, getEvaluations } from "../controllers/evaluationController.js";

const router = express.Router();

router.post("/", createEvaluation);  // to handle evaluation submission
router.get("/", getEvaluations);     // ✅ this is to fetch evaluations

export default router;
