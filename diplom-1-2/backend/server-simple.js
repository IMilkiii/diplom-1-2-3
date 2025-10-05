const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Простое хранилище в памяти (для демонстрации)
const users = new Map();
const projects = new Map();
let nextUserId = 1;
let nextProjectId = 1;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: 'demo-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0-demo',
    users: users.size,
    projects: projects.size
  });
});

// Авторизация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Не все поля заполнены',
        message: 'Пожалуйста, заполните все обязательные поля'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Слишком короткий пароль',
        message: 'Пароль должен содержать минимум 6 символов'
      });
    }

    if (users.has(email)) {
      return res.status(409).json({
        error: 'Пользователь уже существует',
        message: 'Пользователь с таким email уже зарегистрирован'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = nextUserId++;
    
    const user = {
      id: userId,
      email,
      name,
      passwordHash,
      createdAt: new Date()
    };

    users.set(email, user);

    req.session.userId = userId;
    req.session.userEmail = email;

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось зарегистрировать пользователя'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Не все поля заполнены',
        message: 'Пожалуйста, введите email и пароль'
      });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        error: 'Неверные данные',
        message: 'Неверный email или пароль'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Неверные данные',
        message: 'Неверный email или пароль'
      });
    }

    req.session.userId = user.id;
    req.session.userEmail = email;

    res.json({
      message: 'Успешная авторизация',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось авторизовать пользователя'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Ошибка сервера',
        message: 'Не удалось выйти из системы'
      });
    }

    res.clearCookie('connect.sid');
    res.json({
      message: 'Успешный выход из системы'
    });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: 'Необходима авторизация',
      message: 'Пожалуйста, войдите в систему'
    });
  }

  const user = Array.from(users.values()).find(u => u.id === req.session.userId);
  if (!user) {
    return res.status(404).json({
      error: 'Пользователь не найден',
      message: 'Пользователь не существует'
    });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      userId: req.session.userId,
      userEmail: req.session.userEmail
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// Проекты
app.get('/api/projects', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: 'Необходима авторизация',
      message: 'Пожалуйста, войдите в систему'
    });
  }

  const userProjects = Array.from(projects.values())
    .filter(p => p.userId === req.session.userId)
    .map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      resultFile: p.resultFile,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      thumbnail: 'https://via.placeholder.com/300x200/667eea/ffffff?text=3D+Model'
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    projects: userProjects
  });
});

app.post('/api/projects', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({
      error: 'Необходима авторизация',
      message: 'Пожалуйста, войдите в систему'
    });
  }

  const { name, description } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Неверные данные',
      message: 'Название проекта обязательно'
    });
  }

  const projectId = nextProjectId++;
  const project = {
    id: projectId,
    userId: req.session.userId,
    name: name.trim(),
    description: description || null,
    status: 'processing',
    resultFile: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  projects.set(projectId, project);

  res.status(201).json({
    message: 'Проект успешно создан',
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      createdAt: project.createdAt
    }
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: 'Что-то пошло не так'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Демо-сервер запущен на порту ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Frontend URL: http://localhost:3000`);
  console.log(`💾 Режим: Демонстрационный (данные в памяти)`);
});
