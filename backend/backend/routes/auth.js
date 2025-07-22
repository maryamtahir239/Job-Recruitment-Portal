import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import knex from "../db/knex.js";

const router = express.Router();

// ✅ Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("📩 Login attempt:", email);

    // 1. Check if user exists
    const user = await knex("users").where({ email }).first();
    console.log("🔍 User found:", user);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log("✅ Password valid:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error("❌ Missing JWT_SECRET in .env");
      return res.status(500).json({ error: "Server config error" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("🎫 JWT generated successfully");

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
