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
import inviteRoutes from "./routes/invites.js";
import candidateRoutes from "./routes/candidates.js";
import testEmailRoutes from "./routes/testEmail.js";
import evaluationRoutes from "./routes/evaluation.js"; 
import applicationRoutes from "./routes/applications.js";
import jobRoutes from "./routes/jobRoutes.js";

// Use routes with base paths
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/evaluation", evaluationRoutes); 
app.use("/api/applications", applicationRoutes);
app.use("/api/jobs", jobRoutes);

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
