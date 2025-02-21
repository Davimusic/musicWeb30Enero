import React, { useState } from 'react';

const ShuffleButton = ({ buttonColor = "#ffffff", size = 30, isShuffle, toggleShuffle }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    toggleShuffle(); // Cambiar el estado de shuffle
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
        style={{ cursor: 'pointer', transition: 'fill 0.3s ease', opacity: isShuffle ? 1 : 0.5 }}
        fill={buttonColor}
        stroke={buttonColor}
        strokeWidth="1"
      >
        <path
          d="M18 4l3 3h-3v3h-2V7h-3l3-3zm-6.5 7c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zm6.5 2v3h3l-3 3-3-3h3v-3h2zm-6.5 3c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5zM4 7h3l-3-3-3 3h3v3h2V7H4zm6.5 4c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z"
        />
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

export default ShuffleButton;