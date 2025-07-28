import express from "express";
import { getSubmittedApplications } from "../controllers/applicationsController.js";

const router = express.Router();

router.get("/submitted", getSubmittedApplications);

export default router;
