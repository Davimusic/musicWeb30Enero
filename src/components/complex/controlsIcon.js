import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const ControlsIcon = ({ size = 30,  onToggle = () => {} }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onToggle();
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
      }}
      stroke={'black'}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      
      <>
  <path d="M17 3L21 7L7 21H3V17L17 3Z" />
  
</>
     
    </svg>
  );
};

export default ControlsIcon;