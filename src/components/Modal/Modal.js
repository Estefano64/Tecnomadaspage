import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, config }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Tiempo para animación de salida
  };

  if (!isOpen && !visible) return null;

  const modalStyle = {
    backgroundColor: config?.color_fondo || '#ffffff',
    color: config?.color_texto || '#000000',
    maxWidth: config?.tamaño === 'pequeño' ? '400px' :
              config?.tamaño === 'grande' ? '800px' : '600px',
    width: '90%',
    maxHeight: '80vh',
    transform: visible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(-20px)',
    opacity: visible ? 1 : 0,
    transition: 'all 0.3s ease'
  };

  return (
    <>
      <div 
        className={`modal-overlay ${visible ? 'visible' : ''}`}
        onClick={handleClose}
      >
        <div 
          className="modal-content"
          style={modalStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
          
          <div className="modal-body">
            {config?.titulo && (
              <h2 className="modal-title">{config.titulo}</h2>
            )}
            
            {config?.imagen_url && (
              <div className="modal-image">
                <img src={config.imagen_url} alt={config.titulo} />
              </div>
            )}
            
            <div 
              className="modal-text"
              dangerouslySetInnerHTML={{ __html: config?.contenido || '' }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .modal-overlay.visible {
          opacity: 1;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          position: relative;
          padding: 2rem;
          overflow-y: auto;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          transition: opacity 0.2s;
          z-index: 1;
        }

        .modal-close:hover {
          opacity: 1;
        }

        .modal-title {
          margin: 0 0 1.5rem 0;
          color: inherit;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .modal-text {
          line-height: 1.6;
          color: inherit;
        }

        .modal-text h1, 
        .modal-text h2, 
        .modal-text h3, 
        .modal-text h4, 
        .modal-text h5, 
        .modal-text h6 {
          color: inherit;
          margin-top: 0;
        }

        .modal-text p {
          margin-bottom: 1rem;
        }

        .modal-text a {
          color: #007bff;
          text-decoration: none;
        }

        .modal-text a:hover {
          text-decoration: underline;
        }

        .modal-image {
          margin: 1rem 0 1.5rem 0;
          text-align: center;
        }

        .modal-image img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          max-height: 300px;
          object-fit: cover;
        }

        .modal-text img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }

        .modal-text ul, 
        .modal-text ol {
          padding-left: 2rem;
        }

        .modal-text li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 1rem;
            padding: 1.5rem;
            max-height: 85vh;
          }

          .modal-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default Modal;