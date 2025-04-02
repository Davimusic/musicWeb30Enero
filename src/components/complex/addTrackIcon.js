import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const AddTrackIcon = ({ size = 30, onClick = () => {}, style = {}, className }) => {
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
      className={isAnimating ? `pulse ${className}` : className}
      style={{ 
        cursor: 'pointer', 
        transition: 'transform 0.3s ease',
        ...style,
      }}
      stroke={'white'}
      strokeWidth="2"
      fill="none"
    >
      {/* Base del ícono (representa una pista MIDI) */}
      <rect x="4" y="8" width="16" height="8" rx="1" />
      
      {/* Líneas que representan notas MIDI */}
      <line x1="8" y1="4" x2="8" y2="8" />
      <line x1="12" y1="2" x2="12" y2="8" />
      <line x1="16" y1="5" x2="16" y2="8" />
      
      {/* Símbolo de "+" para indicar agregar */}
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
};

export default AddTrackIcon;