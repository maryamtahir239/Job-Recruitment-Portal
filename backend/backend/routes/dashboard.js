import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getInterviewerDashboardStats,
  getHRDashboardStats,
 
} from "../controllers/dashboardController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/dashboard/interviewer-stats - Get interviewer dashboard statistics
router.get("/interviewer-stats", getInterviewerDashboardStats);

// GET /api/dashboard/hr-stats - Get HR dashboard statistics
router.get("/hr-stats", getHRDashboardStats);

// GET /api/dashboard/interviewer - Get interviewer dashboard


export default router; 