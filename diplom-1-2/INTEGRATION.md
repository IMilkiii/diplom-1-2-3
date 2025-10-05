# Интеграция Frontend с Backend

## 🚀 Текущий статус

### ✅ Backend готов:
- **Демо-сервер**: http://localhost:8000
- **Health check**: http://localhost:8000/api/health
- **Авторизация**: Регистрация, вход, выход
- **Проекты**: CRUD операции
- **Данные**: Хранятся в памяти (для демонстрации)

### ✅ Frontend готов:
- **React приложение**: http://localhost:3000
- **Страницы**: Авторизация, дашборд, создание проекта, результат
- **Дизайн**: Соответствует макету
- **Роутинг**: Настроен

## 🔗 Следующие шаги интеграции

### 1. Создать API клиент в React

Создать файл `src/api/client.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      credentials: 'include', // Для сессий
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка API');
    }

    return data;
  }

  // Авторизация
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Проекты
  async getProjects() {
    return this.request('/projects');
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }
}

export default new ApiClient();
```

### 2. Создать контекст авторизации

Создать файл `src/contexts/AuthContext.js`:
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await ApiClient.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await ApiClient.login(credentials);
    setUser(response.user);
    return response;
  };

  const register = async (userData) => {
    const response = await ApiClient.register(userData);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await ApiClient.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 3. Обновить App.js

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectCreationPage from './pages/ProjectCreationPage';
import ResultPage from './pages/ResultPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/project/new" element={<ProjectCreationPage />} />
            <Route path="/project/result" element={<ResultPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 4. Обновить LoginPage

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ email, password, name });
      }
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... остальной код компонента
};
```

## 🧪 Тестирование API

### Проверка работы backend:

1. **Health check**:
   ```bash
   curl http://localhost:8000/api/health
   ```

2. **Регистрация**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456","name":"Test User"}'
   ```

3. **Вход**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456"}'
   ```

## 📊 API Endpoints

### Авторизация:
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `GET /api/auth/me` - Информация о пользователе
- `GET /api/auth/status` - Статус авторизации

### Проекты:
- `GET /api/projects` - Список проектов
- `POST /api/projects` - Создание проекта

## 🚀 Запуск

1. **Backend** (в одном терминале):
   ```bash
   cd backend
   node server-simple.js
   ```

2. **Frontend** (в другом терминале):
   ```bash
   npm start
   ```

## 🔄 Следующие шаги

1. Интегрировать авторизацию в React
2. Подключить управление проектами
3. Добавить загрузку изображений
4. Реализовать защищенные маршруты
5. Добавить обработку ошибок
6. Создать полноценную версию с PostgreSQL
