//NextBeforeIcon

import React, { useState } from 'react';

const NextBeforeIcon = ({ size = 30, direction = 'right', onToggle }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onToggle(); // Ejecutar la función de alternar entre Next y Before
  };

  const getRotation = (direction) => {
    switch (direction) {
      case 'left':
        return 'rotate(180deg)';
      case 'up':
        return 'rotate(-90deg)';
      case 'down':
        return 'rotate(90deg)';
      default:
        return 'rotate(0deg)';
    }
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
          transform: getRotation(direction),
        }}
        stroke={'white'}
        strokeWidth="1"
        fill="none"
      >
        {/* Ícono de Flecha Doble */}
        <polygon points="4 2, 14 12, 4 22" fill="white" />
        <polygon points="10 2, 20 12, 10 22" fill="white" />
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

export default NextBeforeIcon;
;




