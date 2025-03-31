import React, { useState } from 'react';

const ToggleSolo = ({ size = 24, isSolo = false, onToggle, buttonColor = "#ffffff" }) => {
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
      }}
    >
      {isSolo ? (
        <>
          {/* Ícono activo - círculo rojo con borde blanco y texto blanco */}
          <circle cx="12" cy="12" r="10" stroke={buttonColor} strokeWidth="2" fill="#ff0000" />
          <text x="12" y="16" fontSize="12" textAnchor="middle" fill={buttonColor}>S</text>
        </>
      ) : (
        <>
          {/* Ícono inactivo - solo borde blanco */}
          <circle cx="12" cy="12" r="10" stroke={buttonColor} strokeWidth="1" fill="none" />
          <text x="12" y="16" fontSize="12" textAnchor="middle" fill={buttonColor}>S</text>
        </>
      )}
    </svg>
  );
};

export default ToggleSolo;

