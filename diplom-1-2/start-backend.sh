#!/bin/bash

echo "🚀 Запуск Backend для генератора 3D моделей"
echo

cd backend

echo "📦 Установка зависимостей..."
npm install

echo
echo "🐳 Запуск PostgreSQL и Backend в Docker..."
docker-compose up -d

echo
echo "✅ Сервисы запущены!"
echo "📊 Backend: http://localhost:8000"
echo "🗄️ PostgreSQL: localhost:5432"
echo "📋 Health check: http://localhost:8000/api/health"
echo
echo "📝 Для просмотра логов: docker-compose logs -f"
echo "🛑 Для остановки: docker-compose down"
echo
