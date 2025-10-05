@echo off
echo 📝 Просмотр логов Docker контейнеров
echo.

echo Выберите сервис для просмотра логов:
echo 1. Backend
echo 2. PostgreSQL
echo 3. Все сервисы
echo.

set /p choice="Введите номер (1-3): "

if "%choice%"=="1" (
    echo 📊 Логи Backend:
    docker-compose logs -f backend
) else if "%choice%"=="2" (
    echo 🗄️ Логи PostgreSQL:
    docker-compose logs -f postgres
) else if "%choice%"=="3" (
    echo 📋 Логи всех сервисов:
    docker-compose logs -f
) else (
    echo ❌ Неверный выбор!
    pause
    exit /b 1
)
