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
        minWidth: `calc(100% + ${windowWidth}px)`, // Por si acaso
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
            width: `${pixelsPerSecond}px`,
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex" }}>
            <div style={{padding: '0', border: 'solid 1px black'}} className="color1"></div>
            <div style={{marginTop: '10px'}} className="time-label title-xxs color1">{formatTime(i)}</div>
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