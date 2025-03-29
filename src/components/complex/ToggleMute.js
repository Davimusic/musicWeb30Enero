import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const ToggleMute = ({ size = 24, isMuted = false, onToggle, buttonColor = "#ffffff" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onToggle();
  };

  return (
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
        display: 'block',
        overflow: 'visible' // Asegura que todo el contenido sea visible
      }}
      fill={buttonColor}
    >
      {/* Versión centrada sin transformaciones adicionales */}
      {isMuted ? (
        <>
          {/* Altavoz base */}
          <path
            d="M12 5H10C9.44772 5 9 5.44772 9 6V14C9 14.5523 9.44772 15 10 15H12L16 19V5L12 9Z"
            stroke={buttonColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Línea de mute (perfectamente centrada) */}
          <path
            d="M16 9L20 13M20 9L16 13"
            stroke={buttonColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* Altavoz base (mismo que el muted) */}
          <path
            d="M12 5H10C9.44772 5 9 5.44772 9 6V14C9 14.5523 9.44772 15 10 15H12L16 19V5L12 9Z"
            stroke={buttonColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Ondas de sonido (centradas horizontalmente) */}
          <path
            d="M18 9C19.1046 9 20 9.89543 20 11C20 12.1046 19.1046 13 18 13"
            stroke={buttonColor}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M20 7C22.2091 7 24 8.79086 24 11C24 13.2091 22.2091 15 20 15"
            stroke={buttonColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </>
      )}
    </svg>
  );
};

export default ToggleMute;