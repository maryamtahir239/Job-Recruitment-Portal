// backend/backend/controllers/candidatesController.js
import db from "../db/knex.js";

/**
 * POST /api/candidates/import
 * body: { candidates: [{ name, email, phone, designation, location }] }
 *
 * Upsert by email. Missing fields become NULL.
 */
export const importCandidates = async (req, res) => {
  const { candidates } = req.body;

  if (!Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: "candidates array required" });
  }

  try {
    const imported = [];

    for (const c of candidates) {
      if (!c.email) continue; // skip invalid rows

      const data = {
        name: c.name || "",
        email: c.email,
        phone: c.phone || null,
        designation: c.designation || null,
        location: c.location || null,
      };

      const existing = await db("candidates").where({ email: c.email }).first();

      if (existing) {
        await db("candidates").where({ id: existing.id }).update({
          name: data.name,
          phone: data.phone,
          designation: data.designation,
          location: data.location,
          // created_at preserved automatically if column not touched
        });
        imported.push({ id: existing.id, ...data });
      } else {
        const [id] = await db("candidates").insert(data);
        imported.push({ id, ...data });
      }
    }

    return res.json({ success: true, candidates: imported });
  } catch (error) {
    console.error("importCandidates error:", error);
    return res.status(500).json({ error: "Server error during candidate import" });
  }
};
