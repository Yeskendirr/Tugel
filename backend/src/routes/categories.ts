import { Router } from 'express';
import pool from '../config/db';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.name, COUNT(e.id)::int AS equipment_count
       FROM categories c
       LEFT JOIN equipment e ON e.category_id = c.id
       GROUP BY c.id ORDER BY c.name`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'Атауы міндетті' }); return; }
  try {
    const { rows } = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE categories SET name=$1 WHERE id=$2 RETURNING *', [name, req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Санат табылмады' }); return; }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    if (!rowCount) { res.status(404).json({ error: 'Санат табылмады' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
