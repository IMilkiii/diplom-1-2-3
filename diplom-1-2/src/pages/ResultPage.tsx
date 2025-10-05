import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResultPage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/project/new');
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    
    // Имитация скачивания файла
    setTimeout(() => {
      setIsDownloading(false);
      
      // Создаем ссылку для скачивания
      const link = document.createElement('a');
      link.href = 'data:application/octet-stream;base64,'; // Пустой файл для демонстрации
      link.download = '3d-model.fbx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Файл успешно скачан!');
    }, 2000);
  };


  return (
    <div className="page">
      <header className="header">
        <div className="header-content">
          <div className="header-logo"></div>
          <div className="header-actions">
            <div className="user-avatar" title="Профиль">
              U
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="container">
          <button 
            className="btn btn-outline" 
            onClick={handleBack}
            style={{ marginBottom: '24px' }}
          >
            Назад
          </button>
          
          <div className="success-message">
            <h2>Готово! Файл преобразован в FBX</h2>
            
            <div style={{ marginTop: '32px' }}>
              <button
                className="btn btn-secondary"
                onClick={handleDownload}
                disabled={isDownloading}
                style={{ minWidth: '200px' }}
              >
                {isDownloading ? (
                  <>
                    <span style={{ 
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid #f3f3f3',
                      borderTop: '2px solid #6c757d',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '8px'
                    }}></span>
                    Скачивание...
                  </>
                ) : (
                  'Скачать файл'
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ResultPage;
