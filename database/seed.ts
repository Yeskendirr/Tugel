// Бастапқы деректерді енгізу скрипті
// Іске қосу: cd backend && npx ts-node ../database/seed.ts

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: `${__dirname}/../backend/.env` });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'college_inventory',
});

async function seed() {
  console.log('Деректер енгізілуде...');

  const adminHash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);

  await pool.query(`
    INSERT INTO users (full_name, username, password_hash, role) VALUES
    ('Әкімші Иванов Иван', 'admin', $1, 'admin'),
    ('Қызметкер Петрова Анна', 'staff', $2, 'staff')
    ON CONFLICT (username) DO NOTHING
  `, [adminHash, staffHash]);

  await pool.query(`
    INSERT INTO categories (name) VALUES
    ('Компьютерлік техника'),
    ('Оргтехника'),
    ('Жиһаз'),
    ('Оқу құралдары'),
    ('Аудиовизуалды жабдық')
    ON CONFLICT DO NOTHING
  `);

  await pool.query(`
    INSERT INTO rooms (name, building) VALUES
    ('101-кабинет', 'А корпусы'),
    ('102-кабинет', 'А корпусы'),
    ('201-кабинет', 'Б корпусы'),
    ('202-кабинет', 'Б корпусы'),
    ('Серверлік бөлме', 'А корпусы'),
    ('Кітапхана', 'В корпусы')
    ON CONFLICT DO NOTHING
  `);

  const { rows: cats } = await pool.query('SELECT id, name FROM categories');
  const { rows: rms }  = await pool.query('SELECT id FROM rooms');

  const catId = (name: string) => cats.find(c => c.name === name)?.id;
  const roomId = (i: number) => rms[i]?.id;

  await pool.query(`
    INSERT INTO equipment (name, inventory_number, category_id, room_id, status, purchase_date, price) VALUES
    ('Dell Optiplex 3080', 'INV-001', $1, $2, 'working',  '2022-09-01', 180000),
    ('HP ProBook 450',     'INV-002', $1, $2, 'working',  '2022-09-01', 250000),
    ('Lenovo ThinkCentre', 'INV-003', $1, $3, 'repair',   '2021-03-15', 160000),
    ('Canon LBP6030',      'INV-004', $4, $3, 'working',  '2023-01-10',  55000),
    ('Epson L3150',        'INV-005', $4, $5, 'working',  '2023-06-20',  80000),
    ('Офис үстел 1',       'INV-006', $6, $2, 'working',  '2020-08-01',  35000),
    ('Офис үстел 2',       'INV-007', $6, $3, 'working',  '2020-08-01',  35000),
    ('Проектор Epson',     'INV-008', $7, $8, 'working',  '2022-11-15', 120000),
    ('Ақ тақта',           'INV-009', $6, $2, 'working',  '2021-05-10',  15000),
    ('Cisco Switch 24p',   'INV-010', $1, $5, 'working',  '2023-03-01', 220000),
    ('HP LaserJet M402',   'INV-011', $4, $3, 'written_off','2019-01-01', 45000),
    ('Acer Veriton',       'INV-012', $1, $8, 'repair',   '2020-06-15', 140000)
    ON CONFLICT (inventory_number) DO NOTHING
  `, [
    catId('Компьютерлік техника'),
    roomId(0), roomId(1),
    catId('Оргтехника'),
    roomId(4),
    catId('Жиһаз'),
    catId('Аудиовизуалды жабдық'),
    roomId(2),
  ]);

  console.log('Бастапқы деректер сәтті енгізілді.');
  console.log('Кіру: admin / admin123  немесе  staff / staff123');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
