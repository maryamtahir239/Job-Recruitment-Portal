import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  assignCandidatesToJob,
  getCandidatesByJobId,
} from "../controllers/jobController.js";

router.get("/", getAllJobs);
router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
router.get("/:jobId/candidates", getCandidatesByJobId);
