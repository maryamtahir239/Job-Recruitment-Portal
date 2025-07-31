import db from "../db/knex.js";

// Get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await db("jobs").orderBy("created_at", "desc");
    res.json(jobs);
  } catch (err) {
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

    const candidates = await db("candidates")
      .where("job_id", jobId)
      .select("id", "name", "email", "phone", "designation", "location", "created_at")
      .orderBy("created_at", "desc"); // Newest candidates first

    // Get invite status for each candidate
    const candidatesWithInviteStatus = await Promise.all(
      candidates.map(async (candidate) => {
        const invite = await db("application_invites")
          .where({ candidate_id: candidate.id, job_id: jobId })
          .whereIn("status", ["sent", "opened", "submitted"])
          .first();
        
        return {
          ...candidate,
          invite_sent: !!invite,
          invite_status: invite ? invite.status : null
        };
      })
    );

    res.status(200).json(candidatesWithInviteStatus);
  } catch (err) {
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
