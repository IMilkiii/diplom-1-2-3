const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || '3d_model_generator',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // максимум соединений в пуле
  idleTimeoutMillis: 30000, // время ожидания неактивного соединения
  connectionTimeoutMillis: 2000, // время ожидания соединения
});

// Проверка подключения к базе данных
pool.on('connect', () => {
  console.log('✅ Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
  console.error('❌ Ошибка подключения к PostgreSQL:', err);
});

// Функция для выполнения запросов
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Выполнен запрос:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Ошибка выполнения запроса:', error);
    throw error;
  }
};

// Функция для получения клиента из пула
const getClient = async () => {
  return await pool.connect();
};

module.exports = {
  query,
  getClient,
  pool
};
