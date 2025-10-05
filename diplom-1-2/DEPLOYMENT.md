# Инструкции по развертыванию

## Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd diplom
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Запустите приложение:**
   ```bash
   npm start
   ```

4. **Откройте браузер:**
   ```
   http://localhost:3000
   ```

## Сборка для продакшена

1. **Создайте продакшн сборку:**
   ```bash
   npm run build
   ```

2. **Файлы будут созданы в папке `build/`**

## Развертывание на Vercel

1. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Войдите в аккаунт:**
   ```bash
   vercel login
   ```

3. **Разверните проект:**
   ```bash
   vercel --prod
   ```

## Развертывание на Netlify

1. **Установите Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Соберите проект:**
   ```bash
   npm run build
   ```

3. **Разверните:**
   ```bash
   netlify deploy --prod --dir=build
   ```

## Развертывание на GitHub Pages

1. **Установите gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Добавьте скрипты в package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

3. **Разверните:**
   ```bash
   npm run deploy
   ```

## Docker развертывание

1. **Создайте Dockerfile:**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Соберите и запустите:**
   ```bash
   docker build -t 3d-model-generator .
   docker run -p 80:80 3d-model-generator
   ```

## Переменные окружения

Создайте файл `.env` для локальной разработки:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_UPLOAD_MAX_SIZE=10485760
REACT_APP_SUPPORTED_FORMATS=jpg,jpeg,png,webp
```

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
├── pages/              # Страницы приложения
├── hooks/              # Пользовательские хуки
├── utils/              # Утилиты
├── types/              # TypeScript типы
├── constants/          # Константы
├── data/               # Моковые данные
└── styles/             # Стили и анимации
```

## Следующие шаги для продакшена

1. **Backend API** - Создание сервера для обработки запросов
2. **База данных** - Настройка PostgreSQL/MongoDB
3. **Файловое хранилище** - AWS S3 или аналогичное
4. **ИИ сервис** - Интеграция с сервисом генерации 3D моделей
5. **Аутентификация** - JWT токены или OAuth
6. **Мониторинг** - Логирование и аналитика
7. **Тестирование** - Unit и интеграционные тесты
8. **CI/CD** - Автоматическое развертывание
