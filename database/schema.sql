-- Колледж жабдықтарын түгендеу — дерекқор схемасы

CREATE DATABASE IF NOT EXISTS college_inventory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE college_inventory;

-- Пайдаланушылар (әкімші / қызметкер)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Санаттар (жабдық түрлері)
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Кабинеттер / бөлмелер
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  building VARCHAR(255)
);

-- Жабдықтар
CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  inventory_number VARCHAR(100) UNIQUE,
  category_id INT,
  room_id INT,
  status ENUM('working', 'repair', 'written_off') NOT NULL DEFAULT 'working',
  purchase_date DATE,
  price DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- Түгендеу актілері
CREATE TABLE inventory_checks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  check_date DATE NOT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
