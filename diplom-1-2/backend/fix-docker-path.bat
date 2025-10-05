@echo off
echo 🔧 Исправление PATH для Docker
echo.

echo Добавление Docker в PATH для текущей сессии...
set PATH=%PATH%;C:\Program Files\Docker\Docker\resources\bin

echo.
echo ✅ Docker добавлен в PATH!
echo.

echo Проверка Docker:
docker --version
docker-compose --version

echo.
echo 🚀 Теперь можно запускать:
echo   docker-compose up -d
echo   docker-compose ps
echo   docker-compose logs -f
echo.

pause
