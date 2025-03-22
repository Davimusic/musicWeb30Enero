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
  
    // 1. Calcular píxeles correspondientes al startTime del track
    const startPixels = track.startTime * pixelsPerSecond;
    
    // 2. Ajustar el offsetX restando los píxeles del startTime
    const effectiveOffsetX = Math.max(offsetX - startPixels, 0);
    
    // 3. Calcular tiempo local basado en el contenido real del track
    const selectedTimeLocal = effectiveOffsetX / pixelsPerSecond;
    
    // 4. Calcular tiempo global sumando el startTime
    const selectedTimeGlobal = track.startTime + selectedTimeLocal;
  
    onSelectTime(selectedTimeGlobal);
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






