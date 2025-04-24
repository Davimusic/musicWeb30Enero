import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const EffectsIcon = ({ size = 30, onClick }) => {
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
        transition: 'transform 0.3s ease'
      }}
      fill="white"
      stroke="white"
      strokeWidth="1"
    >
      {/* Minimalistic magic wand icon with a couple of sparkles */}
      <line x1="4" y1="20" x2="20" y2="4" stroke="white" strokeWidth="2"/>
      <circle cx="20" cy="4" r="2" fill="white" />
      <circle cx="7" cy="17" r="1" fill="white" />
      <circle cx="17" cy="7" r="1" fill="white" />
    </svg>
  );
};

export default EffectsIcon;
