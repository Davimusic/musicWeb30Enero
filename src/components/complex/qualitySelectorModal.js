import React from 'react';

const QualitySelectorModal = ({ isOpen, onClose, onQualityChange, quality }) => {
  if (!isOpen) return null;

  // Función para determinar el estilo del botón según la calidad seleccionada
  const getButtonStyle = (optionQuality) => {
    const rootStyles = getComputedStyle(document.documentElement);
    if (optionQuality === quality) {
      return { 
        display: 'block',
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        border: `2px solid ${rootStyles.getPropertyValue('--backgroundColor1').trim()}`,
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
      };
    }
    return {
      display: 'block',
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
    };
  };

  return (
    <div style={{
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
    }}>
      <div className='backgroundColor2' style={{
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '400px', // Aumenté el ancho del modal
        textAlign: 'center',
        minWidth: '50vw',
        position: 'relative', // Añadido para que el botón de cierre se posicione correctamente
      }}>
        <p className='title-md' style={{
          color: 'white',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          Select Quality
        </p>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(100)}
          style={getButtonStyle(100)}
        >
          High
        </button>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(75)}
          style={getButtonStyle(75)}
        >
          Medium
        </button>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(50)}
          style={getButtonStyle(50)}
        >
          Low
        </button>
        <button
          className='backgroundColor3'
          onClick={() => onQualityChange(25)}
          style={getButtonStyle(25)}
        >
          Very Low
        </button>
        <button className='color2' onClick={onClose} style={styles.closeButton}>
          ×
        </button>
      </div>
    </div>
  );
};

const styles ={
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px', // Posicionado en la parte superior izquierda del contenedor
    background: 'none',
    border: 'none',
    fontSize: '40px',
    cursor: 'pointer',
    color: 'white', // Asegúrate de que el color sea visible
  },
}

export default QualitySelectorModal;