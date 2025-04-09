import { useState, useEffect } from 'react';
import '../../estilos/music/rangeInput.css';

const RangeInput = ({
  min = 0,
  max = 100,
  step = 1,
  value: propValue = 0,
  onChange,
  progressColor = 'backgroundColor4', // Color para la parte avanzada
  trackColor = 'backgroundColor1',    // Color para la parte fija
  showLabel = true,
  children
}) => {
  const [localValue, setLocalValue] = useState(propValue);
  const [isDragging, setIsDragging] = useState(false);

  // Calcular el porcentaje de progreso
  const progressPercentage = ((localValue - min) / (max - min)) * 100;

  // Sincronizar con el valor prop cuando cambie
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(propValue);
    }
  }, [propValue, isDragging]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    
    if (!isDragging && onChange) {
      onChange(newValue);
    }
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onChange && localValue !== propValue) {
        onChange(localValue);
      }
    }
  };

  return (
    <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {children}
      <div className={'rangeContainer'}>
        <div className="rangeInputWrapper">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={isDragging ? localValue : propValue}
            onChange={handleChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className={'rangeInputProgress'}
            style={{
              '--progress': `${progressPercentage}%`,
              '--progress-color': `var(--${progressColor})`,
              '--track-color': `var(--${trackColor})`,
            }}
          />
        </div>
        {showLabel && (
          <div className={'rangeValueMinimal'}>
            {Number.isInteger(localValue) ? localValue : parseFloat(localValue.toFixed(1))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RangeInput;