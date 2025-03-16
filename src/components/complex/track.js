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

  const trackWidth = Math.max(track.duration * 500 * zoomLevel, windowWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  useEffect(() => {
    if (!canvasRef.current || !audioData) return;
  
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    // Ajustar dimensiones del lienzo
    const adjustedWidth = trackWidth;
  
    canvas.width = adjustedWidth;
    canvas.height = 100; // Puedes ajustar la altura según tus necesidades
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const centerY = canvas.height / 2;
    const totalSamples = audioData.length;
    const audioWidth = track.duration * 500 * zoomLevel;
  
    // Dibujar la forma de onda
    ctx.beginPath();
    ctx.moveTo(0, centerY);
  
    const samplesPerPixel = totalSamples / audioWidth;
    for (let x = 0; x < audioWidth; x++) {
      const start = Math.floor(x * samplesPerPixel);
      const end = Math.floor((x + 1) * samplesPerPixel);
      const avg = Array.from({ length: end - start })
        .reduce((acc, _, i) => acc + Math.abs(audioData[start + i] || 0), 0) / (end - start);
  
      const y = avg * centerY;
      ctx.lineTo(x, centerY - y);
      ctx.lineTo(x, centerY + y);
    }
  
    ctx.strokeStyle = "#2196f3"; // Color azul para la forma de onda
    ctx.stroke();
  
    // Dibujar una línea horizontal roja en el área de excedente
    if (adjustedWidth > audioWidth) {
      ctx.beginPath();
      ctx.moveTo(audioWidth, centerY); // Empieza donde termina el ancho del audio
      ctx.lineTo(adjustedWidth, centerY); // Extiende la línea al ancho ajustado
      ctx.strokeStyle = "red"; // Color de la línea roja
      ctx.lineWidth = 2; // Grosor opcional para la línea roja
      ctx.stroke();
    }
  }, [audioData, trackWidth, track.duration, zoomLevel, windowWidth]);
  

  const handleVolumeChange = useCallback((newValue) => {
    updateTrackVolume(track.id, newValue / 100);
  }, [track.id, updateTrackVolume]);

  const handlePanningChange = useCallback((newValue) => {
    updateTrackPanning(track.id, newValue);
  }, [track.id, updateTrackPanning]);

  const handlePanIconClick = useCallback(() => {
    updateTrackPanning(track.id, 0);
  }, [track.id, updateTrackPanning]);

  return (
    <div className={`track ${track.muted ? "muted" : ""}`} style={{ width: trackWidth }}>
      <div className="track-controls-wrapper">
        <div className="track-controls">
          <ResponsiveContent showContent={showContent}>
            <div style={{ paddingBottom: '10px' }}>
              <RangeInput
                value={track.volume * 100}
                min={0}
                max={100}
                onChange={handleVolumeChange}
                children={
                  <ToggleMute
                    size={30}
                    isMuted={track.muted}
                    onToggle={() => updateTrackMuted(track.id, !track.muted)}
                  />
                }
              />
              <RangeInput
                value={track.panning}
                min={-50}
                max={50}
                onChange={handlePanningChange}
                children={
                  <PanIcon
                    panValue={track.panning}
                    onClick={handlePanIconClick}
                  />
                }
              />
            </div>
          </ResponsiveContent>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ToggleSolo
              size={30}
              isSolo={track.isSolo}
              onToggle={() => muteAllExceptThis(track.id)}
            />
            <TrashIcon onClick={() => deleteTrack(track.id)} />
          </div>
        </div>
      </div>
      <div className="track-content">
        <canvas ref={canvasRef} height="100" />
      </div>
    </div>
  );
});

export default Track;
