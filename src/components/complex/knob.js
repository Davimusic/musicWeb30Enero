'use client'

import { useRef, useState, useEffect } from 'react';
import '../../estilos/music/knob.css';




















export default function Knob({
    size = 120,
    accentColor = '#a8d8f8',
    baseColor = '#3A3A3A',
    value = 0,
    min = 0,
    max = 100,
    showValue = true,
    onChange = () => {},
    children
  }) {
    const knobRef = useRef(null);
    const fillRef = useRef(null);
    const valueRef = useRef(null);
    const [angle, setAngle] = useState(0);
    const startAngle = useRef(0);
    const startValue = useRef(value);
  
    const [va, setVa] = useState(value);
  
    // Función para convertir valor a ángulo (0-270 grados)
    const valueToAngle = (val) => {
      const clampedValue = Math.max(min, Math.min(max, val));
      return ((clampedValue - min) / (max - min)) * 270;
    };
  
    // Función para convertir ángulo a valor
    const angleToValue = (angle) => {
      const clampedAngle = Math.max(0, Math.min(270, angle));
      return min + (clampedAngle / 270) * (max - min);
    };
  
    // Actualizar visualización
    const updateVisuals = (newAngle) => {
      if (!knobRef.current || !fillRef.current) return;
      
      const currentValue = angleToValue(newAngle);
      const displayValue = Number.isInteger(currentValue) 
        ? currentValue 
        : currentValue.toFixed(1);
  
      // Rotar el knob
      knobRef.current.style.transform = `rotate(${newAngle}deg)`;
      
      // Actualizar el relleno del arco
      fillRef.current.style.background = `
        conic-gradient(
          ${accentColor} 0deg,
          ${accentColor} ${newAngle}deg,
          ${baseColor} ${newAngle}deg 360deg
        )
      `;
      
      // Actualizar texto del valor si está habilitado
      if (showValue && valueRef.current) {
        valueRef.current.textContent = displayValue;
      }
    };
  
    // Sincronizar con valor externo
    useEffect(() => {
      const newAngle = valueToAngle(value);
      setAngle(newAngle);
      startValue.current = value;
      updateVisuals(newAngle);
    }, [value, min, max]);
  
  
    useEffect(() => {
      console.log(va);
    }, [va]);
  
    // Manejador de inicio de arrastre
    const handleStart = (clientX, clientY) => {
      const knob = knobRef.current;
      const rect = knob.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      startAngle.current = angle - valueToAngle(startValue.current);
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    };
  
    // Manejador de movimiento
    const handleMove = (e) => {
      if (!knobRef.current) return;
      
      const knob = knobRef.current;
      const rect = knob.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;
      
      let newAngle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
      newAngle = newAngle - startAngle.current;
      
      // Normalizar ángulo entre 0-270
      newAngle = ((newAngle % 360) + 360) % 360;
      newAngle = Math.max(0, Math.min(270, newAngle));
      
      setAngle(newAngle);
      updateVisuals(newAngle);
      
      const newValue = angleToValue(newAngle);
      startValue.current = newValue;
      onChange(newValue);
    };
  
    // Manejador de fin de arrastre
    const handleEnd = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  
    return (
      <div className="knob-container" style={{
        '--size': `${size}px`,
        '--accent-color': accentColor,
        '--base-color': baseColor
      }}>
        <div className="knob-outer">
          <div className="knob-fill" ref={fillRef} />
          <div className="knob-inner">
            <div 
              ref={knobRef}
              className="knob-handle"
              style={{ transform: `rotate(${angle}deg)` }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleStart(e.clientX, e.clientY);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                handleStart(e.touches[0].clientX, e.touches[0].clientY);
              }}
            />
            
            <div className="knob-content">
              {children && (
                <div className="knob-icon" onClick={(e) => e.stopPropagation()}>
                  {children}
                </div>
              )}
              {showValue && (
                <div ref={valueRef} className="knob-value">
                  {Number.isInteger(angleToValue(angle)) 
                    ? angleToValue(angle) 
                    : angleToValue(angle).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }