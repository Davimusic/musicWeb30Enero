import React, { useState } from 'react';
import '../../estilos/music/icon.css'

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
        stroke="white" // Cambiado a blanco
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Lápiz (representa editar) */}
        <path
          d="M17 3L21 7L7 21H3V17L17 3Z"
          stroke="white" // Cambiado a blanco
          fill="none"
        />
        {/* Línea diagonal que sugiere movimiento o ajuste */}
        <line
          x1="15"
          y1="5"
          x2="19"
          y2="9"
          stroke="white" // Ya está en blanco
        />
      </svg>
    </>
  );
};

export default QualityIcon;





