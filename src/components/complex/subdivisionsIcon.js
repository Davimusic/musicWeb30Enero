import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const SubdivisionsIcon = ({ size = 30, onClick = () => {}, style = {} }) => {
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
      {/* Cuadrado exterior */}
      <rect x="3" y="3" width="18" height="18" rx="1" />
      
      {/* Línea vertical central */}
      <line x1="12" y1="3" x2="12" y2="21" />
      
      {/* Línea horizontal central */}
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
};

export default SubdivisionsIcon;