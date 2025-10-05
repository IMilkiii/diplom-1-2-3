@echo off
echo 🚀 Запуск проекта "3D-что-то" с Docker
echo.

echo 🐳 Запуск Backend и PostgreSQL в Docker...
start "Docker Services" cmd /k "cd backend && docker-compose up --build"

echo.
echo ⏳ Ожидание запуска backend...
timeout /t 15 /nobreak > nul

echo 📦 Запуск Frontend...
start "Frontend" cmd /k "npm start"

echo.
echo ✅ Проект запущен с Docker!
echo 📊 Backend: http://localhost:8000
echo 🗄️ PostgreSQL: localhost:5432
echo 🌍 Frontend: http://localhost:3000
echo.
echo 📋 Для тестирования API:
echo curl http://localhost:8000/api/health
echo.
echo 🛑 Для остановки Docker:
echo cd backend && docker-compose down
echo.

pause
