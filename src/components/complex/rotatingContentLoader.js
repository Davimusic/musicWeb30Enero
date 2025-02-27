import React, { useState, useEffect } from 'react';

const RotatingContentLoader = ({ isLoading, contents, intervalTime, style, children, className }) => {
  const [contentIndex, setContentIndex] = useState(0);

  useEffect(() => {
    if (isLoading && contents.length > 0) {
      const interval = setInterval(() => {
        setContentIndex((prevIndex) => (prevIndex + 1) % contents.length);
      }, intervalTime); // Cambiar según el intervalo proporcionado

      return () => clearInterval(interval); // Limpiar intervalo al desmontar el componente
    }
  }, [isLoading, contents, intervalTime]);

  return (
    <div style={style} className={className}>
      {contents[contentIndex]}
      {children}
    </div>
  );
};

export default RotatingContentLoader;
