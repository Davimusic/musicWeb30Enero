"use client";

import { useState, useRef, useEffect } from "react";
import "../../estilos/music/audioEditor.css";
import "../../estilos/general/general.css";
import TogglePlayPause from "./TogglePlayPause";
import RecordIcon from "./recordIcon";
import StopIcon from "./stopIcon";
import Track from "./track";
import TimeRuler from "./timeRuler";

const AudioEditor = () => {
  const [tracks, setTracks] = useState([]); // Cada track: { id, url, audio, duration, audioBuffer, … }
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [soloTrackId, setSoloTrackId] = useState(null); // Track seleccionado para "solo"

  const scrollContainerRef = useRef(null); // Ref para el contenedor scrollable
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Inicializar el AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Calcular el ancho del contenedor y manejar el resize
  useEffect(() => {
    if (scrollContainerRef.current) {
      setContainerWidth(scrollContainerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcular la duración máxima de todos los tracks
  const maxDuration =
    tracks.length > 0
      ? tracks.reduce((acc, t) => (t.duration > acc ? t.duration : acc), 0)
      : 0;

  // Sincronizar el scroll con la reproducción
  useEffect(() => {
    if (isPlaying && autoScroll && tracks.length > 0 && scrollContainerRef.current) {
      const pixelsPerSecond = 500 * zoomLevel;
      const tol = 0.1; // Tolerancia en segundos
      const intervalId = setInterval(() => {
        const maxDurationTrack = tracks.reduce((prev, curr) =>
          curr.duration > prev.duration ? curr : prev
        );
        const currentTime = maxDurationTrack.audio.currentTime;
        const duration = maxDurationTrack.duration;

        if (currentTime >= duration - tol) {
          scrollContainerRef.current.scrollLeft = duration * pixelsPerSecond;
          tracks.forEach((track) => track.audio.pause());
          setHasEnded(true);
          clearInterval(intervalId);
          return;
        }

        // Desplazar el contenedor
        scrollContainerRef.current.scrollLeft = currentTime * pixelsPerSecond;
      }, 50);
      return () => clearInterval(intervalId);
    }
  }, [isPlaying, autoScroll, zoomLevel, tracks]);

  // Manejar play/pause
  const handlePlayPause = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      if (newState) {
        if (hasEnded) {
          tracks.forEach((track) => {
            track.audio.currentTime = 0;
          });
          if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
          setHasEnded(false);
        }
        setAutoScroll(true);
        tracks.forEach((track) => {
          track.audio.play();
        });
      } else {
        tracks.forEach((track) => track.audio.pause());
      }
      return newState;
    });
  };

  // Manejar stop
  const handleStop = () => {
    setIsPlaying(false);
    setHasEnded(false);
    tracks.forEach((track) => {
      track.audio.pause();
      track.audio.currentTime = 0;
    });
    if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
  };

  // Eliminar un track
  const deleteTrack = (id) => {
    setTracks((prevTracks) => prevTracks.filter((track) => track.id !== id));
  };

  // Manejar la grabación
  const handleRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/wav" });
          const url = URL.createObjectURL(blob);
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const duration = audioBuffer.duration;
          const audio = new Audio(url);
          await new Promise((resolve) => {
            audio.onloadedmetadata = resolve;
          });
          setTracks((prev) => [
            ...prev,
            {
              id: Date.now(),
              url,
              audio,
              duration,
              audioBuffer,
              volume: 1,
              muted: false,
              panning: 0, // Panning inicial
            },
          ]);
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error al grabar:", error);
        alert("Revisa los permisos del micrófono.");
      }
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Función para mutear todos los tracks excepto el seleccionado
  const muteAllExceptThis = (trackId) => {
    setSoloTrackId(trackId); // Establecer el track seleccionado
    setTracks((prevTracks) =>
      prevTracks.map((track) => ({
        ...track,
        muted: track.id !== trackId, // Mutea todos excepto el track seleccionado
      }))
    );
  };

  // Función para actualizar el volumen de un track
  const updateTrackVolume = (trackId, volume) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, volume } : track
      )
    );
  };

  // Función para actualizar el panning de un track
  const updateTrackPanning = (trackId, panning) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, panning } : track
      )
    );
  };

  return (
    <div className="editor-container">
      <div
        ref={scrollContainerRef}
        className="scroll-container"
        onMouseDown={() => setAutoScroll(false)}
        onTouchStart={() => setAutoScroll(false)}
      >
        <div className="tracks-and-ruler">
          {/* Tracks */}
          <div className="tracks-container">
            {tracks.map((track) => (
              <Track
                key={track.id}
                track={track}
                deleteTrack={deleteTrack}
                zoomLevel={zoomLevel}
                containerWidth={containerWidth}
                audioContextRef={audioContextRef}
                muteAllExceptThis={muteAllExceptThis}
                updateTrackVolume={updateTrackVolume}
                updateTrackPanning={updateTrackPanning}
                isSolo={soloTrackId === track.id} // Pasar si este track está seleccionado
              />
            ))}
          </div>

          {/* Regla de tiempo */}
          {tracks.length > 0 && (
            <div className="time-ruler-wrapper">
              <TimeRuler
                totalDuration={maxDuration}
                zoomLevel={zoomLevel}
                currentTime={tracks[0]?.audio?.currentTime || 0}
              />
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="controls">
        <RecordIcon size={30} onClick={handleRecord} isRecording={isRecording} />
        <TogglePlayPause size={30} isPlaying={isPlaying} onToggle={handlePlayPause} />
        <StopIcon size={30} onClick={handleStop} />
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default AudioEditor;