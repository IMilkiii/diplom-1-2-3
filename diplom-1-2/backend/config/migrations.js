const { query } = require('./database');

async function runMigrations() {
  // Добавляем безопасные миграции, которые можно запускать многократно
  await query(`
    ALTER TABLE IF EXISTS users
      ADD COLUMN IF NOT EXISTS name VARCHAR(255);
  `, []);

  await query(`CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);`, []);
  await query(`CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);`, []);

  // Проекты: публичность проекта
  await query(`
    ALTER TABLE IF EXISTS projects
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
  `, []);
  await query(`CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);`, []);
}

module.exports = { runMigrations };


