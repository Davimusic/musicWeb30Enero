import React, { useState } from 'react';

const QualityIcon = ({ size = 30, onClick }) => {
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
        {/* Ícono de calidad (HD) */}
        <path
          d="M5 7h2v4h2V7h2v10H9v-4H7v4H5V7zm8 0h3a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-3V7zm2 2v6h1a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1h-1z"
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

export default QualityIcon;