import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "../../estilos/general/general.css";
import "../../estilos/music/audioEditor.css";
import { formatTime } from "@/functions/music/mediaUtils";

const TimeRuler = ({ pixelsPerSecond, tracks }) => {
  const [windowWidth, setWindowWidth] = useState(0);
  const rulerRef = useRef(null);

  // 1. Efecto solo para cliente que observa el ancho de la ventana
  useEffect(() => {
    // Solo ejecutar en cliente
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Inicializar con el ancho actual
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!tracks || tracks.length === 0) return null;

  // 2. Filtrar tracks que no son drumMachine y calcular ancho base
  const nonDrumMachineTracks = tracks.filter(track => track.type !== "drumMachine");
  
  // Si no hay tracks relevantes, mostrar un ruler mínimo
  if (nonDrumMachineTracks.length === 0) {
    return (
      <div className="time-ruler" style={{ width: "100%", height: "30px", backgroundColor: "white" }} />
    );
  }

  const maxDuration = Math.max(
    ...nonDrumMachineTracks.map(track => track.startTime + (track.duration || 0))
  );
  const tracksWidth = maxDuration * pixelsPerSecond;

  // 3. Ancho TOTAL = ancho de tracks + ancho de ventana (extra)
  const totalWidth = tracksWidth + windowWidth;

  // 4. Calcular marcas (cada segundo)
  const totalSeconds = Math.ceil(totalWidth / pixelsPerSecond);
  const numberOfMarks = totalSeconds + 1;

  // Render seguro para SSR
  if (typeof window === "undefined") {
    return (
      <div className="time-ruler" style={{ width: "100%", height: "30px", backgroundColor: "white" }} />
    );
  }

  return (
    <div 
      ref={rulerRef}
      className="time-ruler"
      style={{
        width: `${totalWidth}px`,
        minWidth: `calc(100% + ${windowWidth}px)`,
        height: "30px",
        position: "sticky",
        top: 0,
        left: 0,
        zIndex: 11,
        backgroundColor: "white",
        display: "flex",
        overflow: "hidden" // Evita que se desborde el contenido
      }}
    >
      {Array.from({ length: numberOfMarks }).map((_, i) => (
        <div
          key={i}
          className="time-mark"
          style={{
            width: `${pixelsPerSecond}px`,
            flexShrink: 0,
            boxSizing: "border-box",
            borderLeft: "1px solid black",
          }}
        > 
          {/* Fila superior: etiqueta de tiempo */}
          <div 
            style={{ 
              textAlign: "center", 
              marginTop: "2px",
              overflow: "hidden",
              whiteSpace: "nowrap",
              fontSize: '10px'
            }} 
            className="time-label  color1"
          >
            {formatTime(i)}
          </div>
          {/* Fila inferior: subdivisiones equidistantes */}
          <div 
            style={{ 
              position: "relative", 
              height: "15px", 
              width: "100%" 
            }}
          >
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  left: `${((j + 1) * 100) / 4}%`, // 25%, 50% y 75% para 4 subdivisiones
                  top: 0,
                  height: "100%",
                  width: "1px",
                  backgroundColor: "gray",
                }}
              />
            ))}
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
      duration: PropTypes.number,
      startTime: PropTypes.number,
      type: PropTypes.string
    })
  ).isRequired,
  sidebarWidth: PropTypes.number.isRequired,
};

export default TimeRuler;