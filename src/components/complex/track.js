import React, { useEffect, useRef, memo } from "react";
import drawWaveform from "@/functions/music/drawWaveform";

const Track = memo(({ track, zoomLevel }) => {
  const canvasRef = useRef(null);

  // Dibujar la forma de onda cuando cambia el zoom o el audioBuffer
  useEffect(() => {
    if (!canvasRef.current || !track.audioBuffer) return;

    const canvas = canvasRef.current;
    const width = track.duration * 500 * zoomLevel; // Ancho basado en duración y zoom
    canvas.width = width; // Ajustar el ancho del canvas
    canvas.height = 100; // Altura fija

    drawWaveform(canvas, track.audioBuffer, zoomLevel);
  }, [track.audioBuffer, zoomLevel, track.duration]);

  return (
    <div
      className="track-waveform"
      style={{ opacity: track.muted ? 0.5 : 1 }} // Aplicar opacidad si está muteado
    >
      <canvas ref={canvasRef} height="100" />
    </div>
  );
});

export default Track;