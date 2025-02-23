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
        strokeWidth="0.1"
        fill="none"
        strokeLinecap="round" // Redondea los extremos de las líneas
        strokeLinejoin="round" // Redondea las esquinas de las uniones
      >
        {/* Ícono de minimizar con esquinas más redondeadas */}
        <path
          d="M5 5h5v2H7v3H5V5zm12 0h-5v2h3v3h2V5zM5 19v-5h2v3h3v2H5zm12 0h-5v-2h3v-3h2v5z"
          fill="currentColor"
          transform="rotate(180 12 12)"
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