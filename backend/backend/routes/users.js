// backend/routes/users.js
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";
import adminUsersRouter from "./adminUsers.js";

const router = express.Router();

/**
 * Legacy POST /api/users/create support.
 * Internally forwards to /api/admin/users (SuperAdmin only).
 */
router.post("/create", verifyToken, requireRole("SuperAdmin"), (req, res, next) => {
  // Re-route by calling adminUsers router handler directly
  req.url = "/"; // pretend hitting POST /
  adminUsersRouter.handle(req, res, next);
});

export default router;
