import PropTypes from "prop-types";
import "../../estilos/general/general.css";
import '../../estilos/music/audioEditor.css';
import React, { useState, useEffect } from 'react';

const TimeRuler = ({ pixelsPerSecond, tracks }) => {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Función que actualiza el ancho de la ventana
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Configurar el evento listener
    handleResize(); // Llamarlo al cargar el componente
    window.addEventListener('resize', handleResize);

    // Limpiar el listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  
  // Si no hay tracks, no renderizar nada
  if (!tracks || tracks.length === 0) {
    return null;
  }

  // Calcular la duración máxima de los tracks
  const maxDuration = Math.max(...tracks.map(track => track.duration));

  // Calcular el ancho total de la regla
  const rulerWidth = maxDuration * pixelsPerSecond;

  // Calcular el número de marcas de tiempo (una por segundo)
  const numberOfMarks = Math.ceil(maxDuration);

  return (
    <div className="time-ruler" style={{marginLeft: '220px', width: `${rulerWidth + windowWidth}px` }}>
      {/* Marcas de tiempo */}
      {Array.from({ length: numberOfMarks + 1 }).map((_, i) => {
        const leftPosition = i * pixelsPerSecond;
        return (
          <div key={i} className="time-mark" style={{ width: `${pixelsPerSecond}px` }} >
            <div style={{display: 'flex'}}>
              <div className="time-label title-md color2">I</div>
              <div className="time-label title-md color2">{i}s</div>
              <div className="tick title-md color2"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

TimeRuler.propTypes = {
  pixelsPerSecond: PropTypes.number.isRequired,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      audioBuffer: PropTypes.object,
      gainNode: PropTypes.object,
      pannerNode: PropTypes.object,
      duration: PropTypes.number.isRequired,
      volume: PropTypes.number,
      panning: PropTypes.number,
      muted: PropTypes.bool,
      name: PropTypes.string,
      sourceNode: PropTypes.object,
      startTime: PropTypes.number,
      offset: PropTypes.number,
    })
  ).isRequired,
};

export default TimeRuler;