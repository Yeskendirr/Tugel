import { Router } from 'express';
import pool from '../config/db';
import { authenticate, getUser } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Тізім
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ic.id, ic.check_date, ic.notes, ic.room_id, ic.created_at,
              u.full_name AS user_name, r.name AS room_name
       FROM inventory_checks ic
       LEFT JOIN users u ON ic.user_id = u.id
       LEFT JOIN rooms r ON ic.room_id = r.id
       ORDER BY ic.check_date DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Акт детайлы — жабдықтар + белгілер
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ic.*, u.full_name AS user_name, r.name AS room_name
       FROM inventory_checks ic
       LEFT JOIN users u ON ic.user_id = u.id
       LEFT JOIN rooms r ON ic.room_id = r.id
       WHERE ic.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Акт табылмады' }); return; }

    const act = rows[0];

    // Кабинет бойынша сүзу немесе бәрі
    const eqQuery = act.room_id
      ? `SELECT e.id, e.name, e.inventory_number, e.status,
                c.name AS category_name, r.name AS room_name
         FROM equipment e
         LEFT JOIN categories c ON e.category_id = c.id
         LEFT JOIN rooms r ON e.room_id = r.id
         WHERE e.room_id = $1
         ORDER BY e.name`
      : `SELECT e.id, e.name, e.inventory_number, e.status,
                c.name AS category_name, r.name AS room_name
         FROM equipment e
         LEFT JOIN categories c ON e.category_id = c.id
         LEFT JOIN rooms r ON e.room_id = r.id
         ORDER BY e.name`;

    const { rows: equipment } = await pool.query(
      eqQuery,
      act.room_id ? [act.room_id] : []
    );

    // Белгілерді жүктеу
    const { rows: items } = await pool.query(
      `SELECT equipment_id, result, notes FROM inventory_check_items WHERE check_id = $1`,
      [req.params.id]
    );

    const itemMap: Record<number, { result: string; notes: string | null }> = {};
    items.forEach(i => { itemMap[i.equipment_id] = { result: i.result, notes: i.notes }; });

    const equipmentWithResults = equipment.map(eq => ({
      ...eq,
      result: itemMap[eq.id]?.result ?? null,
      item_notes: itemMap[eq.id]?.notes ?? null,
    }));

    res.json({ ...act, equipment: equipmentWithResults });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Акт жасау
router.post('/', async (req, res) => {
  const { check_date, notes, room_id } = req.body;
  if (!check_date) { res.status(400).json({ error: 'Күнді енгізіңіз' }); return; }
  try {
    const { id } = getUser(req);
    const { rows } = await pool.query(
      'INSERT INTO inventory_checks (user_id, check_date, notes, room_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, check_date, notes || null, room_id || null]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Жабдыққа белгі қою (staff немесе admin)
router.put('/:id/items/:equipmentId', async (req, res) => {
  const { result, notes } = req.body;
  const validResults = ['present', 'damaged', 'missing'];
  if (!validResults.includes(result)) {
    res.status(400).json({ error: 'Қате нәтиже мәні' });
    return;
  }
  try {
    await pool.query(
      `INSERT INTO inventory_check_items (check_id, equipment_id, result, notes, checked_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (check_id, equipment_id)
       DO UPDATE SET result = $3, notes = $4, checked_at = NOW()`,
      [req.params.id, req.params.equipmentId, result, notes || null]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
