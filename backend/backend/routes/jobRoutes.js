import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getCandidatesByJobId,
  uploadCandidatesForJob,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
router.get("/:jobId/candidates", getCandidatesByJobId);
router.post("/:jobId/upload-candidates", uploadCandidatesForJob);

export default router;
