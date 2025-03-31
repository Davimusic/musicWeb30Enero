import React, { useState } from 'react';
import '../../estilos/music/icon.css'

const MenuIcon = ({ size = 30, onClick = () => {}, style = {}, className }) => {
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
        className={isAnimating ? `pulse ${className}` : ''}
        style={{ 
          cursor: 'pointer', 
          transition: 'transform 0.3s ease',
          ...style, // Merge the passed style with default styles
        }}
        stroke={'white'}
        strokeWidth="3"
        fill="none"
      >
        {/* Ícono de menú (tres líneas horizontales) */}
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    </>
  );
};

export default MenuIcon;