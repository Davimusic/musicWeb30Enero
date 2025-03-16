import React, { useState } from 'react';
import '../../estilos/music/icon.css';

const RecordIcon = ({ 
  size = 30, 
  onClick = () => {}, 
  style = {}, 
  isRecording = false, // Prop para controlar el estado de grabación
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onClick(); // Llama a la función onClick proporcionada
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        fill={isRecording ? 'red' : 'none'} // Cambia el color de relleno si está grabando
      >
        {/* Ícono de grabación (círculo) */}
        <circle cx="12" cy="12" r={isRecording ? '8' : '6'} /> {/* Cambia el tamaño del círculo si está grabando */}
      </svg>
    </div>
  );
};

export default RecordIcon;