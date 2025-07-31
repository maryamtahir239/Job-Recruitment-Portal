import db from "../db/knex.js";

export const getAllApplications = async (req, res) => {
  try {
    const rows = await db("candidate_applications")
      .select("*")
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
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    });
    
    res.json(parsedRows);
  } catch (error) {
    console.error("Error fetching all applications:", error);
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
