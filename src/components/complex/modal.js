import { useState, useEffect } from 'react';
import '../../estilos/general/general.css';

const Modal = ({ isOpen, onClose, children, style, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Efecto para manejar la visibilidad del modal
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Efecto para añadir estilos de scroll solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = `
        .modal-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(styleElement);

      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        cursor: 'pointer',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        backgroundColor: '#000000b2',
      }}
    >
      <div
        className={`${className} borderRadius1`}
        style={{
          backgroundColor: 'black',
          ...style,
          padding: '0',
          borderRadius: '8px',
          position: 'relative',
          zIndex: 1001,
          cursor: 'default',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '90vw',
          width: 'auto',
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: 'black',
          padding: '5px 15px',
          minHeight: '40px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}>
          <button 
            className='color2' 
            onClick={handleClose} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '32px',
              cursor: 'pointer',
              padding: '0 10px',
              lineHeight: '1',
            }}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        <div 
          className="modal-scroll-container"
          style={{
            overflowY: 'auto',
            maxHeight: 'calc(80vh - 40px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '0 15px 15px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;