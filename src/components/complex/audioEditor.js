"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import "../../estilos/music/audioEditor.css";
import "../../estilos/general/general.css";
import { TrackControls, GlobalControls } from "../../functions/music/DAW2/controls";
import { useAudioContext, useAutoScroll } from "../../functions/music/DAW2/audioHooks";
import { createTrack, PIXELS_PER_SECOND } from "../../functions/music/DAW2/audioUtils";
import {
  handlePlayPause,
  handleStop,
  handleRecord,
  handleTimeSelect,
} from "@/functions/music/DAW2/audioHandlers";
import {
  updateTrackVolume,
  updateTrackMuted,
  updateTrackPanning,
  deleteTrack, 
  muteAllExceptThis,
} from "@/functions/music/DAW/trackHandlers";
import TimeRuler from "./timeRuler";
import handleDownloadMix from "@/functions/music/handleDownloadMix";


const Track = dynamic(() => import("./track"), { ssr: false });







const AudioEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showContent, setShowContent] = useState(true);
  const [editorHeight, setEditorHeight] = useState("100vh");
  const [sidebarWidth, setSidebarWidth] = useState(220); // Nuevo estado para el ancho del sidebar

  const controlsRef = useRef(null);
  const sidebarRef = useRef(null);
  const currentTimeRef = useRef(currentTime);
  const mediaRecorderRef = useRef(null);
  const trackControlsRef = useRef(null);
  const startTimeRef = useRef(0);

  const { audioContextRef } = useAudioContext();
  const { scrollContainerRef, tracksContainerRef } = useAutoScroll(
    tracks,
    isPlaying,
    currentTimeRef,
    PIXELS_PER_SECOND,
    setCurrentTime
  );

  // Observar cambios en el ancho del sidebar
  useEffect(() => {
    if (!sidebarRef.current) return;
  
    const resizeObserver = new ResizeObserver((entries) => {
      const newWidth = entries[0].contentRect.width;
      setSidebarWidth(newWidth); // Actualiza el estado con el nuevo ancho
    });
  
    resizeObserver.observe(sidebarRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Usa el estado sidebarWidth para ver el valor actualizado
  useEffect(() => {
    console.log("Ancho del sidebar:", sidebarWidth);
  }, [sidebarWidth]); // Este efecto se ejecutará cada vez que sidebarWidth cambie

  // Ajustar la altura del editor
  useEffect(() => {
    const updateHeight = () => {
      if (controlsRef.current) {
        const controlsHeight = controlsRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        setEditorHeight(`${windowHeight - controlsHeight}px`);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Actualizar currentTimeRef
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Manejador de acciones en las pistas
  const handleTrackAction = useCallback((action, trackId, value) => {
    const actions = {
      setStartTime: (id, startTime) => {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, startTime: parseFloat(startTime) } : t
          )
        );
      },
      volume: (id, val) => updateTrackVolume(id, val / 100, setTracks),
      pan: (id, val) => updateTrackPanning(id, val, setTracks),
      delete: (id) => deleteTrack(id, setTracks),
      solo: (id) => muteAllExceptThis(id, setTracks),
      mute: (id, muted) => updateTrackMuted(id, muted, setTracks),
      rename: (id, name) =>
        setTracks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, name } : t))
        ),
    };

    actions[action]?.(trackId, value);
  }, []);

  // Actualización del scroll mediante setInterval
  useEffect(() => {
    const ctx = audioContextRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !ctx) return;
    scrollContainer.style.willChange = "scroll-position";
    let animationFrameId;
    let lastUpdate = 0;

    const updatePlayback = (timestamp) => {
      if (!isPlaying || !ctx) return;
      if (timestamp - lastUpdate >= 75) {
        const elapsed = ctx.currentTime - startTimeRef.current;
        const scrollPosition = elapsed * PIXELS_PER_SECOND;
        scrollContainer.scrollLeft = scrollPosition;
        lastUpdate = timestamp;
      }
      animationFrameId = requestAnimationFrame(updatePlayback);
    };

    if (isPlaying) {
      startTimeRef.current = ctx.currentTime - currentTime;
      animationFrameId = requestAnimationFrame(updatePlayback);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying]);

  // Manejar el final de la reproducción de los tracks
  useEffect(() => {
    if (!isPlaying || !tracks.length) return;

    let completedTracks = 0;
    const listeners = [];

    const handleTrackEnd = (track) => {
      completedTracks += 1;
      if (completedTracks === tracks.length && isPlaying) {
        setIsPlaying(false);
      }
    };

    tracks.forEach((track) => {
      if (track.sourceNode && typeof track.sourceNode.addEventListener === "function") {
        const listener = () => handleTrackEnd(track);
        track.sourceNode.addEventListener("ended", listener);
        listeners.push({ track, listener });
      }
    });

    return () => {
      listeners.forEach(({ track, listener }) => {
        if (track.sourceNode && typeof track.sourceNode.removeEventListener === "function") {
          track.sourceNode.removeEventListener("ended", listener);
        }
      });
    };
  }, [isPlaying, tracks]);

  // Cargar un archivo de audio
  const handleLoadAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const newTrack = await createTrack(file, audioContextRef.current, tracks);
      setTracks((prev) => [...prev, newTrack]);

      await audioContextRef.current.decodeAudioData(await file.arrayBuffer());
      scrollContainerRef.current?.scrollTo({ left: 0 });
    } catch (error) {
      console.error("Error al cargar audio:", error);
    }
  };

  return (
    <div className="fullscreen-div">
      <div className="editor-container" style={{ height: `${editorHeight}` }}>
        <div
          className="timeline-scroll-wrapper"
          ref={scrollContainerRef}
          id="scroll-container"
        >
          <div
            className="timeline-content"
            style={{
              width: `${tracks.length > 0 ? tracks[0].duration * PIXELS_PER_SECOND : 0}px`,
              minHeight: "100%",
            }}
          >
            <TimeRuler
              pixelsPerSecond={PIXELS_PER_SECOND}
              tracks={tracks}
              sidebarWidth={sidebarWidth} // Pasamos el ancho del sidebar
            />

            {Array.isArray(tracks) ? (
              tracks.map((track, index) => (
                <div key={track.id} className="track-container">
                  <div
                    className="track-controls-sidebar"
                    ref={index === 0 ? sidebarRef : null} // Ref solo en el primer track
                  >
                    <TrackControls
                      track={track}
                      showContent={showContent}
                      onAction={handleTrackAction}
                    />
                  </div>

                  <div className="track-waveform">
                    <Track
                      track={track}
                      pixelsPerSecond={PIXELS_PER_SECOND}
                      onSelectTime={(selectedTime) =>
                        handleTimeSelect(
                          selectedTime,
                          tracks,
                          isPlaying,
                          audioContextRef,
                          scrollContainerRef,
                          setCurrentTime,
                          PIXELS_PER_SECOND,
                          setTracks,
                          setIsPlaying, 
                        )
                      }
                    />
                  </div>
                </div>
              ))
            ) : (
              <p>No hay tracks disponibles</p>
            )}
          </div>
        </div>
      </div>

      <div ref={controlsRef}>
        <GlobalControls
          isPlaying={isPlaying}
          isRecording={isRecording}
          currentTime={currentTime}
          onPlayPause={() =>
            handlePlayPause(
              audioContextRef,
              tracks,
              currentTime,
              setIsPlaying,
              isPlaying,
              startTimeRef
            )
          }
          onStop={() =>
            handleStop(setIsPlaying, setCurrentTime, tracks, scrollContainerRef)
          }
          onRecord={() =>
            handleRecord(
              isRecording,
              setIsRecording,
              mediaRecorderRef,
              audioContextRef,
              setTracks
            )
          }
          onDownload={() => handleDownloadMix(tracks)}
          onToggleUI={() => setShowContent((prev) => !prev)}
          onLoadAudio={handleLoadAudio}
        />
      </div>
    </div>
  );
};

export default AudioEditor;






















