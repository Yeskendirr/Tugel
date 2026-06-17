import { Router } from 'express';
import pool from '../config/db';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.name, r.building,
              COUNT(e.id)::int AS equipment_count
       FROM rooms r
       LEFT JOIN equipment e ON e.room_id = r.id
       GROUP BY r.id ORDER BY r.name`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { name, building } = req.body;
  if (!name) { res.status(400).json({ error: 'Атауы міндетті' }); return; }
  try {
    const { rows } = await pool.query(
      'INSERT INTO rooms (name, building) VALUES ($1,$2) RETURNING *',
      [name, building || null]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, building } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE rooms SET name=$1, building=$2 WHERE id=$3 RETURNING *',
      [name, building || null, req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Кабинет табылмады' }); return; }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM rooms WHERE id=$1', [req.params.id]);
    if (!rowCount) { res.status(404).json({ error: 'Кабинет табылмады' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
