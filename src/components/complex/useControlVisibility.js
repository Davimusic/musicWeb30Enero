import { useState, useEffect } from 'react';

const UseControlVisibility = (isMobile) => {
  const [isVisible, setIsVisible] = useState(!isMobile); // Visible por defecto en computador
  const [timeoutId, setTimeoutId] = useState(null);

  // Función para mostrar el control y reiniciar el temporizador
  const showControls = () => {
    setIsVisible(true);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeoutId = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Ocultar después de 5 segundos
    setTimeoutId(newTimeoutId);
  };

  // Efecto para manejar la visibilidad inicial en móvil
  useEffect(() => {
    if (isMobile) {
      setIsVisible(false); // Ocultar por defecto en móvil
    }
  }, [isMobile]);

  // Efecto para limpiar el temporizador al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return { isVisible, showControls };
};

export default UseControlVisibility;