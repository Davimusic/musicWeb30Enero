import { useState, useEffect } from 'react';
import '../../estilos/music/rangeInput.css';

const RangeInput = ({
  min = 0,
  max = 100,
  step = 1,
  value: propValue = 0,
  onChange,
  colorClass = 'color3',
  backgroundColorClass = 'backgroundColor1',
  children
}) => {
  const [localValue, setLocalValue] = useState(propValue);

  useEffect(() => {
    //console.log(localValue);
    
  }, [localValue]);

  // Sincronizar con el valor prop cuando cambie
  useEffect(() => {
    setLocalValue(propValue);
  }, [propValue]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div  style={{textAlign: 'center', display: 'flex', justifyContent: 'center'}}>
      {children}
      <div className={'rangeContainer'}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className={'rangeInput'}
          style={{
            '--thumb-color': colorClass,
            '--track-color': backgroundColorClass,
          }}
        />
        <div className={'rangeValue'}>
          {Number.isInteger(localValue) ? localValue : parseFloat(localValue.toFixed(1))}
        </div>
      </div>
    </div>
  );
};

export default RangeInput;