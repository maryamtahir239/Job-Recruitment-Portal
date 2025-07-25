
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

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/invites", inviteRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/evaluation", evaluationRoutes); 

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
