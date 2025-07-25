
import express from "express";
import { createEvaluation } from "../controllers/evaluationController.js";

const router = express.Router();

router.post("/", createEvaluation); 

export default router;
