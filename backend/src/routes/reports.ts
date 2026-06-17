import { Router } from 'express';
import pool from '../config/db';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/summary', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
        COUNT(*)::int                                          AS total,
        COUNT(*) FILTER (WHERE status='working')::int         AS working,
        COUNT(*) FILTER (WHERE status='repair')::int          AS repair,
        COUNT(*) FILTER (WHERE status='written_off')::int     AS written_off
       FROM equipment`
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.get('/rooms', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.name AS room_name,
              COUNT(e.id)::int        AS equipment_count,
              COALESCE(SUM(e.price), 0) AS total_price
       FROM rooms r
       LEFT JOIN equipment e ON e.room_id = r.id
       GROUP BY r.id, r.name
       ORDER BY r.name`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.name AS category_name, COUNT(e.id)::int AS equipment_count
       FROM categories c
       LEFT JOIN equipment e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY c.name`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.get('/rooms/export', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.name AS room_name,
              COUNT(e.id)::int        AS equipment_count,
              COALESCE(SUM(e.price), 0) AS total_price
       FROM rooms r
       LEFT JOIN equipment e ON e.room_id = r.id
       GROUP BY r.id, r.name ORDER BY r.name`
    );
    const bom = '﻿';
    const header = 'Кабинет,Жабдық саны,Жалпы баға (теңге)\n';
    const body = rows.map(r => `${r.room_name},${r.equipment_count},${r.total_price}`).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rooms_report.csv"');
    res.send(bom + header + body);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

router.get('/categories/export', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.name AS category_name, COUNT(e.id)::int AS equipment_count
       FROM categories c
       LEFT JOIN equipment e ON e.category_id = c.id
       GROUP BY c.id, c.name ORDER BY c.name`
    );
    const bom = '﻿';
    const header = 'Санат,Жабдық саны\n';
    const body = rows.map(r => `${r.category_name},${r.equipment_count}`).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="categories_report.csv"');
    res.send(bom + header + body);
  } catch {
    res.status(500).json({ error: 'Сервер қатесі' });
  }
});

export default router;
