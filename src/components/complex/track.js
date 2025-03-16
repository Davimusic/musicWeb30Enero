import React, { useRef, useEffect, memo, useState, useCallback } from "react";
import TrashIcon from "./trashIcon";
import RangeInput from "./rangeInput";
import ToggleMute from "./ToggleMute";
import ToggleSolo from "./toggleSolo";
import PanIcon from "./panIcon";
import ResponsiveContent from "./responsiveContent";






const Track = memo(({
  track,
  deleteTrack,
  zoomLevel,
  audioContextRef,
  muteAllExceptThis,
  updateTrackVolume,
  updateTrackMuted,
  updateTrackPanning,
  showContent
}) => {
  const canvasRef = useRef(null);
  const [audioData, setAudioData] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Calcular el ancho del track (lo que sea mayor entre el audio y la ventana)
  const trackWidth = Math.max(track.duration * 500 * zoomLevel, windowWidth);

  // Manejar el redimensionamiento de la ventana
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Preprocesar el audio y almacenar sus datos en estado
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const response = await fetch(track.url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setAudioData(audioBuffer.getChannelData(0));
      } catch (error) {
        console.error("Error loading audio:", error);
      }
    };

    loadAudio();
  }, [track.url, audioContextRef]);

  // Renderizar la onda de audio
  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Configuración inicial del canvas
    canvas.width = trackWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2;
    const totalSamples = audioData.length;
    const audioWidth = track.duration * 500 * zoomLevel; // Ancho real del audio

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    // Dibujar la onda de audio hasta donde alcance el archivo
    const samplesPerPixel = totalSamples / audioWidth;
    for (let x = 0; x < audioWidth; x++) {
      const start = Math.floor(x * samplesPerPixel);
      const end = Math.floor((x + 1) * samplesPerPixel);
      const avg = Array.from({ length: end - start })
        .reduce((acc, _, i) => acc + Math.abs(audioData[start + i] || 0), 0) / (end - start);

      const y = (avg * centerY);
      ctx.lineTo(x, centerY - y);
      ctx.lineTo(x, centerY + y);
    }

    // Extender una línea plana hasta el final si hay espacio restante
    if (trackWidth > audioWidth) {
      ctx.lineTo(trackWidth, centerY); // Línea recta hasta el final
    }

    ctx.strokeStyle = "#2196f3";
    ctx.stroke();
  }, [audioData, trackWidth, track.duration, zoomLevel]);

  // Handlers para los controles
  const handleVolumeChange = useCallback((newValue) => {
    updateTrackVolume(track.id, newValue / 100);
  }, [track.id, updateTrackVolume]);

  const handlePanningChange = useCallback((newValue) => {
    updateTrackPanning(track.id, newValue); // Rango directamente (-50 a 50)
  }, [track.id, updateTrackPanning]);

  const handlePanIconClick = useCallback(() => {
    updateTrackPanning(track.id, 0); // Valor de "centro" 0
  }, [track.id, updateTrackPanning]);

  return (
    <div className={`track ${track.muted ? "muted" : ""}`} style={{ width: trackWidth }}>
      <div className="track-controls-wrapper">
        <div className="track-controls">
          <ResponsiveContent showContent={showContent}>
            <RangeInput
              value={track.volume * 100}
              min={0}
              max={100}
              onChange={handleVolumeChange}
            />
            <RangeInput
              value={track.panning}
              min={-50}
              max={50}
              onChange={handlePanningChange}
              children={<PanIcon panValue={track.panning} onClick={handlePanIconClick} />}
            />
          </ResponsiveContent>
          <ToggleSolo
            size={30}
            isSolo={track.isSolo}
            onToggle={() => muteAllExceptThis(track.id)}
          />
          <TrashIcon onClick={() => deleteTrack(track.id)} />
        </div>
      </div>
      <div className="track-content">
        <canvas ref={canvasRef} height="100" />
      </div>
    </div>
  );
});

export default Track;