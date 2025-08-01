// backend/routes/adminUsers.js
import express from "express";
import bcrypt from "bcryptjs";
import knex from "../db/knex.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// All routes require SuperAdmin auth
router.use(verifyToken, requireRole("SuperAdmin"));

/**
 * GET /api/admin/users
 * List all HR + Interviewer users.
 */
router.get("/", async (req, res) => {
  console.log("GET /api/admin/users called");
  try {
    const users = await knex("users")
      .select("id", "name", "email", "role")
      .whereIn("role", ["HR", "Interviewer"])
      .orderBy("id", "desc");
    console.log("Found users:", users);
    res.json(users);
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/admin/users
 * Create HR/Interviewer.
 * body: {name,email,password,role}
 */
router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields required." });
  }
  if (!["HR", "Interviewer"].includes(role)) {
    return res.status(400).json({ error: "Invalid role." });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [id] = await knex("users").insert({
      name,
      email,
      password: hashed,
      role,
    });

    const user = await knex("users")
      .select("id", "name", "email", "role")
      .where({ id })
      .first();

    res.status(201).json(user);
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update name/email/role; password optional.
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body || {};

  const update = {};
  if (name) update.name = name;
  if (email) update.email = email;
  if (role) {
    if (!["HR", "Interviewer"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }
    update.role = role;
  }

  try {
    if (password) {
      update.password = await bcrypt.hash(password, 10);
    }

    const affected = await knex("users").where({ id }).update(update);
    if (!affected) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = await knex("users")
      .select("id", "name", "email", "role")
      .where({ id })
      .first();

    res.json(user);
  } catch (err) {
    console.error("PUT /api/admin/users/:id error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/admin/users/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const affected = await knex("users").where({ id }).delete();
    if (!affected) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json({ message: "User deleted." });
  } catch (err) {
    console.error("DELETE /api/admin/users/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
