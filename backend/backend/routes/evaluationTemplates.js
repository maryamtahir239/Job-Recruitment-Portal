import express from "express";
import { 
  getEvaluationTemplates, 
  getEvaluationTemplateById, 
  getEvaluationTemplateByJobId,
  createEvaluationTemplate, 
  updateEvaluationTemplate, 
  deleteEvaluationTemplate 
} from "../controllers/evaluationTemplateController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Routes accessible by SuperAdmin only
router.get("/", requireRole("SuperAdmin"), getEvaluationTemplates);
router.get("/:id", requireRole("SuperAdmin"), getEvaluationTemplateById);
router.post("/", requireRole("SuperAdmin"), createEvaluationTemplate);
router.put("/:id", requireRole("SuperAdmin"), updateEvaluationTemplate);
router.delete("/:id", requireRole("SuperAdmin"), deleteEvaluationTemplate);

// Route accessible by Interviewers and HR to get template for a specific job
router.get("/job/:jobId", requireRole(["Interviewer", "HR", "SuperAdmin"]), getEvaluationTemplateByJobId);

export default router; 