import React, { useState } from 'react';
import '../../estilos/music/icon.css'

const GlassIcon = ({ size = 30, onClick = () => {}, style = {} }) => {
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
        className={isAnimating ? 'pulse rotate-infinite' : ''}
        style={{ 
          cursor: 'pointer', 
          transition: 'transform 0.3s ease',
          ...style, // Merge the passed style with default styles
        }}
        stroke={'white'}
        strokeWidth="2.5"
        fill="none"
      >
        {/* Ícono de lupa */}
        <circle cx="10" cy="10" r="7" />
        <line x1="15" y1="15" x2="20" y2="20" />
      </svg>
    </>
  );
};

export default GlassIcon;

