import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LocationState {
  previewUrl: string;
  projectName: string;
  is_public?: boolean;
  images: File[];
}

const PreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [previewUrl, setPreviewUrl] = useState<string>(state.previewUrl);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleDislike = async () => {
    if (!state.images || state.images.length === 0) return;
    setIsBusy(true);
    try {
      // Повторная генерация предпросмотра по первой картинке
      const res = await api.generatePreview(state.images[0]);
      setPreviewUrl(res.previewUrl);
    } catch (e) {
      alert('Не удалось сгенерировать предпросмотр заново');
    } finally {
      setIsBusy(false);
    }
  };

  const handleLike = async () => {
    setIsBusy(true);
    try {
      // 1) Создаем проект
      const created = await api.createProject({ name: state.projectName, is_public: state.is_public });
      const projectId = created.project.id ?? created.projectId ?? created.id;

      // 2) Загружаем все изображения в проект
      await api.uploadProjectImages(projectId, state.images);

      // 3) Переходим на страницу результата
      navigate('/project/result');
    } catch (e) {
      alert('Не удалось создать проект');
    } finally {
      setIsBusy(false);
    }
  };

  const handleBack = () => navigate('/project/new');

  return (
    <div className="page">
      <header className="header">
        <div className="header-content">
          <div className="header-logo"></div>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleBack}>Назад</button>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 style={{ marginBottom: 16 }}>Вам нравится сгенерированная 3D-модель?</h2>
          <div className="card" style={{ padding: 16 }}>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#666' }}>Нет предпросмотра</div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="btn btn-outline" onClick={handleDislike} disabled={isBusy}>
                Не нравится — сгенерировать снова
              </button>
              <button className="btn btn-secondary" onClick={handleLike} disabled={isBusy}>
                Нравится — создать проект
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;


