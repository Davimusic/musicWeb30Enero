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

    drawWaveform(canvas, track.audioBuffer, pixelsPerSecond);
  }, [track.audioBuffer, pixelsPerSecond]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectTime) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const selectedTime = (offsetX / canvas.offsetWidth) * track.audioBuffer.duration;

    onSelectTime(selectedTime);
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






/*import React, { useEffect, useRef, memo } from "react";
import drawWaveform from "@/functions/music/drawWaveform";

const Track = memo(({ track, pixelsPerSecond, onSelectTime }) => {
  const canvasRef = useRef(null);

  // Dibujar la onda cuando cambia el buffer de audio o el zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !track.audioBuffer) return;

    // Calcular el ancho total basado en la duración del audio
    const duration = track.audioBuffer.duration;
    const totalWidth = duration * pixelsPerSecond;

    // Ajustar el tamaño del canvas
    canvas.width = totalWidth;
    canvas.style.width = `${totalWidth}px`;

    // Dibujar la onda
    drawWaveform(canvas, track.audioBuffer, pixelsPerSecond);
  }, [track.audioBuffer, pixelsPerSecond]);

  // Manejar clics en el canvas para seleccionar tiempo
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSelectTime) return;

    // Obtener la posición del clic relativa al canvas
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    // Calcular el tiempo seleccionado basado en la posición del clic
    const selectedTime = (offsetX / canvas.offsetWidth) * track.audioBuffer.duration;

    console.log("Clic en el waveform:");
    console.log("Posición X:", offsetX, "px");
    console.log("Tiempo seleccionado:", selectedTime, "segundos");

    // Llamar a la función de selección de tiempo
    onSelectTime(selectedTime);
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

export default Track;*/