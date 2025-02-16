import React, { useState } from 'react';

const ExpandIcon = ({ size = 30, onClick = () => {} }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onClick(); // Ejecutar la función de clic
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
        {/* Ícono de maximizar */}
        <path
          d="M4 4h6v2H6v4H4V4zm14 0h-6v2h4v4h2V4zM4 20v-6h2v4h4v2H4zm14 0h-6v-2h4v-4h2v6z"
          fill="currentColor"
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

export default ExpandIcon; 