import React, { useState } from 'react';

const PlusIcon = ({ size = 24, onClick = () => {}, style = {} }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onClick();
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        fill: 'none',
        stroke: 'white',
        strokeWidth: '2.5',
        transition: 'transform 0.3s ease',
        ...style,
      }}
      className={isAnimating ? 'pulse rotate-infinite' : ''}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
};

const MinusIcon = ({ size = 24, onClick = () => {}, style = {} }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onClick();
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        fill: 'none',
        stroke: 'white',
        strokeWidth: '2.5',
        transition: 'transform 0.3s ease',
        ...style,
      }}
      className={isAnimating ? 'pulse rotate-infinite' : ''}
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
};

const CustomNumberInput = ({ min = 1, max = 30, step = 1, value, onChange }) => {
  // Convertir todas las propiedades a números
  const numericValue = Number(value);
  const numericMin = Number(min);
  const numericMax = Number(max);
  const numericStep = Number(step);

  const handleIncrement = () => {
    if (numericValue < numericMax) {
      // Realizamos la suma con números y forzamos el formateo a dos decimales
      const newValue = parseFloat((numericValue + numericStep).toFixed(2));
      // Simulamos el objeto de evento para no cambiar la llamada original
      onChange({ target: { value: newValue } });
    }
  };

  const handleDecrement = () => {
    if (numericValue > numericMin) {
      const newValue = parseFloat((numericValue - numericStep).toFixed(2));
      onChange({ target: { value: newValue } });
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ padding: '5px' }}>
        <MinusIcon onClick={handleDecrement} size={24} />
      </div>
      <input
        type="number"
        value={numericValue.toFixed(2)}
        readOnly
        style={{
          width: '60px',
          textAlign: 'center',
          margin: '0 5px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '6px',
          backgroundColor: 'white',
        }}
      />
      <div style={{ padding: '5px' }}>
        <PlusIcon onClick={handleIncrement} size={24} />
      </div>
    </div>
  );
};

export default CustomNumberInput;


