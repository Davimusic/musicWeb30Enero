import React from 'react';
import '../../estilos/music/icon.css'

const MainLogo = ({ size = 100, animate = false }) => {
  const animationClass = animate ? 'animate' : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ cursor: 'pointer' }}
    >
      {/* Fondo circular */}
      <circle cx="50" cy="50" r="45" fill="#0c283f" /> {/* color2 */}

      {/* Gradiente para las barras */}
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1d6188" /> {/* color3 */}
          <stop offset="50%" stopColor="#2b95c8" /> {/* color4 */}
          <stop offset="100%" stopColor="#2bc6c8" /> {/* color5 */}
        </linearGradient>
      </defs>

      {/* Barras de frecuencia con animación y esquinas curvas */}
      <rect x="21" y="25" width="8" height="50" rx="4" ry="4" fill="url(#barGradient)" className={`bar ${animationClass}`} />
      <rect x="34" y="20" width="8" height="60" rx="4" ry="4" fill="url(#barGradient)" className={`bar ${animationClass}`} />
      <rect x="47" y="15" width="8" height="70" rx="4" ry="4" fill="url(#barGradient)" className={`bar ${animationClass}`} />
      <rect x="60" y="20" width="8" height="60" rx="4" ry="4" fill="url(#barGradient)" className={`bar ${animationClass}`} />
      <rect x="73" y="25" width="8" height="50" rx="4" ry="4" fill="url(#barGradient)" className={`bar ${animationClass}`} />

      {/* Borde del círculo */}
      <circle cx="50" cy="50" r="45" fill="none" stroke="#2bc6c8" strokeWidth="4" /> {/* color5 */}
    </svg>
  );
};

export default MainLogo;












//MainLogo