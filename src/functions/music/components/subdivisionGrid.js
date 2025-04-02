import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";

const SubdivisionGrid = memo(({
  PIXELS_PER_SECOND = 100,
  pulsesPerMeasure = 4,
  subdivisionsPerPulse = 2,
  BPM = 120,
  totalElements = 32,
  rows = 4,
  onCellTrigger,
  currentTime = 0,
  isPlaying = false,
  activeColor = "rgba(0, 47, 255, 0.7)",
  selectedColor = "rgba(255, 0, 0, 0.5)"
}) => {
  // Cálculos de tiempo
  const secondsPerPulse = 60 / BPM;
  const subdivisionDuration = secondsPerPulse / subdivisionsPerPulse;
  const gridDuration = totalElements * subdivisionDuration;
  const pulseWidth = secondsPerPulse * PIXELS_PER_SECOND;
  const subdivisionWidth = pulseWidth / subdivisionsPerPulse;
  const ROW_HEIGHT = 40;
  
  // Estados y referencias
  const [selectedCells, setSelectedCells] = useState(() => new Set());
  const gridRef = useRef(null);
  const indicatorRef = useRef(null);
  const lastTriggeredIndex = useRef(-1);
  const animationRef = useRef(null);

  // Mapa de celdas seleccionadas
  const selectedCellsMap = useMemo(() => {
    const map = new Map();
    selectedCells.forEach(cellId => {
      const [rowIndex, cellIndex] = cellId.split('-').map(Number);
      const startTime = cellIndex * subdivisionDuration;
      map.set(cellId, {
        row: rowIndex + 1,
        column: cellIndex + 1,
        startTime,
        endTime: startTime + subdivisionDuration,
        duration: subdivisionDuration
      });
    });
    return map;
  }, [selectedCells, subdivisionDuration]);

  const handleCellClick = useCallback((rowIndex, cellIndex) => {
    const cellId = `${rowIndex}-${cellIndex}`;
    setSelectedCells(prev => new Set(prev.has(cellId) ? 
      (prev.delete(cellId), prev) : prev.add(cellId)));
  }, []);

  // Efecto principal para sincronización
  useEffect(() => {
    if (!isPlaying) {
      if (indicatorRef.current) {
        indicatorRef.current.style.display = 'none';
      }
      lastTriggeredIndex.current = -1;
      return;
    }

    const updateGrid = () => {
      // Tiempo relativo dentro del grid (para loops)
      const relativeTime = currentTime % gridDuration;
      const currentCellIndex = Math.floor(relativeTime / subdivisionDuration);
      const currentPosition = (relativeTime % subdivisionDuration) / subdivisionDuration;

      // Actualizar indicador visual
      if (indicatorRef.current) {
        const cell = document.getElementById(`cell-0-${currentCellIndex}`);
        if (cell) {
          const progress = currentPosition * cell.offsetWidth;
          indicatorRef.current.style.transform = `translateX(${cell.offsetLeft + progress}px)`;
          indicatorRef.current.style.width = `${cell.offsetWidth}px`;
          indicatorRef.current.style.display = 'block';
        }
      }

      // Disparar eventos solo cuando cambiamos de celda
      if (currentCellIndex !== lastTriggeredIndex.current) {
        lastTriggeredIndex.current = currentCellIndex;
        
        // Buscar celdas seleccionadas en esta posición
        selectedCellsMap.forEach((cellData, cellId) => {
          const [rowIndex, cellIndex] = cellId.split('-').map(Number);
          if (cellIndex === currentCellIndex) {
            onCellTrigger?.(cellData);
          }
        });
      }

      animationRef.current = requestAnimationFrame(updateGrid);
    };

    animationRef.current = requestAnimationFrame(updateGrid);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentTime, isPlaying, subdivisionDuration, gridDuration, onCellTrigger, selectedCellsMap]);

  // Renderizado
  return (
    <div style={{ 
      position: 'relative', 
      height: `${rows * ROW_HEIGHT}px`,
      overflowX: 'hidden'
    }}>
      <div 
        ref={gridRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.02)'
        }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`}
            style={{
              display: 'flex',
              width: '100%',
              height: `${ROW_HEIGHT}px`,
              borderBottom: rowIndex < rows - 1 ? '1px solid #e0e0e0' : 'none'
            }}
          >
            {Array.from({ length: totalElements }).map((_, cellIndex) => {
              const isSubdivision = cellIndex % subdivisionsPerPulse !== 0;
              const isPulseStart = cellIndex % subdivisionsPerPulse === 0;
              const isMeasureStart = (cellIndex / subdivisionsPerPulse) % pulsesPerMeasure === 0;
              
              const borderColor = isMeasureStart ? '#2196F3' : isPulseStart ? '#FF5722' : '#4CAF50';
              const borderStyle = isSubdivision ? '1px dashed' : '2px solid';
              const cellId = `${rowIndex}-${cellIndex}`;
              const isSelected = selectedCells.has(cellId);

              return (
                <div
                  id={`cell-${rowIndex}-${cellIndex}`}
                  key={`cell-${rowIndex}-${cellIndex}`}
                  onClick={() => handleCellClick(rowIndex, cellIndex)}
                  style={{
                    width: `${subdivisionWidth}px`,
                    height: '100%',
                    borderLeft: `${borderStyle} ${borderColor}`,
                    backgroundColor: isSelected ? selectedColor : 'transparent',
                    flexShrink: 0,
                    minWidth: `${subdivisionWidth}px`,
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    ':hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div
        ref={indicatorRef}
        style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          backgroundColor: activeColor,
          pointerEvents: 'none',
          display: 'none',
          transition: 'transform 0.05s linear',
          zIndex: 2,
          opacity: 0.7,
          willChange: 'transform'
        }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación optimizada para evitar renders innecesarios
  return (
    prevProps.PIXELS_PER_SECOND === nextProps.PIXELS_PER_SECOND &&
    prevProps.BPM === nextProps.BPM &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.currentTime === nextProps.currentTime
  );
});

export default SubdivisionGrid;











/*import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";

const SubdivisionGrid = memo(({
  PIXELS_PER_SECOND = 100,
  pulsesPerMeasure = 4,
  subdivisionsPerPulse = 2,
  BPM = 120,
  totalElements = 32,
  rows = 4,
  onCellTrigger,
  currentTime = 0,
  isPlaying = false,
  activeColor = "rgba(0, 47, 255, 0.7)",
  selectedColor = "rgba(255, 0, 0, 0.5)"
}) => {
  // Cálculos de tiempo optimizados
  const secondsPerPulse = 60 / BPM;
  const subdivisionDuration = secondsPerPulse / subdivisionsPerPulse;
  const pulseWidth = secondsPerPulse * PIXELS_PER_SECOND;
  const subdivisionWidth = pulseWidth / subdivisionsPerPulse;
  const ROW_HEIGHT = 40;
  
  // Estados y referencias optimizados
  const [selectedCells, setSelectedCells] = useState(() => new Set());
  const gridRef = useRef(null);
  const indicatorRef = useRef(null);
  const lastTriggeredCells = useRef({});
  const frameRequestRef = useRef(null);

  // Mapa de celdas seleccionadas con useMemo
  const selectedCellsMap = useMemo(() => {
    const map = new Map();
    selectedCells.forEach(cellId => {
      const [rowIndex, cellIndex] = cellId.split('-').map(Number);
      const startTime = cellIndex * subdivisionDuration;
      map.set(cellId, {
        row: rowIndex + 1,
        column: cellIndex + 1,
        startTime,
        endTime: startTime + subdivisionDuration,
        duration: subdivisionDuration
      });
    });
    return map;
  }, [selectedCells, subdivisionDuration]);

  // Manejador de clic optimizado
  const handleCellClick = useCallback((rowIndex, cellIndex) => {
    const cellId = `${rowIndex}-${cellIndex}`;
    setSelectedCells(prev => new Set(prev.has(cellId) ? 
      (prev.delete(cellId), prev) : prev.add(cellId)));
  }, []);

  // Efecto principal con requestAnimationFrame para mayor precisión
  useEffect(() => {
    if (!isPlaying) {
      if (indicatorRef.current) {
        indicatorRef.current.style.display = 'none';
      }
      return;
    }

    const checkTriggers = () => {
      const currentCellIndex = Math.floor(currentTime / subdivisionDuration);
      const currentPosition = (currentTime % subdivisionDuration) / subdivisionDuration;

      // Mover indicador visual suavemente
      if (indicatorRef.current) {
        const cell = document.getElementById(`cell-0-${currentCellIndex}`);
        if (cell) {
          const progress = currentPosition * cell.offsetWidth;
          indicatorRef.current.style.transform = `translateX(${cell.offsetLeft + progress}px)`;
          indicatorRef.current.style.width = `${cell.offsetWidth}px`;
          indicatorRef.current.style.display = 'block';
        }
      }

      // Disparar triggers con lógica de progreso
      // Dentro de la función checkTriggers:
selectedCellsMap.forEach((cellData, cellId) => {
  const [rowIndex, cellIndex] = cellId.split('-').map(Number);
  
  if (cellIndex === currentCellIndex) {
    const triggerKey = `${cellId}-${currentCellIndex}`;
    const shouldTrigger = 
      !lastTriggeredCells.current[triggerKey]; // Eliminar la condición de posición

    if (shouldTrigger) {
      onCellTrigger?.(cellData);
      lastTriggeredCells.current[triggerKey] = true;
      
      setTimeout(() => {
        delete lastTriggeredCells.current[triggerKey];
      }, subdivisionDuration * 1000);
    }
  }
});

      frameRequestRef.current = requestAnimationFrame(checkTriggers);
    };

    frameRequestRef.current = requestAnimationFrame(checkTriggers);

    return () => {
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [currentTime, isPlaying, subdivisionDuration, onCellTrigger, selectedCellsMap]);

  // Limpieza de triggers al parar
  useEffect(() => {
    if (!isPlaying) {
      lastTriggeredCells.current = {};
    }
  }, [isPlaying]);

  // Renderizado optimizado
  return (
    <div style={{ 
      position: 'relative', 
      height: `${rows * ROW_HEIGHT}px`,
      overflowX: 'hidden'
    }}>
      <div 
        ref={gridRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.02)'
        }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`}
            style={{
              display: 'flex',
              width: '100%',
              height: `${ROW_HEIGHT}px`,
              borderBottom: rowIndex < rows - 1 ? '1px solid #e0e0e0' : 'none'
            }}
          >
            {Array.from({ length: totalElements }).map((_, cellIndex) => {
              const isSubdivision = cellIndex % subdivisionsPerPulse !== 0;
              const isPulseStart = cellIndex % subdivisionsPerPulse === 0;
              const isMeasureStart = (cellIndex / subdivisionsPerPulse) % pulsesPerMeasure === 0;
              
              const borderColor = isMeasureStart ? '#2196F3' : isPulseStart ? '#FF5722' : '#4CAF50';
              const borderStyle = isSubdivision ? '1px dashed' : '2px solid';
              const cellId = `${rowIndex}-${cellIndex}`;
              const isSelected = selectedCells.has(cellId);

              return (
                <div
                  id={`cell-${rowIndex}-${cellIndex}`}
                  key={`cell-${rowIndex}-${cellIndex}`}
                  onClick={() => handleCellClick(rowIndex, cellIndex)}
                  style={{
                    width: `${subdivisionWidth}px`,
                    height: '100%',
                    borderLeft: `${borderStyle} ${borderColor}`,
                    backgroundColor: isSelected ? selectedColor : 'transparent',
                    flexShrink: 0,
                    minWidth: `${subdivisionWidth}px`,
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    ':hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      <div
        ref={indicatorRef}
        style={{
          position: 'absolute',
          top: 0,
          height: '100%',
          backgroundColor: activeColor,
          pointerEvents: 'none',
          display: 'none',
          transition: 'transform 0.05s linear',
          zIndex: 2,
          opacity: 0.7,
          willChange: 'transform'
        }}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparación optimizada para React.memo
  const timeDifference = Math.abs(prevProps.currentTime - nextProps.currentTime);
  const subdivisionDuration = 60 / nextProps.BPM / nextProps.subdivisionsPerPulse;
  
  return (
    timeDifference < (subdivisionDuration * 0.1) && // Solo actualizar si el cambio es significativo
    prevProps.PIXELS_PER_SECOND === nextProps.PIXELS_PER_SECOND &&
    prevProps.pulsesPerMeasure === nextProps.pulsesPerMeasure &&
    prevProps.subdivisionsPerPulse === nextProps.subdivisionsPerPulse &&
    prevProps.BPM === nextProps.BPM &&
    prevProps.totalElements === nextProps.totalElements &&
    prevProps.rows === nextProps.rows &&
    prevProps.isPlaying === nextProps.isPlaying
  );
});

export default SubdivisionGrid;*/
