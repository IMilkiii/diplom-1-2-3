# 🐳 Настройка Docker для проекта

## 📥 Установка Docker Desktop

### Windows:

1. **Скачайте Docker Desktop**:
   - Перейдите на https://www.docker.com/products/docker-desktop/
   - Нажмите "Download for Windows"
   - Скачайте установщик

2. **Установите Docker Desktop**:
   - Запустите скачанный файл `Docker Desktop Installer.exe`
   - Следуйте инструкциям установщика
   - **Важно**: Убедитесь, что включена опция "Use WSL 2 instead of Hyper-V"

3. **Перезагрузите компьютер** после установки

4. **Запустите Docker Desktop**:
   - Найдите Docker Desktop в меню Пуск
   - Запустите приложение
   - Дождитесь полной загрузки (иконка в трее станет зеленой)

5. **Проверьте установку**:
   ```bash
   docker --version
   docker-compose --version
   ```

## 🚀 Альтернативная установка через Chocolatey

Если у вас установлен Chocolatey:

```bash
# Установка Docker Desktop
choco install docker-desktop

# Или через winget
winget install Docker.DockerDesktop
```

## 🔧 Настройка проекта для Docker

### 1. Обновим docker-compose.yml

Создадим улучшенную версию с поддержкой разработки:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: 3d_model_db
    environment:
      POSTGRES_DB: 3d_model_generator
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: 
      context: .
      dockerfile: Dockerfile.dev
    container_name: 3d_model_backend
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=3d_model_generator
      - DB_USER=postgres
      - DB_PASSWORD=password
      - SESSION_SECRET=your-super-secret-session-key-here
      - FRONTEND_URL=http://localhost:3000
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
      - ./:/app
      - /app/node_modules
    restart: unless-stopped
    command: npm run dev

volumes:
  postgres_data:
```

### 2. Создадим Dockerfile для разработки

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p uploads

# Открываем порт
EXPOSE 8000

# Запускаем в режиме разработки
CMD ["npm", "run", "dev"]
```

### 3. Создадим скрипты для удобства

```bash
# Запуск всех сервисов
docker-compose up -d

# Запуск только PostgreSQL
docker-compose up -d postgres

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка
docker-compose up --build

# Очистка данных
docker-compose down -v
```

## 🧪 Тестирование Docker

После установки Docker:

1. **Проверьте версию**:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Запустите тестовый контейнер**:
   ```bash
   docker run hello-world
   ```

3. **Запустите проект**:
   ```bash
   cd backend
   docker-compose up -d
   ```

4. **Проверьте работу**:
   - Backend: http://localhost:8000/api/health
   - PostgreSQL: localhost:5432

## 🔍 Отладка Docker

### Проблемы и решения:

1. **"Docker is not running"**:
   - Запустите Docker Desktop
   - Дождитесь полной загрузки

2. **"Port already in use"**:
   ```bash
   # Остановите все контейнеры
   docker-compose down
   
   # Или измените порты в docker-compose.yml
   ```

3. **"Permission denied"**:
   - Запустите PowerShell как администратор
   - Или используйте WSL2

4. **"WSL 2 installation is incomplete"**:
   - Установите WSL2: `wsl --install`
   - Перезагрузите компьютер

## 📊 Мониторинг

### Полезные команды:

```bash
# Статус контейнеров
docker-compose ps

# Логи backend
docker-compose logs -f backend

# Логи PostgreSQL
docker-compose logs -f postgres

# Подключение к PostgreSQL
docker-compose exec postgres psql -U postgres -d 3d_model_generator

# Перезапуск сервиса
docker-compose restart backend
```

## 🚀 Быстрый старт

После установки Docker:

```bash
# 1. Перейдите в папку backend
cd backend

# 2. Запустите все сервисы
docker-compose up -d

# 3. Проверьте работу
curl http://localhost:8000/api/health

# 4. Запустите frontend (в другом терминале)
cd ..
npm start
```

## 📝 Следующие шаги

1. Установите Docker Desktop
2. Перезагрузите компьютер
3. Запустите Docker Desktop
4. Выполните команды из "Быстрый старт"
5. Протестируйте работу API
