const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Разрешенные типы изображений
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла. Разрешены только JPEG, PNG и WebP.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB по умолчанию
    files: 4 // максимум 4 файла
  }
});

// Загрузка аватара пользователя
router.post('/avatar', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Нет файла',
        message: 'Пожалуйста, выберите изображение'
      });
    }

    // Сохраняем путь к файлу в профиле пользователя
    await query('UPDATE users SET avatar_path = $1 WHERE id = $2', [req.file.path, req.userId]);

    res.status(201).json({
      message: 'Аватар обновлен',
      avatarPath: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error);
    // Удаляем файл в случае ошибки
    if (req.file) {
      try { require('fs').unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить аватар'
    });
  }
});

// Предпросмотр (мок) сгенерированной 3D-модели по изображению
// Принимает одно изображение и возвращает URL «превью» (для демо берем загруженное изображение)
router.post('/preview', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Нет файла',
        message: 'Пожалуйста, выберите изображение'
      });
    }

    // В реальности здесь должна быть интеграция с генерацией 3D
    // Возвращаем ссылку на загруженное изображение как «превью»
    res.status(200).json({
      message: 'Предпросмотр готов',
      previewUrl: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Ошибка предпросмотра:', error);
    if (req.file) {
      try { require('fs').unlinkSync(req.file.path); } catch {}
    }
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось выполнить предпросмотр'
    });
  }
});

// Загрузка изображений для проекта
router.post('/project/:projectId', requireAuth, upload.array('images', 4), async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      return res.status(400).json({
        error: 'Неверный ID проекта',
        message: 'ID проекта должен быть числом'
      });
    }

    // Проверка существования проекта и принадлежности пользователю
    const projectResult = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Проект не найден',
        message: 'Проект не существует или у вас нет доступа к нему'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Нет файлов для загрузки',
        message: 'Пожалуйста, выберите хотя бы одно изображение'
      });
    }

    // Сохранение информации о файлах в базе данных
    const uploadedFiles = [];
    
    for (const file of req.files) {
      const result = await query(
        `INSERT INTO project_images (project_id, filename, original_name, file_path, file_size, mime_type)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          projectId,
          file.filename,
          file.originalname,
          file.path,
          file.size,
          file.mimetype
        ]
      );

      uploadedFiles.push({
        id: result.rows[0].id,
        filename: result.rows[0].filename,
        originalName: result.rows[0].original_name,
        filePath: `/uploads/${result.rows[0].filename}`,
        fileSize: result.rows[0].file_size,
        mimeType: result.rows[0].mime_type,
        createdAt: result.rows[0].created_at
      });
    }

    res.status(201).json({
      message: 'Изображения успешно загружены',
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Ошибка загрузки файлов:', error);
    
    // Удаляем загруженные файлы в случае ошибки
    if (req.files) {
      req.files.forEach(file => {
        try {
          require('fs').unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Ошибка удаления файла:', unlinkError);
        }
      });
    }

    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось загрузить изображения'
    });
  }
});

// Удаление изображения
router.delete('/image/:imageId', requireAuth, async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);

    if (isNaN(imageId)) {
      return res.status(400).json({
        error: 'Неверный ID изображения',
        message: 'ID изображения должен быть числом'
      });
    }

    // Получение информации об изображении с проверкой доступа
    const imageResult = await query(
      `SELECT pi.* FROM project_images pi
       JOIN projects p ON pi.project_id = p.id
       WHERE pi.id = $1 AND p.user_id = $2`,
      [imageId, req.userId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Изображение не найдено',
        message: 'Изображение не существует или у вас нет доступа к нему'
      });
    }

    const image = imageResult.rows[0];

    // Удаление записи из базы данных
    await query('DELETE FROM project_images WHERE id = $1', [imageId]);

    // Удаление файла с диска
    try {
      require('fs').unlinkSync(image.file_path);
    } catch (unlinkError) {
      console.error('Ошибка удаления файла с диска:', unlinkError);
      // Не возвращаем ошибку, так как запись из БД уже удалена
    }

    res.json({
      message: 'Изображение успешно удалено'
    });

  } catch (error) {
    console.error('Ошибка удаления изображения:', error);
    res.status(500).json({
      error: 'Ошибка сервера',
      message: 'Не удалось удалить изображение'
    });
  }
});

// Обработка ошибок multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Файл слишком большой',
        message: 'Размер файла не должен превышать 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Слишком много файлов',
        message: 'Можно загрузить максимум 4 изображения'
      });
    }
  }

  if (error.message.includes('Неподдерживаемый тип файла')) {
    return res.status(400).json({
      error: 'Неподдерживаемый тип файла',
      message: error.message
    });
  }

  next(error);
});

module.exports = router;
