const express = require('express');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Получение всех публичных проектов (для главной страницы)
router.get('/public', async (req, res) => {
  try {
    const { q, sort = 'created_at', order = 'desc' } = req.query;

    const allowedOrder = new Set(['asc', 'desc']);
    const sortMap = {
      created_at: 'p.created_at',
      updated_at: 'p.updated_at',
      name: 'p.name',
      author: 'u.name NULLS LAST'
    };
    const sortKey = typeof sort === 'string' && sortMap[sort] ? sort : 'created_at';
    const sortExpr = sortMap[sortKey];
    const sortOrder = allowedOrder.has(String(order).toLowerCase()) ? String(order).toLowerCase() : 'desc';

    const values = [];
    let where = 'WHERE p.is_public = TRUE';
    if (q && String(q).trim().length > 0) {
      values.push(`%${String(q).trim()}%`);
      where += ` AND (p.name ILIKE $1 OR p.description ILIKE $1 OR u.email ILIKE $1 OR u.name ILIKE $1)`;
    }

    const result = await query(
      `SELECT p.id, p.name, p.description, p.is_public, p.status, p.result_file, p.created_at, p.updated_at,
              u.email as user_email, u.name as user_name,
              COALESCE(
                (SELECT pi.file_path 
                 FROM project_images pi 
                 WHERE pi.project_id = p.id 
                 ORDER BY pi.created_at ASC 
                 LIMIT 1), 
                'default-thumbnail.jpg'
              ) as thumbnail
       FROM projects p 
       JOIN users u ON p.user_id = u.id
       ${where}
       ORDER BY ${sortExpr} ${sortOrder}`,
      values
    );

    res.json({
      projects: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        is_public: row.is_public,
        status: row.status,
        result_file: row.result_file,
        created_at: row.created_at,
        updated_at: row.updated_at,
        thumbnail: row.thumbnail,
        user: {
          email: row.user_email,
          name: row.user_name
        }
      }))
    });

  } catch (error) {
    console.error('Ошибка получения публичных проектов:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось получить список проектов'
    });
  }
});

// Получение всех проектов пользователя
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.id, p.name, p.description, p.is_public, p.status, p.result_file, p.created_at, p.updated_at,
              COALESCE(
                (SELECT pi.file_path 
                 FROM project_images pi 
                 WHERE pi.project_id = p.id 
                 ORDER BY pi.created_at ASC 
                 LIMIT 1), 
                'default-thumbnail.jpg'
              ) as thumbnail
       FROM projects p 
       WHERE p.user_id = $1 
       ORDER BY p.created_at DESC`,
      [req.userId]
    );

    res.json({
      projects: result.rows
    });

  } catch (error) {
    console.error('Ошибка получения проектов:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось получить список проектов'
    });
  }
});

// Создание нового проекта
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, is_public } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Неверные данные',
        message: 'Название проекта обязательно'
      });
    }

    const result = await query(
      'INSERT INTO projects (user_id, name, description, is_public) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, name.trim(), description || null, Boolean(is_public)]
    );

    const project = result.rows[0];

    res.status(201).json({
      message: 'Проект успешно создан',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        is_public: project.is_public,
        status: project.status,
        createdAt: project.created_at
      }
    });

  } catch (error) {
    console.error('Ошибка создания проекта:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось создать проект'
    });
  }
});

// Получение конкретного проекта
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    if (isNaN(projectId)) {
      return res.status(400).json({
        error: 'Неверный ID проекта',
        message: 'ID проекта должен быть числом'
      });
    }

    // Получение проекта
    const projectResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Проект не найден',
        message: 'Проект не существует или у вас нет доступа к нему'
      });
    }

    // Получение изображений проекта
    const imagesResult = await query(
      'SELECT * FROM project_images WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );

    const project = projectResult.rows[0];
    const images = imagesResult.rows;

    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        is_public: project.is_public,
        status: project.status,
        resultFile: project.result_file,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        images: images.map(img => ({
          id: img.id,
          filename: img.filename,
          originalName: img.original_name,
          filePath: img.file_path,
          fileSize: img.file_size,
          mimeType: img.mime_type,
          createdAt: img.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Ошибка получения проекта:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось получить проект'
    });
  }
});

// Обновление проекта
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const { name, description, status, is_public } = req.body;

    if (isNaN(projectId)) {
      return res.status(400).json({
        error: 'Неверный ID проекта',
        message: 'ID проекта должен быть числом'
      });
    }

    // Проверка существования проекта
    const existingProject = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.userId]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        error: 'Проект не найден',
        message: 'Проект не существует или у вас нет доступа к нему'
      });
    }

    // Подготовка данных для обновления
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name.trim());
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (is_public !== undefined) {
      updates.push(`is_public = $${paramCount++}`);
      values.push(Boolean(is_public));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Нет данных для обновления',
        message: 'Необходимо указать хотя бы одно поле для обновления'
      });
    }

    values.push(projectId);

    const result = await query(
      `UPDATE projects SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const project = result.rows[0];

    res.json({
      message: 'Проект успешно обновлен',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        is_public: project.is_public,
        status: project.status,
        resultFile: project.result_file,
        updatedAt: project.updated_at
      }
    });

  } catch (error) {
    console.error('Ошибка обновления проекта:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось обновить проект'
    });
  }
});

// Удаление проекта
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    if (isNaN(projectId)) {
      return res.status(400).json({
        error: 'Неверный ID проекта',
        message: 'ID проекта должен быть числом'
      });
    }

    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [projectId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Проект не найден',
        message: 'Проект не существует или у вас нет доступа к нему'
      });
    }

    res.json({
      message: 'Проект успешно удален'
    });

  } catch (error) {
    console.error('Ошибка удаления проекта:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось удалить проект'
    });
  }
});

module.exports = router;
