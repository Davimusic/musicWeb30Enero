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
import { handleDownloadMix } from "@/functions/music/handleDownloadMix";
import {
  updateTrackVolume,
  updateTrackMuted,
  updateTrackPanning,
  deleteTrack, 
  muteAllExceptThis,
} from "@/functions/music/DAW/trackHandlers";
import TimeRuler from "./timeRuler";
import { formatTime } from "@/functions/music/DAW2/timeHandlers";


const Track = dynamic(() => import("./track"), { ssr: false });









const AudioEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showContent, setShowContent] = useState(true);
  


  const [editorHeight, setEditorHeight] = useState("100vh");
  const controlsRef = useRef(null); 
  //const [audioDuration, setAudioDuration] = useState(0); // Duración total del audio

  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    const updateHeight = () => {
      if (controlsRef.current) {
        const controlsHeight = controlsRef.current.offsetHeight; // Detecta altura de .global-controls
        const windowHeight = window.innerHeight; // Altura de la ventana
        console.log(controlsHeight);
        console.log(windowHeight);

        setEditorHeight(`${windowHeight - controlsHeight }px`); // Ajusta altura dinámica
      }
    };

    updateHeight(); // Actualización inicial
    window.addEventListener("resize", updateHeight); // Detecta cambios en tamaño de ventana

    return () => window.removeEventListener("resize", updateHeight); // Limpia el event listener
  }, []);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const { audioContextRef } = useAudioContext();
  const { scrollContainerRef, tracksContainerRef } = useAutoScroll(
    tracks,
    isPlaying,
    currentTimeRef,
    PIXELS_PER_SECOND,
    setCurrentTime
  );

  const mediaRecorderRef = useRef(null);
  const trackControlsRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    console.log(tracks);
  }, [tracks]);

  

  // Manejador de acciones en las pistas
  const handleTrackAction = useCallback((action, trackId, value) => {
    const actions = {
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
    let animationFrameId; let lastUpdate = 0;  
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
  
  useEffect(() => {
    if (!isPlaying || !tracks.length) return;
  
    // Número total de tracks
    console.log(`Número total de tracks: ${tracks.length}`);
  
    let completedTracks = 0; // contador para saber cuántos tracks han finalizado
    const listeners = []; // Array para almacenar referencias a los listeners
  
    // Función que se llama cuando un track termina
    const handleTrackEnd = (track) => {
      completedTracks += 1;
      console.log(`El track "${track.name}" ha terminado (${completedTracks}/${tracks.length}).`);
  
      if (completedTracks === tracks.length && isPlaying) {
        setIsPlaying(false)
        console.log("Todos los tracks han terminado de reproducirse.");
      }
    };
  
    // Asignar el listener "ended" a cada sourceNode de cada track
    tracks.forEach(track => {
      if (track.sourceNode && typeof track.sourceNode.addEventListener === 'function') {
        // Creamos una función listener para poder removerla después
        const listener = () => handleTrackEnd(track);
        track.sourceNode.addEventListener("ended", listener);
        listeners.push({ track, listener });
      } else {
        console.warn("El track no tiene un sourceNode válido:", track);
      }
    });
  
    // Cleanup: removemos los listeners asignados
    return () => {
      listeners.forEach(({ track, listener }) => {
        if (track.sourceNode && typeof track.sourceNode.removeEventListener === 'function') {
          track.sourceNode.removeEventListener("ended", listener);
        }
      });
      console.log("Limpieza de eventos 'ended' completada.");
    };
  }, [isPlaying, tracks]);

  // Cargar un archivo de audio
  const handleLoadAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const newTrack = await createTrack(file, audioContextRef.current, tracks);
      setTracks((prev) => [...prev, newTrack]);

      const audioBuffer = await audioContextRef.current.decodeAudioData(
        await file.arrayBuffer()
      );
      //setAudioDuration(audioBuffer.duration);

      scrollContainerRef.current?.scrollTo({ left: 0 });
    } catch (error) {
      console.error("Error al cargar audio:", error);
    }
  };

  return (
    <div className="fullscreen-div">
      <div className="editor-container" style={{ height: `${editorHeight}` }}>
        {/* Contenedor de línea de tiempo (scroll horizontal y vertical) */}
        <div
          className="timeline-scroll-wrapper"
          ref={scrollContainerRef}
          id="scroll-container"
        >
          {/* Contenedor principal de la línea de tiempo */}
          <div
            className="timeline-content"
            style={{
              width: `${tracks.length > 0 ? tracks[0].duration * PIXELS_PER_SECOND : 0}px`,
              minHeight: "100%", // Asegura altura mínima para scroll vertical
            }}
          > 
            {/* Regla de tiempo (sticky horizontal) */}
            
              <TimeRuler pixelsPerSecond={PIXELS_PER_SECOND} tracks={tracks}/>
            
            {Array.isArray(tracks) ? (
                tracks.map((track) => (
                  <div key={track.id} className="track-container">
                    {/* Controles del track (sticky horizontal) */}
                    <div className="track-controls-sidebar">
                      <TrackControls
                        track={track}
                        showContent={showContent}
                        onAction={handleTrackAction}
                      />
                    </div>

                    {/* Waveform del track */}
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
                            setIsPlaying
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
      {/* Controles globales (barra inferior) */}
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






















