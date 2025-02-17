import React from 'react';

const QualitySelectorModal = ({ isOpen, onClose, onQualityChange }) => {
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
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      width: '300px',
    },
    qualityOptionButton: {
      display: 'block',
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: '#2bc6c8',
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
      backgroundColor: '#f44336',
      color: 'white',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2>Selecciona la calidad</h2>
        <button onClick={() => onQualityChange(100)} style={styles.qualityOptionButton}>Alta</button>
        <button onClick={() => onQualityChange(75)} style={styles.qualityOptionButton}>Media</button>
        <button onClick={() => onQualityChange(50)} style={styles.qualityOptionButton}>Baja</button>
        <button onClick={() => onQualityChange(25)} style={styles.qualityOptionButton}>Muy baja</button>
        <button onClick={onClose} style={styles.closeButton}>Cerrar</button>
      </div>
    </div>
  );
};

export default QualitySelectorModal;