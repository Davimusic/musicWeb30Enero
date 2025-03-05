import React, { useState } from 'react';
import '../../estilos/music/icon.css'; // Asegúrate de que la ruta sea correcta

const ShareIcon = ({ size = 30, onClick }) => {
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
            marginLeft: 'auto',
            cursor: 'pointer',
            transition: 'fill 0.3s ease',
            //backgroundColor: isLike ? 'red' : 'transparent', // Color de fondo según estado
            borderRadius: '50%',
            padding: '10px',
          transition: 'transform 0.3s ease',
        }}
        stroke="white" // Color del trazo
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Círculos que representan los puntos de conexión */}
        <circle cx="18" cy="5" r="2" stroke="white" fill="none" />
        <circle cx="6" cy="12" r="2" stroke="white" fill="none" />
        <circle cx="18" cy="19" r="2" stroke="white" fill="none" />
        {/* Líneas que conectan los círculos */}
        <path
          d="M18 7V17M6 12L18 17M6 12L18 7"
          stroke="white"
          fill="none"
        />
      </svg>
    </>
  );
};

export default ShareIcon