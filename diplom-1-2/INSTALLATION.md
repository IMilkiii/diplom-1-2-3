# Инструкции по установке и запуску

## 🐳 Установка Docker (если не установлен)

### Windows:
1. Скачайте Docker Desktop с официального сайта: https://www.docker.com/products/docker-desktop/
2. Установите Docker Desktop
3. Перезагрузите компьютер
4. Запустите Docker Desktop

### Альтернатива - запуск без Docker:

Если Docker не установлен, можно запустить backend локально:

## 🚀 Запуск Backend без Docker

### 1. Установка PostgreSQL

#### Windows:
1. Скачайте PostgreSQL с https://www.postgresql.org/download/windows/
2. Установите PostgreSQL
3. Запомните пароль для пользователя postgres
4. Создайте базу данных:
   ```sql
   CREATE DATABASE 3d_model_generator;
   ```

#### Или используйте онлайн PostgreSQL:
- Heroku Postgres (бесплатно)
- ElephantSQL (бесплатно)
- Supabase (бесплатно)

### 2. Настройка переменных окружения

Создайте файл `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=3d_model_generator
DB_USER=postgres
DB_PASSWORD=ваш_пароль

# Server
PORT=8000
NODE_ENV=development

# Session
SESSION_SECRET=your-super-secret-session-key-here

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Инициализация базы данных

Выполните SQL скрипт из файла `backend/init.sql` в вашей базе данных.

### 4. Запуск Backend

```bash
cd backend
npm install
npm run dev
```

## 🔧 Проверка работы

1. **Backend**: http://localhost:8000/api/health
2. **Frontend**: http://localhost:3000

## 📊 API Endpoints

### Авторизация:
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Информация о пользователе

### Проекты:
- `GET /api/projects` - Список проектов
- `POST /api/projects` - Создание проекта
- `GET /api/projects/:id` - Получение проекта
- `PUT /api/projects/:id` - Обновление проекта
- `DELETE /api/projects/:id` - Удаление проекта

### Загрузка:
- `POST /api/upload/project/:projectId` - Загрузка изображений
- `DELETE /api/upload/image/:imageId` - Удаление изображения

## 🐳 Запуск с Docker (если установлен)

```bash
cd backend
docker-compose up -d
```

Или новая версия:
```bash
cd backend
docker compose up -d
```

## 🔍 Отладка

### Проверка логов:
```bash
# Docker
docker-compose logs -f

# Локально
npm run dev
```

### Проверка базы данных:
```bash
# Подключение к PostgreSQL
psql -h localhost -U postgres -d 3d_model_generator
```

## 📝 Следующие шаги

1. Запустите backend
2. Запустите frontend: `npm start`
3. Протестируйте регистрацию и авторизацию
4. Создайте первый проект
5. Загрузите изображения
