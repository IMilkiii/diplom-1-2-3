// Middleware для проверки аутентификации
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    next();
  } else {
    res.status(401).json({ 
      error: 'Необходима авторизация',
      message: 'Пожалуйста, войдите в систему'
    });
  }
};

// Middleware для проверки, что пользователь не авторизован
const requireGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    res.status(400).json({ 
      error: 'Уже авторизован',
      message: 'Вы уже вошли в систему'
    });
  } else {
    next();
  }
};

// Middleware для получения информации о пользователе (опционально)
const optionalAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
  }
  next();
};

module.exports = {
  requireAuth,
  requireGuest,
  optionalAuth
};
