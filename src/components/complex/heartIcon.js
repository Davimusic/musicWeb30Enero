import React, { useState, useEffect } from 'react'; // Asegúrate de importar useEffect
import '../../estilos/music/icon.css';

const HeartIcon = ({ size = 100, onClickFunction, defaultLike = false }) => {
  const [isLike, setIsLike] = useState(defaultLike); // Estado inicial dinámico
  const [isAnimating, setIsAnimating] = useState(false); // Animación del icono

  // Sincroniza el estado interno `isLike` con la prop `defaultLike`
  useEffect(() => {
    setIsLike(defaultLike);
  }, [defaultLike]);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar propagación del evento
    const newLikeState = !isLike;
    setIsLike(newLikeState); // Cambiar el estado de "like"

    // Ejecutar la función externa si existe
    if (onClickFunction) {
      onClickFunction(newLikeState); // Pasa el estado actualizado a la función externa
    }

    setIsAnimating(true); // Activar animación
    setTimeout(() => setIsAnimating(false), 1000); // Duración de la animación
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
        marginLeft: 'auto',
        cursor: 'pointer',
        transition: 'fill 0.3s ease',
        backgroundColor: isLike ? 'red' : 'transparent', // Color de fondo según estado
        borderRadius: '50%',
        padding: '10px',
      }}
      stroke={'white'}
      strokeWidth="1"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={isLike ? 'red' : 'black'} // Color del corazón según estado
      />
    </svg>
  );
};

export default HeartIcon;

