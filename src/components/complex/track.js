import React, { useRef, useEffect, memo, useState } from "react";
import TrashIcon from "./trashIcon";

const Track = memo(({
  track,
  deleteTrack,
  zoomLevel,
  containerWidth,
  audioContextRef,
  muteAllExceptThis,
  updateTrackVolume,
  updateTrackMuted,
  updateTrackPanning,
  isSolo
}) => {
  const canvasRef = useRef(null);
  const [audioData, setAudioData] = useState(null);
  const trackWidth = track.duration ? track.duration * 500 * zoomLevel : 0;

  // Referencias para los nodos de audio
  const audioRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const pannerNodeRef = useRef(null);

  // Inicializar el audio y los nodos
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(track.url);
      console.log("Audio object created for track:", track.id, audioRef.current);
    }

    if (audioContextRef.current && !sourceNodeRef.current) {
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      pannerNodeRef.current = new StereoPannerNode(audioContextRef.current, { pan: track.panning });
      sourceNodeRef.current
        .connect(pannerNodeRef.current)
        .connect(audioContextRef.current.destination);
      console.log("Audio nodes created for track:", track.id, sourceNodeRef.current, pannerNodeRef.current);
    }

    // Configurar el volumen y mute inicial
    audioRef.current.volume = track.muted ? 0 : track.volume;

    return () => {
      // Limpiar al desmontar
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        pannerNodeRef.current.disconnect();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
    };
  }, [track.url, audioContextRef]);

  // Actualizar el volumen
  useEffect(() => {
    if (audioRef.current) {
      console.log("Updating volume for track:", track.id, "to", track.muted ? 0 : track.volume);
      audioRef.current.volume = track.muted ? 0 : track.volume; // Aplicar el volumen al elemento de audio
    }
  }, [track.volume, track.muted]);

  // Actualizar el panning
  useEffect(() => {
    if (pannerNodeRef.current) {
      console.log("Updating panning for track:", track.id, "to", track.panning);
      pannerNodeRef.current.pan.value = track.panning;
    }
  }, [track.panning]);

  // Cargar el audio y configurar la onda
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

    if (track.audioBuffer) {
      setAudioData(track.audioBuffer.getChannelData(0));
    } else {
      loadAudio();
    }
  }, [track.url, track.audioBuffer]);

  // Renderizar la onda de audio
  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = trackWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const samplesPerPixel = audioData.length / trackWidth;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    for (let x = 0; x < trackWidth; x++) {
      const start = Math.floor(x * samplesPerPixel);
      const end = Math.floor((x + 1) * samplesPerPixel);
      const avg = Array.from({ length: end - start })
        .reduce((acc, _, i) => acc + Math.abs(audioData[start + i] || 0), 0) / (end - start);
      
      const y = (avg * canvas.height) / 2;
      ctx.lineTo(x, canvas.height / 2 - y);
      ctx.lineTo(x, canvas.height / 2 + y);
    }

    ctx.strokeStyle = "#2196f3";
    ctx.stroke();
  }, [audioData, zoomLevel, trackWidth]);

  return (
    <div className="track" style={{ width: trackWidth, opacity: isSolo ? 1 : 0.5 }}>
      <div className="track-controls-wrapper">
        {/* Controles que se mantienen estáticos */}
        <div className="track-controls">
          <button onClick={() => updateTrackMuted(track.id, !track.muted)}>
            {track.muted ? "Unmute" : "Mute"}
          </button>
  
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={track.volume}
            onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
          />
  
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={track.panning}
            onChange={(e) => updateTrackPanning(track.id, parseFloat(e.target.value))}
          />
  
          <button onClick={() => muteAllExceptThis(track.id)}>
            {isSolo ? "All" : "Solo"}
          </button>
  
          <TrashIcon onClick={() => deleteTrack(track.id)} />
        </div>
      </div>
  
      {/* Contenido desplazable, como las ondas de audio */}
      <div className="track-content">
        <canvas ref={canvasRef} height="100" />
      </div>
    </div>
  );
  
});

export default Track;