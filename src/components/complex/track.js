import React, { useRef, useEffect, memo, useState } from "react";
import TrashIcon from "./trashIcon";

const Track = memo(({ track, deleteTrack, zoomLevel, containerWidth, audioContextRef, muteAllExceptThis, updateTrackVolume, updateTrackPanning, isSolo }) => {
  const canvasRef = useRef(null);
  const [audioData, setAudioData] = useState(null);
  const [volume, setVolume] = useState(track.volume || 1); // Estado para el volumen
  const [isMuted, setIsMuted] = useState(track.muted || false); // Estado para mute
  const [panning, setPanning] = useState(track.panning || 0); // Estado para panning (-1: izquierda, 1: derecha)

  // Referencias para los nodos de audio
  const sourceNodeRef = useRef(null);
  const pannerNodeRef = useRef(null);
  const audioRef = useRef(new Audio(track.url)); // Nuevo elemento de audio

  // Calcular el ancho del track basado en la duración y el zoom
  const trackWidth = track.duration ? track.duration * 500 * zoomLevel : 0;

  // Efecto para inicializar el audio y los nodos
  useEffect(() => {
    const audioElement = audioRef.current;
    audioElement.volume = isMuted ? 0 : volume;

    // Crear nodos una sola vez
    if (audioContextRef.current && !sourceNodeRef.current) {
      sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioElement);
      pannerNodeRef.current = new StereoPannerNode(audioContextRef.current, { pan: panning });
      sourceNodeRef.current.connect(pannerNodeRef.current).connect(audioContextRef.current.destination);
    }

    return () => {
      // Limpiar al desmontar
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        pannerNodeRef.current.disconnect();
      }
    };
  }, []);

  // Efecto para actualizar el panning
  useEffect(() => {
    if (pannerNodeRef.current) {
      pannerNodeRef.current.pan.value = panning;
    }
  }, [panning]);

  // Efecto para actualizar volumen/mute
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Cargar el audio y configurar la onda
  useEffect(() => {
    const loadAudio = async () => {
      if (track.audioBuffer) {
        setAudioData(track.audioBuffer.getChannelData(0));
        return;
      }

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
  }, [track.url]);

  // Renderizar la onda de audio
  useEffect(() => {
    if (!canvasRef.current || !audioData) return;

    const canvas = canvasRef.current;
    canvas.width = trackWidth;
    canvas.style.width = `${trackWidth}px`;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const samplesPerPixel = audioData.length / trackWidth;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    for (let x = 0; x < trackWidth; x++) {
      const start = Math.floor(x * samplesPerPixel);
      const end = Math.floor((x + 1) * samplesPerPixel);
      let sum = 0;

      for (let i = start; i < end; i++) {
        if (audioData[i]) sum += Math.abs(audioData[i]);
      }

      const avg = sum / (end - start);
      const y = (avg * canvas.height) / 2;

      ctx.lineTo(x, canvas.height / 2 - y);
      ctx.lineTo(x, canvas.height / 2 + y);
    }

    ctx.strokeStyle = "#2196f3";
    ctx.stroke();
  }, [audioData, zoomLevel, trackWidth]);

  return (
    <div className="track" style={{ width: trackWidth, opacity: isSolo ? 1 : 0.5 }}>
      <canvas ref={canvasRef} height="100" />
      <div className="track-controls">
        {/* Botón de mute */}
        <button onClick={() => {
          setIsMuted(!isMuted);
          updateTrackVolume(track.id, isMuted ? volume : 0); // Actualizar el estado global
        }}>
          {isMuted ? "Unmute" : "Mute"}
        </button>

        {/* Control de volumen */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            const newVolume = parseFloat(e.target.value);
            setVolume(newVolume);
            updateTrackVolume(track.id, newVolume); // Actualizar el estado global
          }}
        />

        {/* Control de panning */}
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={panning}
          onChange={(e) => {
            const newPanning = parseFloat(e.target.value);
            setPanning(newPanning);
            updateTrackPanning(track.id, newPanning); // Actualizar el estado global
          }}
        />

        {/* Botón para mutear todos excepto este */}
        <button onClick={() => muteAllExceptThis(track.id)}>
          Solo este
        </button>

        {/* Botón para eliminar el track */}
        <TrashIcon onClick={() => deleteTrack(track.id)} />
      </div>
    </div>
  );
});

export default Track;