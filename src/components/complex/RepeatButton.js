import React, { useState } from 'react';
import '../../estilos/music/icon.css'

const RepeatButton = ({ buttonColor = "#ffffff", size = 30, isRepeat, toggleRepeat }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    toggleRepeat(); // Cambiar el estado de repeat
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
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
        style={{ cursor: 'pointer', transition: 'fill 0.3s ease', opacity: isRepeat ? 1 : 0.5 }}
        fill={buttonColor}
        stroke={buttonColor}
        strokeWidth="1"
      >
        <path
          d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zm2-10h-2V7H7v3L3 6l4-4v3h12v6h2V7z"
        />
      </svg>
    </>
  );
};

export default RepeatButton;