# 🐳 Установка Docker Desktop для Windows

## 📥 Скачивание и установка

### Шаг 1: Скачивание
1. Перейдите на официальный сайт: https://www.docker.com/products/docker-desktop/
2. Нажмите кнопку **"Download for Windows"**
3. Скачайте файл `Docker Desktop Installer.exe`

### Шаг 2: Установка
1. **Запустите** скачанный файл `Docker Desktop Installer.exe`
2. **Следуйте** инструкциям установщика
3. **Важно**: Убедитесь, что включена опция **"Use WSL 2 instead of Hyper-V"**
4. **Дождитесь** завершения установки

### Шаг 3: Перезагрузка
1. **Перезагрузите** компьютер после установки
2. Это необходимо для корректной работы WSL 2

### Шаг 4: Первый запуск
1. Найдите **Docker Desktop** в меню Пуск
2. **Запустите** приложение
3. **Дождитесь** полной загрузки (иконка в трее станет зеленой)
4. При первом запуске может потребоваться принять лицензионное соглашение

## 🔧 Проверка установки

Откройте PowerShell или командную строку и выполните:

```bash
# Проверка версии Docker
docker --version

# Проверка версии Docker Compose
docker-compose --version

# Тестовый запуск контейнера
docker run hello-world
```

Если команды выполняются без ошибок - Docker установлен корректно!

## 🚀 Запуск проекта с Docker

После установки Docker:

### Вариант 1: Автоматический запуск
```bash
# Дважды кликните на файл:
start-with-docker.bat
```

### Вариант 2: Ручной запуск
```bash
# 1. Перейдите в папку backend
cd backend

# 2. Запустите Docker контейнеры
docker-compose up --build -d

# 3. Проверьте работу
curl http://localhost:8000/api/health

# 4. Запустите frontend (в другом терминале)
cd ..
npm start
```

## 🛠️ Полезные команды Docker

```bash
# Просмотр запущенных контейнеров
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановка контейнеров
docker-compose down

# Перезапуск сервиса
docker-compose restart backend

# Подключение к PostgreSQL
docker-compose exec postgres psql -U postgres -d 3d_model_generator
```

## 🔍 Решение проблем

### Проблема: "Docker is not running"
**Решение**: Запустите Docker Desktop и дождитесь полной загрузки

### Проблема: "Port already in use"
**Решение**: 
```bash
docker-compose down
# Или измените порты в docker-compose.yml
```

### Проблема: "WSL 2 installation is incomplete"
**Решение**:
```bash
# Установите WSL 2
wsl --install

# Перезагрузите компьютер
```

### Проблема: "Permission denied"
**Решение**: Запустите PowerShell как администратор

## 📊 Структура Docker

```
backend/
├── docker-compose.yml     # Конфигурация сервисов
├── Dockerfile.dev         # Образ для разработки
├── init.sql              # Инициализация БД
├── docker-start.bat      # Скрипт запуска
├── docker-stop.bat       # Скрипт остановки
└── docker-logs.bat       # Скрипт просмотра логов
```

## 🎯 Что получится

После установки Docker и запуска проекта:

- **PostgreSQL** будет работать в контейнере на порту 5432
- **Backend** будет работать в контейнере на порту 8000
- **Frontend** будет работать локально на порту 3000
- **Данные** будут сохраняться между перезапусками
- **Автоматическая** инициализация базы данных

## 📝 Следующие шаги

1. ✅ Установите Docker Desktop
2. ✅ Перезагрузите компьютер
3. ✅ Запустите Docker Desktop
4. ✅ Выполните проверку установки
5. ✅ Запустите проект с Docker
6. ✅ Протестируйте работу API
