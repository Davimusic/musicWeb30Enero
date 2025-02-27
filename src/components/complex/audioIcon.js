import React, { useState } from 'react';

const AudioIcon = ({ size = 30, onClick = () => {}, style = {} }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onClick();
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
          ...style,
        }}
        stroke={'white'}
        strokeWidth="2"
        fill="none"
      >
        {/* Ícono de corchea musical */}
        <path d="M9 3v10.68A4 4 0 1 0 11 17V7h4V3H9z" />
      </svg>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .pulse { animation: pulse 0.3s ease; }
      `}</style>
    </>
  );
};

export default AudioIcon;
