import React from "react";
import PropTypes from "prop-types";
import "../../estilos/general/general.css";

const TimeRuler = ({ totalDuration, zoomLevel, currentTime }) => {
  const rulerWidth = totalDuration * 500 * zoomLevel;

  return (
    <div className="time-ruler" style={{ width: `${rulerWidth}px` }}>
      {/* Marcador de tiempo actual */}
      <div
        className="current-time-marker"
        style={{ left: `${currentTime * 500 * zoomLevel}px` }}
      ></div>

      {/* Marcas de tiempo */}
      {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, i) => (
        <div
          key={i}
          className="time-mark"
          style={{ left: `${i * 500 * zoomLevel}px` }}
        >
          <div className="time-label">{i}s</div>
          <div className="tick"></div>
        </div>
      ))}
    </div>
  );
};

TimeRuler.propTypes = {
  totalDuration: PropTypes.number.isRequired,
  zoomLevel: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default TimeRuler;