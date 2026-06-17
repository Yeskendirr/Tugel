-- Колледж жабдықтарын түгендеу — PostgreSQL схемасы

-- Типтер
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE equipment_status AS ENUM ('working', 'repair', 'written_off');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Пайдаланушылар
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  full_name    VARCHAR(255) NOT NULL,
  username     VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         user_role NOT NULL DEFAULT 'staff',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Санаттар
CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Кабинеттер
CREATE TABLE IF NOT EXISTS rooms (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(255) NOT NULL,
  building VARCHAR(255)
);

-- Жабдықтар
CREATE TABLE IF NOT EXISTS equipment (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  inventory_number VARCHAR(100) UNIQUE,
  category_id      INT REFERENCES categories(id) ON DELETE SET NULL,
  room_id          INT REFERENCES rooms(id) ON DELETE SET NULL,
  status           equipment_status NOT NULL DEFAULT 'working',
  purchase_date    DATE,
  price            NUMERIC(12, 2),
  notes            TEXT,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Түгендеу актілері
CREATE TABLE IF NOT EXISTS inventory_checks (
  id         SERIAL PRIMARY KEY,
  user_id    INT REFERENCES users(id) ON DELETE SET NULL,
  check_date DATE NOT NULL,
  notes      TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
