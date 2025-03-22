import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../estilos/general/general.css";
import "../../estilos/music/audioEditor.css";
import { formatTime } from "@/functions/music/mediaUtils";

const TimeRuler = ({ pixelsPerSecond, tracks, sidebarWidth }) => {
  // Eliminamos el ResizeObserver y usamos directamente el prop
  if (!tracks || tracks.length === 0) {
    return null;
  }

  const maxDuration = Math.max(...tracks.map((track) => track.duration));
  const rulerWidth = maxDuration * pixelsPerSecond;

  const numberOfMarks = Math.ceil(maxDuration);

  return (
    <div
      className="time-ruler"
      style={{
        marginLeft: `${sidebarWidth}px`, // Usamos el prop directamente
        width: `${rulerWidth}px`, // Eliminamos el window.innerWidth adicional
      }}
    >
      {Array.from({ length: numberOfMarks + 1 }).map((_, i) => (
        <div
          key={i}
          className="time-mark"
          style={{ width: `${pixelsPerSecond}px`}}
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

// Mantenemos las PropTypes actualizadas
TimeRuler.propTypes = {
  pixelsPerSecond: PropTypes.number.isRequired,
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
      // ... resto de las propiedades del track
    })
  ).isRequired,
  sidebarWidth: PropTypes.number.isRequired, // Nueva prop
};

export default TimeRuler
