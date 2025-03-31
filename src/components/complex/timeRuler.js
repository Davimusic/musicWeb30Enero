import React from "react";
import PropTypes from "prop-types";
import "../../estilos/general/general.css";
import "../../estilos/music/audioEditor.css";
import { formatTime } from "@/functions/music/mediaUtils";

const TimeRuler = ({ pixelsPerSecond, tracks }) => {
  if (!tracks || tracks.length === 0) {
    return null;
  }

  // Calcular la duración máxima (en segundos)
  const maxDuration = Math.max(
    ...tracks.map((track) => track.startTime + track.duration)
  );

  // Ancho total basado en la duración máxima y los píxeles por segundo
  const rulerWidth = maxDuration * pixelsPerSecond;

  // Número de marcas (cada segundo)
  const numberOfMarks = Math.ceil(maxDuration) + 1;

  return (
    <div 
      className="time-ruler"
      style={{
        width: `${rulerWidth}px`, // Ancho exacto basado en la duración
        height: "30px",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 11,
        backgroundColor: "white",
        display: "flex",
        overflow: "visible"
      }}
    >
      {Array.from({ length: numberOfMarks }).map((_, i) => (
        <div
          key={i}
          className="time-mark"
          style={{
            width: `${pixelsPerSecond}px`, // Cada marca ocupa 1 segundo
            flexShrink: 0
          }}
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