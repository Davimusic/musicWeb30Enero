import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const ZoomIcon = ({ size = 30, onClick = () => {}, style = {}, zoomIn = true }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onClick();
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
        ...style,
      }}
      stroke={'white'}
      strokeWidth="2.5"
      fill="none"
    >
      {/* Círculo exterior */}
      <circle cx="12" cy="12" r="8" />
      
      {/* Línea horizontal */}
      <line x1="6" y1="12" x2="18" y2="12" />
      
      {/* Línea vertical (solo se muestra en zoomIn) */}
      {zoomIn && <line x1="12" y1="6" x2="12" y2="18" />}
    </svg>
  );
};

export default ZoomIcon;