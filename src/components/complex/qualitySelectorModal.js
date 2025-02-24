import React from 'react';

const QualitySelectorModal = ({ isOpen, onClose, onQualityChange, quality }) => {
  if (!isOpen) return null;

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
    },
    modalContent: {
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '300px',
      textAlign: 'center', // Centra el texto dentro del modal
    },
    qualityOptionButton: {
      display: 'block',
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
    },
    closeButton: {
      display: 'block',
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
    },
    title: {
      color: 'white',
      textAlign: 'center', // Centra el texto del título
      marginBottom: '20px', // Añade un margen inferior para separar el título de los botones
    },
  };

  // Función para determinar el estilo del botón según la calidad seleccionada
  const getButtonStyle = (optionQuality) => {
    const baseStyle = { ...styles.qualityOptionButton };
    if (optionQuality === quality) {
      return { ...baseStyle, border: '2px solid #FFD700', fontWeight: 'bold' }; // Resaltar la opción seleccionada
    }
    return baseStyle;
  };

  return (
    <div style={styles.modalOverlay}>
      <div className='backgroundColor2' style={styles.modalContent}>
        <p className='title-md' style={styles.title}>Selecciona la calidad</p>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(100)}
          style={getButtonStyle(100)}
        >
          Alta
        </button>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(75)}
          style={getButtonStyle(75)}
        >
          Media
        </button>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(50)}
          style={getButtonStyle(50)}
        >
          Baja
        </button>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(25)}
          style={getButtonStyle(25)}
        >
          Muy baja
        </button>
        <button className='backgroundColor4' onClick={onClose} style={styles.closeButton}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default QualitySelectorModal;
