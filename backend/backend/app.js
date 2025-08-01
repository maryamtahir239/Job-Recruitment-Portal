// app.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Serve static files (e.g. resumes, photos) from 'uploads' folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import adminUserRoutes from "./routes/adminUsers.js";
import userProfileRoutes from "./routes/userProfile.js";
import inviteRoutes from "./routes/invites.js";
import candidateRoutes from "./routes/candidates.js";
import testEmailRoutes from "./routes/testEmail.js";
import evaluationRoutes from "./routes/evaluation.js";
import applicationRoutes from "./routes/applications.js";
import jobRoutes from "./routes/jobRoutes.js";

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Use routes with base paths
app.use("/api/auth", authRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/jobs", jobRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  console.log("404 - Route not found:", req.method, req.path);
  console.log("Available routes:");
  console.log("- GET /api/applications");
  console.log("- PUT /api/applications/:id");
  res.status(404).json({ error: "Route not found" });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: "Internal server error" });
});

// Add uncaught exception handler
process.on('uncaughtException', (err) => {
  process.exit(1);
});

// Add unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
