import React, { useState, useEffect } from "react";
import "../../estilos/music/icon.css";

const PanIcon = ({ size = 24, panValue = 0, iconColor = "white", onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  

  useEffect(() => {
      console.log(panValue);
    }, [panValue]);
  
  

  const handleClick = (event) => {
    event.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onClick(); // Dispara la actualización del pan
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      onClick={handleClick}
      className={isAnimating ? "pulse" : ""}
      style={{
        cursor: "pointer",
        transition: "transform 0.3s ease",
      }}
    >
      <circle cx="12" cy="12" r="10" fill="none" stroke={iconColor} strokeWidth="2" />
      <circle
        cx={12 + (panValue / 50) * 8} // Ajusta la posición (-50 a 50 → -8px a 8px)
        cy="12"
        r="2"
        fill={iconColor}
      />
      
    </svg>
  );
};

export default PanIcon;