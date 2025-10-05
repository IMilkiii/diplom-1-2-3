@echo off
echo 🚀 Запуск проекта "3D-что-то"
echo.

echo 📦 Запуск Backend...
start "Backend" cmd /k "cd backend && node server-simple.js"

echo.
echo ⏳ Ожидание запуска backend...
timeout /t 3 /nobreak > nul

echo 📦 Запуск Frontend...
start "Frontend" cmd /k "npm start"

echo.
echo ✅ Проект запущен!
echo 📊 Backend: http://localhost:8000
echo 🌍 Frontend: http://localhost:3000
echo.
echo 📋 Для тестирования API:
echo curl http://localhost:8000/api/health
echo.

pause
