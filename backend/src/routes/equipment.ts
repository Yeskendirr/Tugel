import { Router } from 'express';
import pool from '../config/db';
import { authenticate, getUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
router.use(authenticate);

// Тізім (сүзгі + пагинация)
router.get('/', async (req, res) => {
  const { room, category, status, search, page = '1', limit = '20' } = req.query as Record<string, string>;

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (room)     { conditions.push(`e.room_id = $${values.length + 1}`);           values.push(parseInt(room)); }
  if (category) { conditions.push(`e.category_id = $${values.length + 1}`);       values.push(parseInt(category)); }
  if (status)   { conditions.push(`e.status = $${values.length + 1}`);            values.push(status); }
  if (search)   { conditions.push(`e.name ILIKE $${values.length + 1}`);          values.push(`%${search}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM equipment e ${where}`,
      values
    );
    const total = parseInt(countRows[0].count);

    const lim = parseInt(limit);
    const offset = (parseInt(page) - 1) * lim;
    const limIdx = values.length + 1;
    const offIdx = values.length + 2;
    values.push(lim, offset);

    const { rows } = await pool.query(
      `SELECT e.id, e.name, e.inventory_number, e.status, e.purchase_date,
              e.price, e.notes, e.created_at, e.category_id, e.room_id,
              c.name AS category_name, r.name AS room_name
       FROM equipment e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN rooms r ON e.room_id = r.id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT $${limIdx} OFFSET $${offIdx}`,
      values
    );

    res.json({ data: rows, total, page: parseInt(page), limit: lim });
  } catch (err) {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Жабдық статус тарихы
router.get('/:id/history', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sl.id, sl.old_status, sl.new_status, sl.reason, sl.created_at,
              u.full_name AS user_name
       FROM equipment_status_log sl
       LEFT JOIN users u ON sl.user_id = u.id
       WHERE sl.equipment_id = $1
       ORDER BY sl.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Бір жабдық
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT e.*, c.name AS category_name, r.name AS room_name
       FROM equipment e
       LEFT JOIN categories c ON e.category_id = c.id
       LEFT JOIN rooms r ON e.room_id = r.id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { res.status(404).json({ error: 'Жабдық табылмады' }); return; }
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Жаңа жабдық
router.post('/', requireAdmin, async (req, res) => {
  const { name, inventory_number, category_id, room_id, status, purchase_date, price, notes } = req.body;
  if (!name || !inventory_number || !status) {
    res.status(400).json({ error: 'Атауы, инвентарлық нөмір және статус міндетті' });
    return;
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO equipment (name, inventory_number, category_id, room_id, status, purchase_date, price, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, inventory_number, category_id || null, room_id || null, status,
       purchase_date || null, price || null, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('unique')) { res.status(400).json({ error: 'Бұл инвентарлық нөмір бұрын тіркелген' }); return; }
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Өңдеу
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, inventory_number, category_id, room_id, status, purchase_date, price, notes, status_reason } = req.body;
  try {
    // Ескі статусты алу
    const { rows: old } = await pool.query('SELECT status FROM equipment WHERE id=$1', [req.params.id]);
    if (!old[0]) { res.status(404).json({ error: 'Жабдық табылмады' }); return; }

    const { rows } = await pool.query(
      `UPDATE equipment SET name=$1, inventory_number=$2, category_id=$3, room_id=$4,
       status=$5, purchase_date=$6, price=$7, notes=$8
       WHERE id=$9 RETURNING *`,
      [name, inventory_number, category_id || null, room_id || null, status,
       purchase_date || null, price || null, notes || null, req.params.id]
    );

    // Статус өзгерсе тарихқа жазу
    if (old[0].status !== status) {
      const me = getUser(req);
      await pool.query(
        `INSERT INTO equipment_status_log (equipment_id, old_status, new_status, reason, user_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [req.params.id, old[0].status, status, status_reason || null, me.id]
      );
    }

    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

// Жою
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM equipment WHERE id=$1', [req.params.id]);
    if (!rowCount) { res.status(404).json({ error: 'Жабдық табылмады' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
