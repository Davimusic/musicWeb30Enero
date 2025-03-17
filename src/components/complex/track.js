import React, { useEffect, useRef, memo } from "react";
import drawWaveform from "@/functions/music/drawWaveform";

const Track = memo(({ track, zoomLevel }) => {
  const canvasRef = useRef(null);

  // Función para redibujar la forma de onda
  const redrawWaveform = () => {
    if (!canvasRef.current || !track.audioBuffer) return;

    const canvas = canvasRef.current;
    const width = track.duration * 500 * zoomLevel; // Ancho basado en duración y zoom
    canvas.width = width; // Ajustar el ancho del canvas
    canvas.height = 100; // Altura fija

    drawWaveform(canvas, track.audioBuffer, zoomLevel);
  };

  // Efecto para redibujar cuando cambia el zoom o el audioBuffer
  useEffect(() => {
    redrawWaveform();
  }, [track.audioBuffer, zoomLevel, track.duration]);

  // Efecto para manejar el redimensionamiento de la ventana
  useEffect(() => {
    const handleResize = () => {
      redrawWaveform();
    };

    window.addEventListener("resize", handleResize);

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [redrawWaveform]);

  return (
    <div className="track-waveform">
      <canvas ref={canvasRef} height="100" />
    </div>
  );
});

export default Track;