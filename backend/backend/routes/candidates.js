// backend/backend/routes/candidates.js
import express from "express";
import { importCandidates, getAllCandidates } from "../controllers/candidatesController.js";

const router = express.Router();
router.get("/", getAllCandidates);
router.post("/import", importCandidates);

export default router;
