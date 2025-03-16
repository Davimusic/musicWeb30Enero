import { useState, useEffect } from 'react';
import '../../estilos/music/rangeInput.css';

const RangeInput = ({
    min = 0,
    max = 100,
    step = 1,
    value, // Valor controlado desde el padre
    onChange,
    colorClass = 'color1',
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
      <div className={`rangeContainer ${backgroundColorClass}`}>
        {children}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={`rangeInput ${colorClass}`}
        />
        <div className={`rangeValue ${colorClass}`}>{value}</div>
      </div>
    );
  };

export default RangeInput;
