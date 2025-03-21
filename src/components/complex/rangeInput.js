import { useState, useEffect } from 'react';
import '../../estilos/music/rangeInput.css'; // Asegúrate de importar los estilos correctamente

const RangeInput = ({
  min = 0,
  max = 100,
  step = 1,
  value = 0, // Valor predeterminado si es undefined
  onChange,
  colorClass = 'color3',
  backgroundColorClass = 'backgroundColor1',
  children
}) => {
  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div style={{display: 'flex'}}>
        {children}
        <div className={'rangeContainer'}>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            className={'rangeInput'}
        />
        <div className={'rangeValue'}>
            {Number.isInteger(value) ? value : parseFloat((value || 0).toFixed(1))}
        </div>
        </div>
    </div>
  );
};

export default RangeInput;