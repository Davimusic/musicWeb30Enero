import { useState } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>
          ×
        </button>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Asegúrate de que este valor sea mayor que el de otros elementos
  },
  modal: {
    backgroundColor: 'black',
    padding: '20px',
    borderRadius: '8px',
    position: 'relative',
    zIndex: 1001, // Asegúrate de que este valor sea mayor que el del overlay
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '40px',
    cursor: 'pointer',
    color: 'white'
  },
};

export default Modal;