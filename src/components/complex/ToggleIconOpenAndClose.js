import React, { useState, useEffect } from 'react';

const ToggleIconOpenAndClose = ({ size = 30, isOpen = false, onToggle, style }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log(isAnimating); // Esto imprimirá el estado actual de isAnimating
  }, [isAnimating]);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    setIsAnimating(true); // Activar la animación
    onToggle(); // Ejecutar la función de alternar visibilidad

    // Restablecer isAnimating a false después de que la animación termine
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Duración de la animación (0.3 segundos)
  };

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'inline-block',
        cursor: 'pointer',
        marginLeft: 'auto',
        ...style, // Aplicar estilos pasados como prop
      }}
    >
      <div className={isAnimating ? 'pulse' : ''}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transformOrigin: 'center', // Asegurar que la rotación sea alrededor del centro
          }}
          stroke={'white'}
          strokeWidth="1"
          fill="none"
        >
          {/* Ícono de flecha hacia abajo (abrir) o hacia arriba (cerrar) */}
          {isOpen ? (
            <path
              d="M19 9l-7 7-7-7" // Flecha hacia arriba (cerrar)
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M5 15l7-7 7 7" // Flecha hacia abajo (abrir)
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .pulse {
          display: inline-block;
          animation: pulse 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ToggleIconOpenAndClose;


/*import React, { useState } from 'react';

const ToggleIconOpenAndClose = ({ size = 30, isOpen = false, onToggle, style }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation(); // Evitar la propagación del evento
    setIsAnimating(true);
    //setTimeout(() => setIsAnimating(false), 300); // Duración de la animación
    onToggle(); // Ejecutar la función de alternar visibilidad
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
          ...style, // Aplicar estilos pasados como prop
          marginLeft: 'auto',
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transformOrigin: 'center', // Asegurar que la rotación sea alrededor del centro
        }}
        stroke={'white'}
        strokeWidth="1"
        fill="none"
      >
        
        {isOpen ? (
          <path
            d="M5 15l7-7 7 7" // Flecha hacia arriba (cerrar)
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M19 9l-7 7-7-7" // Flecha hacia abajo (abrir)
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .pulse {
          animation: pulse 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default ToggleIconOpenAndClose;*/