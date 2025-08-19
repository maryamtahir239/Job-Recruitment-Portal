import db from "../db/knex.js";

export const getAllApplications = async (req, res) => {
  console.log("getAllApplications called");
  try {
    const rows = await db("candidate_applications as ca")
      .leftJoin("application_invites as ai", "ca.invite_id", "ai.id")
      .select(
        "ca.*",
        "ai.checkin_status" // Add checkin_status from application_invites
      )
      .orderBy("ca.created_at", "desc");
    console.log("Raw applications from database:", rows);
    
    const parsedRows = rows.map((row) => {
      let payload = {};
      try {
        payload = JSON.parse(row.payload);
      } catch (err) {
        console.error("Error parsing payload:", err);
      }

      return {
        id: row.id,
        full_name: payload.personal?.full_name || "",
        email: payload.personal?.email || "",
        phone: payload.personal?.phone || "",
        date_of_birth: payload.personal?.date_of_birth || "",
        gender: payload.personal?.gender || "",
        current_status: payload.personal?.current_status || "",
        education: payload.education || [],
        experience: payload.experience || [],
        references: payload.references || [],
        photo_url: payload.files?.photo || "",
        resume_url: payload.files?.resume || "",
        job_id: row.job_id,
        status: row.status || "Applied",
        evaluation_status: row.evaluation_status || "pending",
        checkin_status: row.checkin_status || "pending",
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });
    
    res.json(parsedRows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

export const getSubmittedApplications = async (req, res) => {
  try {
    const rows = await db("candidate_applications")
      .where({ is_complete: true })
      .orderBy("created_at", "desc");

    const parsedRows = rows.map((row) => {
      let payload = {};
      try {
        payload = JSON.parse(row.payload);
      } catch (err) {
        console.error("Error parsing payload:", err);
      }

      return {
  id: row.id,
  ...payload.personal,
  education: payload.education || [],
  experience: payload.experience || [],
  references: payload.references || [],
  photo: payload.files?.photo || "",
  resume: payload.files?.resume || "",
  date: row.created_at,
};

    });

    res.json(parsedRows);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const applicationId = parseInt(id);
    
    console.log("getApplicationById called with ID:", applicationId);

    const row = await db("candidate_applications")
      .where({ id: applicationId })
      .first();

    console.log("Database query result:", row);

    if (!row) {
      console.log("Application not found in database");
      return res.status(404).json({ error: "Application not found" });
    }

    let payload = {};
    try {
      payload = JSON.parse(row.payload);
    } catch (err) {
      console.error("Error parsing payload:", err);
    }

    console.log("Raw payload:", payload); // Debug the full payload structure
    console.log("Photo URL from payload:", payload.files?.photo); // Debug photo URL specifically
    console.log("Resume URL from payload:", payload.files?.resume); // Debug resume URL specifically
    
    const application = {
      id: row.id,
      // Personal Information
      full_name: payload.personal?.full_name || "",
      father_name: payload.personal?.father_name || "",
      cnic: payload.personal?.cnic || "",
      email: payload.personal?.email || "",
      phone: payload.personal?.phone || "",
      date_of_birth: payload.personal?.dob || "",
      gender: payload.personal?.gender || "",
      address: payload.personal?.address || "",
      city: payload.personal?.city || "",
      province: payload.personal?.province || "",
      nationality: payload.personal?.nationality || "",
      marital_status: payload.personal?.marital_status || "",
      emergency_contact_name: payload.personal?.emergency_contact_name || "",
      emergency_contact_phone: payload.personal?.emergency_contact_phone || "",
      current_status: payload.personal?.current_status || "",
      
      // Education, Experience, References
      education: payload.education || [],
      experience: payload.experience || [],
      references: payload.references || [],
      isFresher: payload.isFresher || false,
      hasReferences: payload.hasReferences || false,
      
      // Additional Information
      why_interested: payload.additional?.why_interested || "",
      career_goals: payload.additional?.career_goals || "",
      expected_salary: payload.additional?.expected_salary || "",
      notice_period: payload.additional?.notice_period || "",
      
      // Files
      photo_url: payload.files?.photo || "",
      resume_url: payload.files?.resume || "",
      
      // Application metadata
      job_id: row.job_id,
      status: row.status || "Applied",
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    res.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Convert id to number
    const applicationId = parseInt(id);

    // Validate status
    const validStatuses = ["Applied", "Under Review", "Shortlisted", "Rejected", "Hired"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Update the application status
    const updatedRows = await db("candidate_applications")
      .where({ id: applicationId })
      .update({ 
        status,
        updated_at: new Date()
      });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Application status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update application status" });
  }
};

export const updateEvaluationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { evaluation_status } = req.body;

    // Convert id to number
    const applicationId = parseInt(id);

    // Validate evaluation status
    const validEvaluationStatuses = ["pending", "completed"];
    if (!validEvaluationStatuses.includes(evaluation_status)) {
      return res.status(400).json({ 
        error: "Invalid evaluation_status value. Must be 'pending' or 'completed'" 
      });
    }

    // Update the application evaluation status
    const updatedRows = await db("candidate_applications")
      .where({ id: applicationId })
      .update({ 
        evaluation_status,
        updated_at: new Date()
      });

    if (updatedRows === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Evaluation status updated successfully" });
  } catch (error) {
    console.error("Error updating evaluation status:", error);
    res.status(500).json({ error: "Failed to update evaluation status" });
  }
};
