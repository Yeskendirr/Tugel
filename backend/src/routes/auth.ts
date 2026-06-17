import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { authenticate, getUser } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Логин мен парольді енгізіңіз' });
    return;
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = rows[0];
    if (!user) { res.status(401).json({ error: 'Пайдаланушы табылмады' }); return; }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) { res.status(401).json({ error: 'Қате пароль' }); return; }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, fullName: user.full_name, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { id } = getUser(req);
    const { rows } = await pool.query(
      'SELECT id, full_name, role FROM users WHERE id = $1', [id]
    );
    const u = rows[0];
    if (!u) { res.status(404).json({ error: 'Табылмады' }); return; }
    res.json({ id: u.id, fullName: u.full_name, role: u.role });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
