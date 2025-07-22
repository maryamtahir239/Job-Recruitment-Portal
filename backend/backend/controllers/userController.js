import bcrypt from 'bcryptjs';
import { pool } from '../models/db.js';

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!['HR', 'Interviewer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hash, role]);
    res.json({ message: `${role} created successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
