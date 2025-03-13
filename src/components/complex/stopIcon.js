import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const StopIcon = ({ size = 30, onClick = () => {}, style = {} }) => {
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
        {/* Ícono de stop (cuadrado) */}
        <rect x="6" y="6" width="12" height="12" />
      </svg>
    </>
  );
};

export default StopIcon;