import React, { useEffect, useRef, memo } from "react";
import { drawWaveform } from "@/functions/music/drawWaveform";

const Track = memo(({ track, pixelsPerSecond, onSelectTime, tracks, pixelsHeight, setTracks }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track.audioBuffer) return;
    // Redibujar la forma de onda cuando cambien los filtros o se fuerce la actualización
    drawWaveform(canvas, track.audioBuffer, pixelsPerSecond, track, setTracks, track.backgroundColorTrack);
  }, [track.audioBuffer, pixelsPerSecond, track.startTime, track.filters, track.redraw, track.backgroundColorTrack, pixelsHeight]); // <-- Agrega track.filters y track.redraw como dependencias

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

  // Determinar si algún track tiene solo activado
  const isSoloActive = tracks.some(t => t.solo);

  return (
    <div
  onClick={handleCanvasClick}
  style={{
    opacity: track.muted ? 0.5 : (isSoloActive && !track.solo ? 0.3 : 1),
  }}
>
  <canvas ref={canvasRef} height={pixelsHeight} />
</div>

  );
});

export default Track;






