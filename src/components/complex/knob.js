'use client'

import React,{ useRef, useState, useEffect, useCallback } from 'react';
import '../../estilos/music/knob.css';




const Knob = React.memo(({
    size = 120,
    value = 0,
    min = 0,
    max = 100,
    showValue = true,
    title = '',
    onChange = () => {},
    children
  }) => {
    const knobRef = useRef(null);
    const fillRef = useRef(null);
    const valueRef = useRef(null);
    const [angle, setAngle] = useState(0);
    const startAngle = useRef(0);
    const startValue = useRef(value);
    const isDragging = useRef(false);
  
    // Función para convertir valor a ángulo (0-270 grados)
    const valueToAngle = useCallback((val) => {
      const clampedValue = Math.max(min, Math.min(max, val));
      return ((clampedValue - min) / (max - min)) * 270;
    }, [min, max]);
  
    // Función para convertir ángulo a valor
    const angleToValue = useCallback((angle) => {
      const clampedAngle = Math.max(0, Math.min(270, angle));
      return min + (clampedAngle / 270) * (max - min);
    }, [min, max]);
  
    // Actualizar visualización
    const updateVisuals = useCallback((newAngle) => {
      if (!knobRef.current || !fillRef.current) return;
      
      const currentValue = angleToValue(newAngle);
      const displayValue = Number.isInteger(currentValue) 
        ? currentValue 
        : currentValue.toFixed(1);
  
      knobRef.current.style.transform = `rotate(${newAngle}deg)`;
      
      // Usamos las variables CSS directamente en el gradiente
      fillRef.current.style.background = `
        conic-gradient(
          var(--accent-color) 0deg,
          var(--accent-color) ${newAngle}deg,
          var(--base-color) ${newAngle}deg 360deg
        )
      `;
      
      if (showValue && valueRef.current) {
        valueRef.current.textContent = displayValue;
      }
    }, [angleToValue, showValue]);
  
    // Sincronizar con valor externo cuando no está siendo arrastrado
    useEffect(() => {
      if (!isDragging.current) {
        const newAngle = valueToAngle(value);
        setAngle(newAngle);
        startValue.current = value;
        updateVisuals(newAngle);
      }
    }, [value, valueToAngle, updateVisuals]);
  
    // Manejador de inicio de arrastre
    const handleStart = useCallback((clientX, clientY) => {
      isDragging.current = true;
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
    }, [valueToAngle]);
  
    // Manejador de movimiento
    const handleMove = useCallback((e) => {
      if (!knobRef.current || !isDragging.current) return;
      
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
    }, [angleToValue, onChange, updateVisuals]);
  
    // Manejador de fin de arrastre
    const handleEnd = useCallback(() => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    }, [handleMove]);
  
    // Limpieza de event listeners
    useEffect(() => {
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }, [handleMove, handleEnd]);
  
    return (
      <div className="knob-wrapper">
        {title && <div className="knob-title">{title}</div>}
        <div className="knob-container" style={{
          '--size': `${size}px`,
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
              </div>
            </div>
          </div>
        </div>
        {showValue && (
          <div ref={valueRef} className="knob-value-display">
            {Number.isInteger(angleToValue(angle)) 
              ? angleToValue(angle) 
              : angleToValue(angle).toFixed(1)}
          </div>
        )}
      </div>
    );
  });
  
  export default Knob;