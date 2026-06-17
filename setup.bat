@echo off
chcp 65001 > nul
title ТУГЕЛ — Баптау

echo.
echo ================================================
echo   ТУГЕЛ — Жоба баптауы (бір рет іске қосылады)
echo ================================================
echo.

:: ── 1. Node.js тексеру ──────────────────────────────────
node --version > nul 2>&1
if errorlevel 1 (
    echo [КАТЕ] Node.js орнатылмаган!
    echo.
    echo Мына сайтка кіріп жуктеп алыныз:
    echo   https://nodejs.org
    echo.
    echo LTS нускасын жуктеп, орнатып, setup.bat-ты кайта іске косыныз.
    start https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo [OK] Node.js табылды: %NODE_VER%

:: ── 2. PostgreSQL (psql.exe) іздеу ─────────────────────
set PSQL=

for /d %%v in ("C:\Program Files\PostgreSQL\*") do (
    if exist "%%v\bin\psql.exe" (
        set PSQL=%%v\bin\psql.exe
        set PGBIN=%%v\bin
    )
)

if "%PSQL%"=="" (
    echo [KАТЕ] PostgreSQL табылмады!
    echo.
    echo Мына сайтка кіріп жуктеп алыныз:
    echo   https://www.postgresql.org/download/windows/
    echo.
    echo Орнату кезінде пароль: password
    echo Орнатып болганнан кейін setup.bat-ты кайта іске косыныз.
    start https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [OK] PostgreSQL табылды: %PSQL%

:: ── 3. Дерекқор жасау ───────────────────────────────────
echo.
echo [1/4] Деректор жасалуда...
set PGPASSWORD=password
"%PSQL%" -U postgres -h localhost -c "CREATE DATABASE college_inventory;" 2>nul
echo       OK (немесе деректор бурын бар болуы мумкін)

:: ── 4. Схема қосу ────────────────────────────────────────
echo [2/4] Кестелер косылуда...
"%PSQL%" -U postgres -h localhost -d college_inventory -f "%~dp0database\schema.sql" > nul 2>&1
if errorlevel 1 (
    echo [КАТЕ] schema.sql іске косылмады. database\schema.sql бар ма екенін тексер.
    pause
    exit /b 1
)
echo       OK

:: ── 5. Тест деректері ────────────────────────────────────
echo [3/4] Тест деректері енгізілуде...
"%PSQL%" -U postgres -h localhost -d college_inventory -c ^
"INSERT INTO users (full_name, username, password_hash, role) VALUES ('Акімші Иванов', 'admin', '$2a$10$alb4PjQKmmb6rfWKB4QMb.Un043HFtVkOaxi/O7.z98iYUrIoS5TC', 'admin'), ('Кызметкер Петрова', 'staff', '$2a$10$YqHJQ7YBL7mvs6QlqwaU6.46W97M7NAiueVLeBCr6H6zcI4EsoShu', 'staff') ON CONFLICT (username) DO NOTHING;" > nul 2>&1

"%PSQL%" -U postgres -h localhost -d college_inventory -c ^
"INSERT INTO categories (name) VALUES ('Компьютерлік техника'),('Оргтехника'),('Жиhаз'),('Оку кураллары'),('Аудиовизуалды жабдык') ON CONFLICT DO NOTHING;" > nul 2>&1

"%PSQL%" -U postgres -h localhost -d college_inventory -c ^
"INSERT INTO rooms (name, building) VALUES ('101-кабинет','А корпусы'),('102-кабинет','А корпусы'),('201-кабинет','Б корпусы'),('Сервер болмесі','А корпусы'),('Кітапхана','В корпусы') ON CONFLICT DO NOTHING;" > nul 2>&1

"%PSQL%" -U postgres -h localhost -d college_inventory -c ^
"INSERT INTO equipment (name, inventory_number, category_id, room_id, status, purchase_date, price) VALUES ('Dell Optiplex 3080','INV-001',1,1,'working','2022-09-01',180000),('HP ProBook 450','INV-002',1,1,'working','2022-09-01',250000),('Lenovo ThinkCentre','INV-003',1,2,'repair','2021-03-15',160000),('Canon LBP6030','INV-004',2,2,'working','2023-01-10',55000),('Эпсон L3150','INV-005',2,4,'working','2023-06-20',80000),('Офис устел 1','INV-006',3,1,'working','2020-08-01',35000),('Проектор Epson','INV-007',5,3,'working','2022-11-15',120000),('Cisco Switch 24p','INV-008',1,4,'working','2023-03-01',220000),('HP LaserJet M402','INV-009',2,2,'written_off','2019-01-01',45000),('Acer Veriton','INV-010',1,3,'repair','2020-06-15',140000) ON CONFLICT (inventory_number) DO NOTHING;" > nul 2>&1

echo       OK

:: ── 6. npm install ───────────────────────────────────────
echo [4/4] npm пакеттері орнатылуда (1-2 минут кетуі мумкін)...

echo       backend...
cd /d "%~dp0backend"
call npm install --silent 2>nul
if errorlevel 1 (
    echo [КАТЕ] backend npm install катесі
    pause
    exit /b 1
)

echo       frontend...
cd /d "%~dp0frontend"
call npm install --silent 2>nul
if errorlevel 1 (
    echo [КАТЕ] frontend npm install катесі
    pause
    exit /b 1
)

cd /d "%~dp0"

:: ── Дайын ────────────────────────────────────────────────
echo.
echo ================================================
echo   БАПТАУ АЯКТАДЫ!
echo ================================================
echo.
echo   Енді start.bat файлын іске косыныз.
echo.
echo   Браузерде: http://localhost:5173
echo   Admin: admin / admin123
echo   Staff: staff / staff123
echo.
pause
