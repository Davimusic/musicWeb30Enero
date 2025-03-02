import React, { useState, useEffect } from 'react';

const BackgroundGeneric = ({ isLoading, children, style, className }) => {
  const [backgroundClass, setBackgroundClass] = useState('backgroundColor1'); // Clase inicial

  useEffect(() => {
    if (isLoading) {
      const classes = [
        'backgroundColor1',
        'backgroundColor2',
        'backgroundColor3',
        'backgroundColor4',
        'backgroundColor5',
      ];
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % classes.length; // Cambiar al siguiente color en el ciclo
        setBackgroundClass(classes[index]);
      }, 3000); // Cambiar cada 3 segundos

      return () => clearInterval(interval); // Limpiar intervalo al desmontar el componente
    }
  }, [isLoading]);

  return (
    <div
      style={{
        ...style,
        transition: 'background-color 2.5s ease', // Transición suave
      }}
      className={`${backgroundClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default BackgroundGeneric;
