import React, { useState } from 'react';
import '../../estilos/music/icon.css'

const VideoIcon = ({ size = 30, onClick = () => {}, style = {} }) => {
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
        {/* Ícono de video */}
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 9l5 3-5 3V9z" />
      </svg>
    </>
  );
};

export default VideoIcon;