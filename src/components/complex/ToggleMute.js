import React, { useState } from 'react';
import '../../estilos/music/icon.css'

const ToggleMute = ({ size = 24, isMuted = false, onToggle, buttonColor = "#ffffff" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onToggle(); // Ejecutar la función de alternar silencio
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
        fill={buttonColor} // Color del ícono
      >
        {/* Ícono de volumen alto o muteado */}
        {isMuted ? (
          // Ícono de volumen muteado (altavoz tachado)
          <>
            <path
              d="M16 9L21 14M21 9L16 14" // Línea diagonal que tacha el altavoz
              stroke={buttonColor}
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M15 5H13C12.4696 5 11.9609 5.21071 11.5858 5.58579C11.2107 5.96086 11 6.46957 11 7V13C11 13.5304 11.2107 14.0391 11.5858 14.4142C11.9609 14.7893 12.4696 15 13 15H15L19 19V5L15 9Z" // Altavoz
              stroke={buttonColor}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        ) : (
          // Ícono de volumen alto (altavoz con ondas de sonido)
          <>
            <path
              d="M15 5H13C12.4696 5 11.9609 5.21071 11.5858 5.58579C11.2107 5.96086 11 6.46957 11 7V13C11 13.5304 11.2107 14.0391 11.5858 14.4142C11.9609 14.7893 12.4696 15 13 15H15L19 19V5L15 9Z" // Altavoz
              stroke={buttonColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M19 9C20.1046 9 21 9.89543 21 11C21 12.1046 20.1046 13 19 13" // Onda de sonido
              stroke={buttonColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )}
      </svg>
    </>
  );
};

export default ToggleMute;