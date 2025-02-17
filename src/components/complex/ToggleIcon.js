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
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      >
        {/* Engranaje (símbolo de configuración) */}
        <path
          d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
          fill="currentColor"
        />
        <path
          d="M19.4 8.6l-1.5-1.1c.2-.5.3-1 .3-1.5s-.1-1-.3-1.5l1.5-1.1c.3-.2.4-.6.2-.9l-1.4-2.4c-.2-.3-.6-.4-.9-.2l-1.5 1.1c-.5-.2-1-.3-1.5-.3s-1 .1-1.5.3L10.6.4c-.3-.2-.7-.1-.9.2L8.3 3c-.2.3-.1.7.2.9l1.5 1.1c-.2.5-.3 1-.3 1.5s.1 1 .3 1.5L8.5 8.6c-.3.2-.4.6-.2.9l1.4 2.4c.2.3.6.4.9.2l1.5-1.1c.5.2 1 .3 1.5.3s1-.1 1.5-.3l1.5 1.1c.3.2.7.1.9-.2l1.4-2.4c.2-.3.1-.7-.2-.9z"
          fill="none"
          stroke="currentColor"
        />
        {/* Ondas de sonido (audio) */}
        <path
          d="M3 15h2v4H3v-4zm4 2h2v2H7v-2zm4-2h2v4h-2v-4zm4 2h2v2h-2v-2z"
          fill="currentColor"
          transform="translate(0, 2)"
        />
        {/* Pantalla (video) */}
        <rect
          x="14"
          y="14"
          width="6"
          height="6"
          rx="1"
          fill="none"
          stroke="currentColor"
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