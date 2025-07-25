
import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import adminUserRoutes from "./routes/adminUsers.js";
import inviteRoutes from "./routes/invites.js";
import candidateRoutes from "./routes/candidates.js";
import testEmailRoutes from "./routes/testEmail.js";
import evaluationRoutes from "./routes/evaluationRoutes.js"; 
import path from "path"; // Import path module for __dirname

dotenv.config();
const app = express();

// Middleware
app.use(cors());
// express.json() parses application/json requests.
// It should be placed before your routes that expect JSON.
// It does NOT parse multipart/form-data. Multer handles that.
app.use(express.json());


// Serve static files from the 'uploads' directory
// This makes files accessible via a URL like http://localhost:3001/uploads/applications/your-file.png
// Make sure 'uploads' directory exists at the root of your backend project.
app.use("/uploads", express.static(path.join(process.cwd(), 'uploads')));


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/invites", inviteRoutes); // Your invites route, where submitApplication is handled
app.use("/api/candidates", candidateRoutes);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/evaluation", evaluationRoutes); 

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(500).send('Something broke!');
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

