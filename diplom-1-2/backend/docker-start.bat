@echo off
echo 🐳 Запуск проекта с Docker
echo.

echo 📦 Сборка и запуск контейнеров...
docker-compose up --build -d

echo.
echo ⏳ Ожидание запуска сервисов...
timeout /t 10 /nobreak > nul

echo.
echo ✅ Сервисы запущены!
echo 📊 Backend: http://localhost:8000
echo 🗄️ PostgreSQL: localhost:5432
echo 📋 Health check: http://localhost:8000/api/health
echo.

echo 📝 Полезные команды:
echo   docker-compose logs -f          - Просмотр логов
echo   docker-compose down             - Остановка
echo   docker-compose restart backend  - Перезапуск backend
echo.

pause
