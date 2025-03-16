import React, { useState } from "react";
import "../../estilos/music/icon.css";

const EditToggleIcon = ({ size = 24, iconColor = "white", onToggle, isVisible = true }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = (event) => {
    event.stopPropagation();
    const newEditingState = !isEditing;
    setIsEditing(newEditingState);
    onToggle(newEditingState); // Notifica al padre el estado actual
  };

  if (!isVisible) {
    return null; // No renderiza el componente si isVisible es false
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      onClick={handleClick}
      style={{
        cursor: "pointer",
        transition: "transform 0.3s ease",
      }}
    >
      {isEditing ? (
        // Ícono para "mostrar edición" (Lápiz)
        <path
          d="M3 21v-3L17 4l3 3L6 21H3z"
          fill={iconColor}
        />
      ) : (
        // Ícono para "ocultar edición" (Ojo con línea cruzada)
        <>
          <circle cx="12" cy="12" r="8" fill="none" stroke={iconColor} strokeWidth="2" />
          <line x1="5" y1="5" x2="19" y2="19" stroke={iconColor} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

export default EditToggleIcon;

