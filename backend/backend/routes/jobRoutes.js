import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  getCandidatesByJobId,
} from "../controllers/jobController.js";

router.get("/", getAllJobs);
router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);
router.get("/:jobId/candidates", getCandidatesByJobId);
export default router;
