import express from "express";
import { getSubmittedApplications, getAllApplications } from "../controllers/applicationsController.js";

const router = express.Router();

router.get("/", getAllApplications);
router.get("/submitted", getSubmittedApplications);

export default router;
