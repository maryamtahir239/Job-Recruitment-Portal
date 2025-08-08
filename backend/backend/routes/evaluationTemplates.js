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

// Test endpoint to check user role
router.get("/test-role", (req, res) => {
  res.json({ 
    message: "Role test", 
    user: req.user,
    role: req.user?.role,
    hasRole: !!req.user?.role
  });
});

// Test endpoint to check available roles in database
router.get("/check-roles", async (req, res) => {
  try {
    const knex = (await import('../db/knex.js')).default;
    const users = await knex("users").select("id", "name", "email", "role");
    res.json({ 
      message: "Available roles in database",
      users: users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to check roles", details: err.message });
  }
});

// Routes accessible by SuperAdmin only
router.get("/", requireRole("SuperAdmin"), getEvaluationTemplates);
router.get("/:id", requireRole("SuperAdmin"), getEvaluationTemplateById);
router.post("/", requireRole("SuperAdmin"), createEvaluationTemplate);
router.put("/:id", requireRole("SuperAdmin"), updateEvaluationTemplate);
router.delete("/:id", requireRole("SuperAdmin"), deleteEvaluationTemplate);

// Route accessible by Interviewers and HR to get template for a specific job
router.get("/job/:jobId", requireRole("Interviewer", "HR", "SuperAdmin"), getEvaluationTemplateByJobId);

export default router; 