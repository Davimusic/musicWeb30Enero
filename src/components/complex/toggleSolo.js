import React, { useState } from 'react';

const ToggleSolo = ({ size = 24, isSolo = false, onToggle, buttonColor = "#ffffff" }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar propagación del evento
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onToggle(); // Ejecuta la función de alternar solo
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
        fill: isSolo ? '#00ff00' : buttonColor, // Cambia el color según el estado
      }}
    >
      {/* Ícono del botón Solo */}
      {isSolo ? (
        <>
          {/* Ícono activo de solo */}
          <circle cx="12" cy="12" r="10" stroke={buttonColor} strokeWidth="2" fill="none" />
          <text x="12" y="16" fontSize="12" textAnchor="middle" fill={buttonColor}>S</text>
        </>
      ) : (
        <>
          {/* Ícono inactivo */}
          <circle cx="12" cy="12" r="10" stroke={buttonColor} strokeWidth="1" fill="none" />
          <text x="12" y="16" fontSize="12" textAnchor="middle" fill={buttonColor}>S</text>
        </>
      )}
    </svg>
  );
};

export default ToggleSolo;

