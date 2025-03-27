import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../estilos/general/general.css";
import "../../estilos/music/audioEditor.css";
import { formatTime } from "@/functions/music/mediaUtils";







const TimeRuler = ({ pixelsPerSecond, tracks, sidebarWidth }) => {
  
  if (!tracks || tracks.length === 0) {
    return null;
  }

  // Calcular la duración máxima
  const maxDuration = Math.max(
    ...tracks.map((track) => track.startTime + track.duration)
  );

  // Número de marcas (de 0 a máximo segundos inclusive)
  const numberOfMarks = Math.ceil(maxDuration) + 1;

  // Ancho total basado en marcas de 100px
  const rulerWidth = numberOfMarks * 100;




  
  

  return (
    <div
      className="time-ruler"
      style={{
        width: `${rulerWidth + 900}px`, // Ancho exacto para las marcas
        display: 'flex' // Asegura layout horizontal
      }}
    >
      {Array.from({ length: numberOfMarks }).map((_, i) => (
        <div
          key={i}
          className="time-mark"
          style={{width: `${pixelsPerSecond}px`}}
        >
          <div style={{ display: "flex" }}>
            <div className="time-label title-md color1">I</div>
            <div className="time-label title-xxs color1">{formatTime(i)}</div>
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
