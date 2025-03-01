import React, { useState } from 'react';
import '../../estilos/music/icon.css'

const DownloadIcon = ({ size = 30, isOpen = false, onToggle = () => {} }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onToggle(); // Ejecutar la función de toggle
  };

  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        onClick={handleClick}
        className={isAnimating ? 'pulse' : ''}
        style={{ 
          cursor: 'pointer', 
          transition: 'transform 0.3s ease',
        }}
        stroke={'white'}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round" // Redondea los extremos de las líneas
        strokeLinejoin="round" // Redondea las esquinas de las uniones
      >
        {/* Ícono de flecha hacia abajo (cuando no está abierto) o hacia arriba (cuando está abierto) */}
        {isOpen ? (
          <path d="M12 20l6-6m-6 6l-6-6m6 6V4" /> // Flecha hacia arriba
        ) : (
          <path d="M12 4v16m0 0l6-6m-6 6l-6-6" /> // Flecha hacia abajo
        )}
      </svg>
    </>
  );
};

export default DownloadIcon;