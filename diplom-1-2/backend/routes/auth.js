const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { requireAuth, requireGuest } = require('../middleware/auth');

const router = express.Router();

// Регистрация
router.post('/register', requireGuest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
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

    // Проверка существования пользователя
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Пользователь уже существует',
        message: 'Пользователь с таким email уже зарегистрирован'
      });
    }

    // Хеширование пароля
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Создание пользователя
    const result = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );

    const user = result.rows[0];

    // Создание сессии
    req.session.userId = user.id;
    req.session.userEmail = user.email;

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at
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

// Авторизация
router.post('/login', requireGuest, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({
        error: 'Не все поля заполнены',
        message: 'Пожалуйста, введите email и пароль'
      });
    }

    // Поиск пользователя
    const result = await query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Неверные данные',
        message: 'Неверный email или пароль'
      });
    }

    const user = result.rows[0];

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Неверные данные',
        message: 'Неверный email или пароль'
      });
    }

    // Создание сессии
    req.session.userId = user.id;
    req.session.userEmail = user.email;

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

// Выход
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при выходе:', err);
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

// Получение информации о текущем пользователе
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Пользователь не найден',
        message: 'Пользователь не существует'
      });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось получить информацию о пользователе'
    });
  }
});

// Проверка статуса авторизации
router.get('/status', (req, res) => {
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

module.exports = router;
// Обновление профиля (имя)
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    await query('UPDATE users SET name = $1 WHERE id = $2', [name || null, req.userId]);
    const result = await query('SELECT id, email, name, created_at FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    res.json({
      message: 'Профиль обновлен',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера', message: 'Не удалось обновить профиль' });
  }
});
