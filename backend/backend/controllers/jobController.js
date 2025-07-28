import db from "../db/knex.js";

// Get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await db("jobs").orderBy("created_at", "desc");
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// Create a new job
export const createJob = async (req, res) => {
  try {
    const { title, department, openings, status, deadline } = req.body;
    if (!title || !deadline) {
      return res.status(400).json({ error: "Title and deadline are required" });
    }

    const [id] = await db("jobs").insert({ title, department, openings, status, deadline });
    const newJob = await db("jobs").where({ id }).first();

    res.status(201).json(newJob);
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ error: "Failed to create job" });
  }
};

// Update a job
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db("jobs").where({ id }).update(updates);
    if (!updated) return res.status(404).json({ error: "Job not found" });

    const job = await db("jobs").where({ id }).first();
    res.json(job);
  } catch (err) {
    console.error("Error updating job:", err);
    res.status(500).json({ error: "Failed to update job" });
  }
};

// Delete a job
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db("jobs").where({ id }).del();
    if (!deleted) return res.status(404).json({ error: "Job not found" });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
};


// controllers/jobController.js (add this)
export const getCandidatesByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    const candidates = await db("candidate_applications")
      .where("job_id", jobId)
      .select("id", "full_name", "email", "status", "created_at");

    res.status(200).json(candidates);
  } catch (err) {
    console.error("Error fetching candidates by job ID:", err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};
