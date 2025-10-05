@echo off
echo 🧪 Тестирование API проекта "3D-что-то"
echo.

echo 📊 Проверка статуса сервисов...
echo.

echo 1. Health Check:
curl -s http://localhost:8000/api/health
echo.
echo.

echo 2. Регистрация нового пользователя:
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Demo User\",\"email\":\"demo@example.com\",\"password\":\"demo123\"}"
echo.
echo.

echo 3. Вход пользователя:
curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"demo@example.com\",\"password\":\"demo123\"}"
echo.
echo.

echo 4. Просмотр всех пользователей в БД:
docker-compose exec postgres psql -U postgres -d 3d_model_generator -c "SELECT id, email, name, created_at FROM users;"
echo.

echo ✅ Тестирование завершено!
echo.
echo 🌍 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8000
echo 🗄️ PostgreSQL: localhost:5432
echo.

pause
