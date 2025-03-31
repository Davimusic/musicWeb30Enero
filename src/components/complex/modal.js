import { useState, useEffect } from 'react';
import '../../estilos/general/general.css'

const Modal = ({ isOpen, onClose, children, style, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

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
        ...styles.overlay,
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
          ...styles.modal,
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
          maxHeight: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <button 
            className='color2' 
            onClick={handleClose} 
            style={styles.closeButton}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
  },
  modal: {
    padding: '0',
    borderRadius: '8px',
    position: 'relative',
    zIndex: 1001,
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '90vw',
    width: 'auto',
  },
  header: {
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
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    padding: '0 10px',
    lineHeight: '1',
  },
  content: {
    overflowY: 'auto',
    maxHeight: 'calc(80vh - 40px)',
    scrollbarWidth: 'none', // Para Firefox
    msOverflowStyle: 'none', // Para IE/Edge
    '&::-webkit-scrollbar': {
      display: 'none', // Para Chrome/Safari
    },
    padding: '0 15px 15px',
  },
};

// Añadimos los estilos para ocultar scroll en navegadores WebKit
const styleElement = document.createElement('style');
styleElement.innerHTML = `
  .modal-content::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(styleElement);

export default Modal;