import db from "../db/knex.js";

// Get all jobs
export const getAllJobs = async (req, res) => {
  console.log("getAllJobs called");
  try {
    const jobs = await db("jobs").orderBy("created_at", "desc");
    console.log("Returning jobs:", jobs.length);
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// Get a single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await db("jobs").where({ id }).first();
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

// Create a new job
export const createJob = async (req, res) => {
  try {
    const { 
      title, 
      department, 
      openings, 
      status, 
      deadline, 
      description, 
      requirements, 
      salary_range, 
      location, 
      job_type 
    } = req.body;
    
    if (!title || !deadline) {
      return res.status(400).json({ error: "Title and deadline are required" });
    }

    const jobData = {
      title,
      department,
      openings: openings || 1,
      status: status || "Active",
      deadline,
      description,
      requirements,
      salary_range,
      location,
      job_type: job_type || "Full-time"
    };

    const [id] = await db("jobs").insert(jobData);
    const newJob = await db("jobs").where({ id }).first();

    res.status(201).json(newJob);
  } catch (err) {
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
    res.status(500).json({ error: "Failed to delete job" });
  }
};


// Get candidates by job ID
export const getCandidatesByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Get candidates with all invite and check-in information
    const candidates = await db("candidates as c")
      .leftJoin("application_invites as ai", function() {
        this.on("c.id", "=", "ai.candidate_id")
          .andOn("ai.job_id", "=", db.raw("?", [jobId])); // Replaced knex with db
      })
      .where("c.job_id", jobId)
      .select(
        "c.id",
        "c.name",
        "c.email",
        "c.phone",
        "c.designation",
        "c.location",
        "c.created_at",
        "ai.status as invite_status",
        "ai.checkin_mail_status",
        "ai.checkin_status",
        "ai.checkin_token",
        "ai.checkin_sent_at",
        "ai.checked_in_at",
        "ai.sent_at as invite_sent_at",
        db.raw("CASE WHEN ai.id IS NOT NULL THEN true ELSE false END as invite_sent")
      )
      .orderBy("c.created_at", "desc");

    res.status(200).json(candidates);
  } catch (err) {
    console.error("Error fetching candidates:", err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

// Upload candidates for a specific job
export const uploadCandidatesForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { candidates } = req.body;

    if (!jobId || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ error: "Job ID and candidates array are required" });
    }

    // Validate job exists
    const job = await db("jobs").where({ id: jobId }).first();
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Process candidates and add job_id
    const candidatesWithJobId = candidates.map(candidate => ({
      name: candidate.full_name || candidate.name,
      email: candidate.email,
      phone: candidate.phone || null,
      designation: candidate.current_status || candidate.designation || null,
      location: candidate.location || null,
      job_id: jobId
    }));



    // Remove duplicates based on email AND job_id (same candidate can be in different jobs)
    const uniqueCandidates = candidatesWithJobId.filter((candidate, index, self) => 
      index === self.findIndex(c => c.email === candidate.email && c.job_id === candidate.job_id)
    );

    // Check for existing candidates for this job and filter them out
    const candidatesToInsert = [];
    const existingCandidates = [];
    
    for (const candidate of uniqueCandidates) {
      const existing = await db("candidates")
        .where({ email: candidate.email, job_id: candidate.job_id })
        .first();
      
      if (existing) {
        existingCandidates.push(candidate);
      } else {
        candidatesToInsert.push(candidate);
      }
    }

    // Insert only new candidates
    let insertedCandidates = [];
    if (candidatesToInsert.length > 0) {
      try {
        insertedCandidates = await db("candidates").insert(candidatesToInsert);
      } catch (insertError) {
        // If there's a constraint violation, try inserting one by one
        if (insertError.code === 'ER_DUP_ENTRY') {
          const successfulInserts = [];
          for (const candidate of candidatesToInsert) {
            try {
              const [id] = await db("candidates").insert(candidate);
              successfulInserts.push(id);
            } catch (individualError) {
            }
          }
          insertedCandidates = successfulInserts;
        } else {
          throw insertError;
        }
      }
    }

    const totalProcessed = uniqueCandidates.length;
    const newlyInserted = candidatesToInsert.length;
    const alreadyExists = existingCandidates.length;
    
    res.status(201).json({ 
      success: true, 
      message: `Successfully uploaded ${newlyInserted} new candidates. ${alreadyExists} candidates already exist for this job.`,
      candidates: insertedCandidates,
      stats: {
        totalProcessed,
        newlyInserted,
        alreadyExists
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload candidates" });
  }
};
