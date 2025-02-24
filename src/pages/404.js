import React, { useState, useEffect } from 'react';
import MainLogo from '@/components/complex/mainLogo';
import '../estilos/general/general.css';

const NotFound = () => {
  const [backgroundColorClass, setBackgroundColorClass] = useState('backgroundColor1');

  useEffect(() => {
    const interval = setInterval(() => {
      // Cambiar dinámicamente entre las clases de fondo
      setBackgroundColorClass((prevClass) => {
        if (prevClass === 'backgroundColor1') return 'backgroundColor2';
        if (prevClass === 'backgroundColor2') return 'backgroundColor3';
        if (prevClass === 'backgroundColor3') return 'backgroundColor4';
        if (prevClass === 'backgroundColor4') return 'backgroundColor5';
        return 'backgroundColor1'; // Reiniciar el ciclo
      });
    }, 3000); // Cambiar cada 3 segundos

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  return (
    <div
      className={backgroundColorClass}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        transition: 'background-color 1s ease', // Transición suave para el cambio de color
      }}
    >
      {/* Contenedor del logo con animación */}
      <div className="logo-container">
        <MainLogo size={150} animate={true} /> {/* Personaliza el tamaño y la animación */}
      </div>

      {/* Título y texto con animación */}
      <h1 className="fade-in-left">Page Not Found</h1>
      <p className="fade-in-right">The route you are looking for does not exist.</p>

      {/* Estilos CSS para las animaciones */}
      <style>
        {`
          /* Animación para el contenedor del logo */
          .logo-container {
            opacity: 0;
            transform: scale(0.8);
            animation: fadeInScale 0.5s ease-out forwards;
          }

          @keyframes fadeInScale {
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          /* Animación para el título (aparece desde la izquierda) */
          .fade-in-left {
            opacity: 0;
            transform: translateX(-50px);
            animation: fadeInLeft 0.5s ease-out 0.3s forwards;
          }

          @keyframes fadeInLeft {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* Animación para el texto (aparece desde la derecha) */
          .fade-in-right {
            opacity: 0;
            transform: translateX(50px);
            animation: fadeInRight 0.5s ease-out 0.6s forwards;
          }

          @keyframes fadeInRight {
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotFound;

