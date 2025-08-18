import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import "./setup-uploads.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server for socket.io

// Socket.io setup
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});
app.set("io", io); // make io accessible in routes/controllers if needed

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import adminUserRoutes from "./routes/adminUsers.js";
import userProfileRoutes from "./routes/userProfile.js";
import dashboardRoutes from "./routes/dashboard.js";
import inviteRoutes from "./routes/invites.js";
import candidateRoutes from "./routes/candidates.js";
import testEmailRoutes from "./routes/testEmail.js";
import evaluationRoutes from "./routes/evaluation.js";
import evaluationTemplateRoutes from "./routes/evaluationTemplates.js";
import applicationRoutes from "./routes/applications.js";
import jobRoutes from "./routes/jobRoutes.js";
import checkinRoutes from "./routes/checkinRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/evaluation", evaluationRoutes);
app.use("/api/evaluation-templates", evaluationTemplateRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/checkin", checkinRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Socket.IO connection event
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0',  () => console.log(`🚀 Server running on port ${PORT}`));
