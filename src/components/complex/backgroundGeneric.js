import React, { useState, useEffect } from 'react';
import '../../estilos/music/backgroundGeneric.css';
import '../../estilos/general/general.css';

const BackgroundGeneric = ({ isLoading, children, style, className }) => {
  const [backgroundColorClass, setBackgroundColorClass] = useState('backgroundColor1');

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setBackgroundColorClass((prevClass) => {
          if (prevClass === 'backgroundColor1') return 'backgroundColor2';
          if (prevClass === 'backgroundColor2') return 'backgroundColor3';
          if (prevClass === 'backgroundColor3') return 'backgroundColor4';
          if (prevClass === 'backgroundColor4') return 'backgroundColor5';
          return 'backgroundColor1'; // Restart the cycle
        });
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [isLoading]);

  return (
    <div style={style} className={`${backgroundColorClass} ${className}`}>
      {children}
    </div>
  );
};

export default BackgroundGeneric;
