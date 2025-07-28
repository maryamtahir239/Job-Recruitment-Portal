import db from "../db/knex.js";

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
