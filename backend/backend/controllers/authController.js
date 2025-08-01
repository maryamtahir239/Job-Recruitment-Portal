import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../models/db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) return res.status(401).json({ error: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: {
        id: user.id, 
        role: user.role, 
        name: user.name, 
        email: user.email 
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
