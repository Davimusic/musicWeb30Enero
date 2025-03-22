import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../estilos/general/general.css";
import "../../estilos/music/audioEditor.css";
import { formatTime } from "@/functions/music/mediaUtils";







const TimeRuler = ({ pixelsPerSecond, tracks, sidebarWidth }) => {

  console.log(pixelsPerSecond);
  
  if (!tracks || tracks.length === 0) {
    return null;
  }

  // Calcular la duración máxima incluyendo el startTime de cada track
  const maxDuration = Math.max(
    ...tracks.map((track) => track.startTime + track.duration)
  );

  // Redondear el valor de pixelsPerSecond para evitar decimales
  const adjustedPixelsPerSecond = Math.round(pixelsPerSecond);

  // Ancho total del ruler basado en la duración máxima, redondeado
  const rulerWidth = Math.round(maxDuration * adjustedPixelsPerSecond);

  // Número de marcas (una por segundo)
  const numberOfMarks = Math.ceil(maxDuration);

  return (
    <div
      className="time-ruler"
      style={{
        marginLeft: `200px`, // Si usas sidebarWidth, asegurate de aplicarlo correctamente
        width: `${rulerWidth+100}px`,
        marginRight: '100px'
      }}
    >
      {Array.from({ length: numberOfMarks + 1 }).map((_, i) => (
        <div
          key={i}
          className="time-mark"
          //style={{ width: `100px` }}
        >
          <div style={{ display: "flex" }}>
            <div className="time-label title-md color2">I</div>
            <div className="time-label title-xxs color2">{formatTime(i)}</div>
            <div className="tick title-md color2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};


TimeRuler.propTypes = {
  pixelsPerSecond: PropTypes.number.isRequired,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      duration: PropTypes.number.isRequired,
      startTime: PropTypes.number.isRequired,
    })
  ).isRequired,
  sidebarWidth: PropTypes.number.isRequired,
};

export default TimeRuler;
