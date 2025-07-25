// backend/backend/controllers/candidatesController.js
import db from "../db/knex.js";

/**
 * POST /api/candidates/import
 * body: { candidates: [{ name, email, phone, designation, location, tempId }] }
 *
 * Upserts candidates by email. Missing optional fields become NULL.
 * Returns imported candidates with their new/existing DB 'id' AND the original 'tempId'.
 */
export const importCandidates = async (req, res) => {
  const { candidates } = req.body;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ success: false, message: "Candidates array is required and must not be empty." });
  }

  try {
    const imported = [];

    for (const c of candidates) { // 'c' here is the original candidate object from the frontend, which *should* have tempId
      if (!c.email || c.email.trim() === "") {
        console.warn("Skipping candidate due to missing or empty email:", c);
        continue;
      }

      // Prepare data for insertion/update in the database
      const dataForDb = {
        name: c.name || "",
        email: c.email.toLowerCase().trim(), // Store email consistently (lowercase, trimmed)
        phone: c.phone || null,
        designation: c.designation || null,
        location: c.location || null,
      };

      // CRITICAL: Capture the original tempId from the incoming request 'c' object.
      // This is the value you need to return to the frontend.
      const originalTempId = c.tempId;

      // Check if candidate with this email already exists in the database
      const existing = await db("candidates").where({ email: dataForDb.email }).first();

      let candidateId;
      if (existing) {
        // If candidate exists, update their details
        await db("candidates").where({ id: existing.id }).update({
          name: dataForDb.name,
          phone: dataForDb.phone,
          designation: dataForDb.designation,
          location: dataForDb.location,
          updated_at: db.fn.now() // Update timestamp
        });
        candidateId = existing.id; // Use existing DB ID
      } else {
        // If candidate does not exist, insert them
        const [id] = await db("candidates").insert({
          ...dataForDb,
          created_at: db.fn.now(), // Set creation timestamp
          updated_at: db.fn.now()  // Set update timestamp
        });
        candidateId = id; // Use new DB ID
      }

      // Construct the response object for the frontend.
      // It MUST include the new/existing DB 'id' AND the original 'tempId'.
      imported.push({
        id: candidateId,            // The real database ID
        name: dataForDb.name,
        email: dataForDb.email,
        phone: dataForDb.phone,
        designation: dataForDb.designation,
        location: dataForDb.location,
        tempId: originalTempId      // <--- THIS IS THE FIX: INCLUDE THE originalTempId
      });
    }

    // Return success response with all processed candidates, including their DB IDs and tempIds
    return res.json({ success: true, candidates: imported });
  } catch (error) {
    console.error("importCandidates error:", error);
    // Provide a consistent and informative error response
    return res.status(500).json({ success: false, message: "Server error during candidate import. Please try again." });
  }
};