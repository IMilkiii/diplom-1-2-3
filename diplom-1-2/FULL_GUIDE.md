# 🚀 Полное руководство по запуску проекта

## ✅ **Проект полностью работает!**

### 🌐 **Доступные URL**:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## 🎯 **Как зарегистрироваться и войти**

### 1. **Через веб-интерфейс**:
1. Откройте http://localhost:3000
2. Нажмите "Зарегистрироваться"
3. Заполните форму:
   - **Имя**: Ваше имя
   - **Email**: ваш@email.com
   - **Пароль**: минимум 6 символов
4. Нажмите "Зарегистрироваться"
5. Войдите с теми же данными

### 2. **Через API (для тестирования)**:

#### Регистрация:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ваше Имя","email":"ваш@email.com","password":"вашпароль"}'
```

#### Вход:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ваш@email.com","password":"вашпароль"}'
```

## 👥 **Где найти зарегистрированных пользователей**

### 1. **В базе данных PostgreSQL**:
```bash
# Перейдите в папку backend
cd backend

# Подключитесь к базе данных
docker-compose exec postgres psql -U postgres -d 3d_model_generator

# Выполните SQL запрос
SELECT id, email, name, created_at FROM users;
```

### 2. **Через API**:
```bash
# Получить информацию о текущем пользователе (требует авторизации)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

### 3. **Автоматическое тестирование**:
```bash
# Запустите скрипт тестирования
test-api.bat
```

## 🔧 **Управление проектом**

### Запуск всех сервисов:
```bash
# Автоматический запуск
start-with-docker.bat

# Или ручной запуск
cd backend
docker-compose up -d
cd ..
npm start
```

### Остановка:
```bash
cd backend
docker-compose down
```

### Просмотр логов:
```bash
cd backend
docker-compose logs -f
```

## 📊 **Структура базы данных**

### Таблица `users`:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `projects`:
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица `project_images`:
```sql
CREATE TABLE project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 **Тестирование функций**

### 1. **Авторизация**:
- ✅ Регистрация пользователя
- ✅ Вход в систему
- ✅ Выход из системы
- ✅ Проверка сессии

### 2. **Проекты**:
- ✅ Создание проекта
- ✅ Получение списка проектов
- ✅ Обновление проекта
- ✅ Удаление проекта

### 3. **Загрузка файлов**:
- ✅ Загрузка изображений
- ✅ Сохранение в файловую систему
- ✅ Связывание с проектами

## 🎯 **Примеры использования**

### Создание проекта:
```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{"name":"Мой первый проект","description":"Описание проекта"}'
```

### Получение проектов:
```bash
curl -X GET http://localhost:8000/api/projects \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

### Загрузка изображения:
```bash
curl -X POST http://localhost:8000/api/upload \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -F "image=@/path/to/your/image.jpg" \
  -F "projectId=1"
```

## 🔍 **Отладка**

### Проверка статуса сервисов:
```bash
# Docker контейнеры
docker-compose ps

# Health check
curl http://localhost:8000/api/health

# Логи backend
docker-compose logs -f backend

# Логи PostgreSQL
docker-compose logs -f postgres
```

### Частые проблемы:

1. **Порт 8000 занят**: Docker уже запущен
2. **Порт 3000 занят**: Frontend уже запущен
3. **База данных недоступна**: Проверьте статус PostgreSQL
4. **Ошибки авторизации**: Проверьте cookies в браузере

## 🎉 **Готово к использованию!**

Проект полностью настроен и готов к работе:
- ✅ **Frontend** - React приложение
- ✅ **Backend** - Node.js API с авторизацией
- ✅ **Database** - PostgreSQL с автоматической инициализацией
- ✅ **Docker** - Контейнеризация для простого развертывания

**Откройте http://localhost:3000 и начните использовать приложение!** 🚀


