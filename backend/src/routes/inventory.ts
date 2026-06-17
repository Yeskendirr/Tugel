import { Router } from 'express';
import pool from '../config/db';
import { authenticate, getUser } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ic.id, ic.check_date, ic.notes, ic.created_at,
              u.full_name AS user_name
       FROM inventory_checks ic
       LEFT JOIN users u ON ic.user_id = u.id
       ORDER BY ic.check_date DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ic.*, u.full_name AS user_name
       FROM inventory_checks ic
       LEFT JOIN users u ON ic.user_id = u.id
       WHERE ic.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Акт табылмады' }); return; }

    const { rows: equipment } = await pool.query(
      `SELECT e.id, e.name, e.inventory_number, e.status,
              c.name AS category_name, r.name AS room_name
       FROM equipment e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN rooms r ON e.room_id = r.id
       ORDER BY e.name`
    );

    res.json({ ...rows[0], equipment });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.post('/', async (req, res) => {
  const { check_date, notes } = req.body;
  if (!check_date) { res.status(400).json({ error: 'Күнді енгізіңіз' }); return; }
  try {
    const { id } = getUser(req);
    const { rows } = await pool.query(
      'INSERT INTO inventory_checks (user_id, check_date, notes) VALUES ($1,$2,$3) RETURNING *',
      [id, check_date, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
