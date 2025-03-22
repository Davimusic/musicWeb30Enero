import React, { useEffect, useRef, memo } from "react";
import drawWaveform from "@/functions/music/drawWaveform";

const Track = memo(({ track, pixelsPerSecond, onSelectTime }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track.audioBuffer) return;

    const duration = track.audioBuffer.duration;
    const totalWidth = duration * pixelsPerSecond;
    canvas.width = totalWidth;
    canvas.style.width = `${totalWidth}px`;

    // Redibujar la onda cuando cambie el startTime
    drawWaveform(canvas, track.audioBuffer, pixelsPerSecond, track);
  }, [track.audioBuffer, pixelsPerSecond, track.startTime]); // <-- Agrega track.startTime como dependencia

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectTime) return;
  
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
  
    // Calcular el tiempo local dentro del track
    const selectedTimeLocal = (offsetX / canvas.offsetWidth) * track.audioBuffer.duration;
  
    // Convertir a tiempo global sumando el startTime del track
    const selectedTimeGlobal = track.startTime + selectedTimeLocal;
  
    onSelectTime(selectedTimeGlobal); // Pasar el tiempo global al handler
  };

  return (
    <div
      className="track-waveform"
      onClick={handleCanvasClick}
      style={{ opacity: track.muted ? 0.5 : 1 }}
    >
      <canvas ref={canvasRef} height="100" />
    </div>
  );
});

export default Track;






