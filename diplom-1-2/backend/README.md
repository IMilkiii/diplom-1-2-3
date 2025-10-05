# Backend для генератора 3D моделей

Микросервис с PostgreSQL, авторизацией через сессии и API для управления проектами.

## 🚀 Быстрый запуск

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Настройка переменных окружения
```bash
cp env.example .env
# Отредактируйте .env файл под ваши настройки
```

### 3. Запуск с Docker (рекомендуется)
```bash
# Запуск PostgreSQL и Backend
docker-compose up -d

# Просмотр логов
docker-compose logs -f backend
```

### 4. Запуск в режиме разработки
```bash
# Только PostgreSQL в Docker
docker-compose up -d postgres

# Backend в режиме разработки
npm run dev
```

## 📊 API Endpoints

### Авторизация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Информация о пользователе
- `GET /api/auth/status` - Статус авторизации

### Проекты
- `GET /api/projects` - Список проектов пользователя
- `POST /api/projects` - Создание проекта
- `GET /api/projects/:id` - Получение проекта
- `PUT /api/projects/:id` - Обновление проекта
- `DELETE /api/projects/:id` - Удаление проекта

### Загрузка файлов
- `POST /api/upload/project/:projectId` - Загрузка изображений
- `DELETE /api/upload/image/:imageId` - Удаление изображения

### Система
- `GET /api/health` - Проверка здоровья сервера

## 🗄️ База данных

### Таблицы:
- `users` - Пользователи
- `projects` - Проекты
- `project_images` - Изображения проектов

### Автоматическая инициализация:
База данных автоматически создается при первом запуске Docker контейнера.

## 🔧 Конфигурация

### Переменные окружения:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=3d_model_generator
DB_USER=postgres
DB_PASSWORD=password

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

## 📁 Структура проекта

```
backend/
├── config/
│   └── database.js          # Конфигурация БД
├── middleware/
│   └── auth.js              # Middleware авторизации
├── routes/
│   ├── auth.js              # Маршруты авторизации
│   ├── projects.js          # Маршруты проектов
│   └── upload.js            # Маршруты загрузки
├── uploads/                 # Загруженные файлы
├── docker-compose.yml       # Docker конфигурация
├── Dockerfile              # Docker образ
├── init.sql                # SQL инициализация
├── server.js               # Главный файл сервера
└── package.json            # Зависимости
```

## 🔒 Безопасность

- **Helmet** - Заголовки безопасности
- **Rate Limiting** - Ограничение запросов
- **CORS** - Настройка кросс-доменных запросов
- **Session** - Безопасные сессии
- **bcrypt** - Хеширование паролей
- **Валидация** - Проверка входных данных

## 📝 Логирование

Сервер логирует:
- Подключения к БД
- Выполненные SQL запросы
- Ошибки авторизации
- Ошибки загрузки файлов

## 🐳 Docker

### Команды:
```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down

# Пересборка
docker-compose up --build

# Просмотр логов
docker-compose logs -f

# Очистка данных
docker-compose down -v
```

## 🔄 Интеграция с Frontend

Backend готов к интеграции с React приложением:
- CORS настроен для `http://localhost:3000`
- Сессии работают с cookies
- API возвращает JSON
- Обработка ошибок стандартизирована
