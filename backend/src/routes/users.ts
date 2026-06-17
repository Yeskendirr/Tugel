import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { authenticate, getUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, full_name, username, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.post('/', async (req, res) => {
  const { full_name, username, password, role } = req.body;
  if (!full_name || !username || !password) {
    res.status(400).json({ error: 'Барлық міндетті өрістерді толтырыңыз' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль кемінде 6 символ болуы керек' });
    return;
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, username, password_hash, role)
       VALUES ($1,$2,$3,$4) RETURNING id, full_name, username, role, created_at`,
      [full_name, username, hash, role || 'staff']
    );
    res.status(201).json(rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('unique')) { res.status(400).json({ error: 'Бұл логин бос емес' }); return; }
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.delete('/:id', async (req, res) => {
  const me = getUser(req);
  if (parseInt(req.params.id) === me.id) {
    res.status(400).json({ error: 'Өзіңізді өшіре алмайсыз' });
    return;
  }
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    if (!rowCount) { res.status(404).json({ error: 'Пайдаланушы табылмады' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
