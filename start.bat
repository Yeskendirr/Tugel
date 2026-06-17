@echo off
chcp 65001 > nul
title ТУГЕЛ — Жоба іске қосылуда...

echo.
echo ================================================
echo   ТУГЕЛ — Іске қосу
echo ================================================
echo.

:: Node.js тексеру
node --version > nul 2>&1
if errorlevel 1 (
    echo [КАТЕ] Node.js табылмады. Алдымен setup.bat іске косыныз.
    pause
    exit /b 1
)

:: node_modules тексеру
if not exist "%~dp0backend\node_modules" (
    echo [КАТЕ] Пакеттер орнатылмаган. Алдымен setup.bat іске косыныз.
    pause
    exit /b 1
)

if not exist "%~dp0frontend\node_modules" (
    echo [КАТЕ] Пакеттер орнатылмаган. Алдымен setup.bat іске косыныз.
    pause
    exit /b 1
)

echo Backend іске косылуда (порт 4000)...
start "ТУГЕЛ — Backend" cmd /k "chcp 65001 > nul && cd /d %~dp0backend && npm run dev"

echo Кутіп тур (3 секунд)...
timeout /t 3 /nobreak > nul

echo Frontend іске косылуда (порт 5173)...
start "ТУГЕЛ — Frontend" cmd /k "chcp 65001 > nul && cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ================================================
echo   Жоба іске косылды!
echo ================================================
echo.
echo   Браузерде ашыныз:  http://localhost:5173
echo.
echo   Admin:  admin  / admin123
echo   Staff:  staff  / staff123
echo.
echo   Токтату ушін: ашылган терминалдарды жабыныз
echo.

:: Браузерді ашу
start http://localhost:5173

pause
