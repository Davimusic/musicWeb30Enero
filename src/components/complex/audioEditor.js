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
  const [tracks, setTracks] = useState([]); // Tracks: { id, url, duration, volume, muted, panning, audio }
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const scrollContainerRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    if (isPlaying && autoScroll && tracks.length > 0 && scrollContainerRef.current) {
      const pixelsPerSecond = 500 * zoomLevel; // Velocidad del desplazamiento
      const tol = 0.1; // Tolerancia para el final de la pista
      const intervalId = setInterval(() => {
        const maxDurationTrack = tracks.reduce((prev, curr) =>
          curr.duration > prev.duration ? curr : prev
        );
        const currentTime = maxDurationTrack.audio?.currentTime || 0;
        const duration = maxDurationTrack.duration;
  
        if (currentTime >= duration - tol) {
          // Detener al final de la pista
          scrollContainerRef.current.scrollLeft = duration * pixelsPerSecond;
          setIsPlaying(false);
          setHasEnded(true);
          clearInterval(intervalId);
          return;
        }
  
        // Actualizar el desplazamiento del contenedor
        scrollContainerRef.current.scrollLeft = currentTime * pixelsPerSecond;
      }, 50); // Intervalo de 50 ms
      return () => clearInterval(intervalId);
    }
  }, [isPlaying, autoScroll, zoomLevel, tracks]);
  

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

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

  // Sincronizar propiedades `volume`, `muted` y `panning` con los objetos `Audio`
  useEffect(() => {
    tracks.forEach((track) => {
      if (track.audio) {
        track.audio.volume = track.muted ? 0 : track.volume; // Mute afecta el volumen
        if (track.pannerNode) {
          track.pannerNode.pan.value = track.panning; // Sincroniza el panning
        }
      }
    });
  }, [tracks]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      if (newState) {
        if (hasEnded) {
          tracks.forEach((track) => {
            if (track.audio) {
              track.audio.currentTime = 0; // Reinicia el audio
            }
          });
          if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
          setHasEnded(false);
        }
        setAutoScroll(true);
        tracks.forEach((track) => {
          if (track.audio) { // Verifica que track.audio existe
            track.audio.play().catch((error) => {
              console.error("Error al reproducir:", error);
            });
          }
        });
      } else {
        tracks.forEach((track) => {
          if (track.audio) {
            track.audio.pause();
          }
        });
      }
      return newState;
    });
  };

  const handleStop = () => {
    setIsPlaying(false);
    setHasEnded(false);
    tracks.forEach((track) => {
      if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
      }
    });
    if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
  };

  const deleteTrack = (id) => {
    setTracks((prevTracks) => prevTracks.filter((track) => track.id !== id));
  };

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

          const pannerNode = audioContextRef.current.createStereoPanner();
          const source = audioContextRef.current.createMediaElementSource(audio);
          source.connect(pannerNode).connect(audioContextRef.current.destination);

          await new Promise((resolve) => (audio.onloadedmetadata = resolve));
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
              panning: 0,
              pannerNode,
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

  const muteAllExceptThis = (trackId) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => ({
        ...track,
        muted: track.id !== trackId, // Silencia a todos menos el track seleccionado
      }))
    );
  };

  const updateTrackMuted = (trackId, muted) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, muted } : track
      )
    );
  };

  const updateTrackPanning = (trackId, panning) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, panning } : track
      )
    );
  };

  const updateTrackVolume = (trackId, volume) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === trackId ? { ...track, volume } : track
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
                updateTrackMuted={updateTrackMuted} // Pasa la función corregida
              />
            ))}
          </div>
          {tracks.length > 0 && (
            <div className="time-ruler-wrapper">
              <TimeRuler
                totalDuration={tracks.reduce((max, t) => Math.max(max, t.duration), 0)}
                zoomLevel={zoomLevel}
                currentTime={tracks[0]?.audio?.currentTime || 0}
              />
            </div>
          )}
        </div>
      </div>
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
          onChange={(e) => setZoomLevel(parseFloat(e.target.value))} // Cambia el zoomLevel
        />
      </div>
    </div>
  );
};

export default AudioEditor;
