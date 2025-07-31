import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import knex from "../db/knex.js";

const router = express.Router();

// ✅ Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        error: "Email and password are required",
        field: !email ? "email" : "password"
      });
    }

    // 1. Check if user exists
    const user = await knex("users").where({ email }).first();

    if (!user) {
      return res.status(401).json({ 
        error: "Email not found. Please check your email address.",
        field: "email"
      });
    }

    // 2. Check password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ 
        error: "Incorrect password. Please try again.",
        field: "password"
      });
    }

    // 3. Generate JWT
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Server config error" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
