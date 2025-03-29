import { useState, useEffect } from 'react';
import '../../estilos/general/general.css'

const Modal = ({ isOpen, onClose, children, style, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Activar la visibilidad para la animación de entrada
      setIsVisible(true);
    } else {
      // Iniciar la animación de salida
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    // Iniciar la animación de salida
    setIsVisible(false);
    // Esperar a que termine la animación antes de cerrar el modal
    setTimeout(() => {
      onClose();
    }, 300); // 300ms debe coincidir con la duración de la animación
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        backgroundColor: '#000000b2'
      }}
    >
      <div
        className={className}
        style={{
          backgroundColor: 'black',
          ...style,
          ...styles.modal,
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          opacity: isVisible ? 1 : 0,
          transition: 'transform 0.3s ease, opacity 0.3s ease',
        }}
      >
        <div style={{padding: '20px'}}>
        <button className='color2' onClick={handleClose} style={styles.closeButton}>
          ×
        </button>
        </div>
        {children}
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
    //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10001,
  },
  modal: {
    padding: '20px',
    borderRadius: '8px',
    position: 'relative',
    //backgroundColor: 'white',
    zIndex: 1001,
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '40px',
    cursor: 'pointer',
  },
};

export default Modal;