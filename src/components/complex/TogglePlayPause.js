import React, { useState } from 'react';

const TogglePlayPause = ({ size = 30, isPlaying = false, onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onToggle(); // Ejecutar la función de alternar entre play y pause
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
        strokeWidth="1"
        fill="none"
      >
        {/* Ícono de Play o Pause */}
        {isPlaying ? (
          // Ícono de Pause
          <>
            <rect x="6" y="4" width="4" height="16" fill="white" /> {/* Cambiado a blanco */}
            <rect x="14" y="4" width="4" height="16" fill="white" /> {/* Cambiado a blanco */}
          </>
        ) : (
          // Ícono de Play
          <polygon points="5 3 19 12 5 21" fill="white" /> 
        )}
      </svg>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .pulse {
          animation: pulse 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default TogglePlayPause;