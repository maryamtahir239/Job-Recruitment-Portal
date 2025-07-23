// backend/backend/routes/candidates.js
import express from "express";
import { importCandidates } from "../controllers/candidatesController.js";

const router = express.Router();
router.post("/import", importCandidates);

export default router;
