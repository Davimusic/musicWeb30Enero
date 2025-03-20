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


const Track = dynamic(() => import("./track"), { ssr: false });









const AudioEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showContent, setShowContent] = useState(true);
  //const [audioDuration, setAudioDuration] = useState(0); // Duración total del audio

  const currentTimeRef = useRef(currentTime);

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

  /*/ Función para obtener el tiempo actual del track
  const getTrackCurrentTime = (track, audioContextRef, startTimeRef) => {
    const ctx = audioContextRef.current;

    if (!track.sourceNode || !ctx) {
      return 0; // Si no hay sourceNode o AudioContext, el tiempo es 0
    }

    // Calcular el tiempo transcurrido desde que se inició la reproducción
    const elapsed = ctx.currentTime - startTimeRef.current;

    // Asegurarse de que el tiempo no exceda la duración del track
    return Math.min(elapsed, track.duration);
  };

  const getCurrentTime = (trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return 0;

    return getTrackCurrentTime(track, audioContextRef, startTimeRef);
  };*/

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
  useEffect(() => { const ctx = audioContextRef.current; const scrollContainer = scrollContainerRef.current; if (!scrollContainer || !ctx) return; scrollContainer.style.willChange = "scroll-position"; let animationFrameId; let lastUpdate = 0;  const updatePlayback = (timestamp) => { if (!isPlaying || !ctx) return;  if (timestamp - lastUpdate >= 50) { const elapsed = ctx.currentTime - startTimeRef.current; const scrollPosition = elapsed * PIXELS_PER_SECOND; scrollContainer.scrollLeft = scrollPosition; lastUpdate = timestamp;  } animationFrameId = requestAnimationFrame(updatePlayback); }; if (isPlaying) { startTimeRef.current = ctx.currentTime - currentTime; animationFrameId = requestAnimationFrame(updatePlayback); } return () => { if (animationFrameId) { cancelAnimationFrame(animationFrameId); } }; }, [isPlaying]);
  

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

  useEffect(() => {
     console.log(isPlaying);
     
    }, [isPlaying]);

  return (
    <div className="fullscreen-div ">
      <div className="editor-container">
        {/* Controles de las pistas */}
        <div className="track-controls-sidebar" ref={trackControlsRef}>
          {tracks.map((track) => (
            <TrackControls
              key={track.id}
              track={track}
              showContent={showContent}
              onAction={handleTrackAction}
            />
          ))}
        </div>

        {/* Contenedor de línea de tiempo */}
        <div
          className="timeline-container"
          ref={scrollContainerRef}
          id="scroll-container"
        >
          <div
            className="tracks-container"
            ref={tracksContainerRef}
            style={{ width: `${tracks.length > 0 ? tracks[0].duration * PIXELS_PER_SECOND : 0}px` }}
          >
            {tracks.map((track) => (
              <Track
                key={track.id}
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
                    setIsPlaying 
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Controles globales */}
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
  );
};

export default AudioEditor;























/*"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "../../estilos/music/audioEditor.css";
import "../../estilos/general/general.css";
import TogglePlayPause from "./TogglePlayPause";
import RecordIcon from "./recordIcon";
import StopIcon from "./stopIcon";
import Track from "./track";
import EditToggleIcon from "./EditToggleIcon ";
import RangeInput from "./rangeInput";
import DownloadIcon from "./downloadIcon";
import handleDownloadMix from "@/functions/music/handleDownloadMix";
import ResponsiveContent from "./responsiveContent";
import ToggleMute from "./ToggleMute";
import PanIcon from "./panIcon";
import ToggleSolo from "./toggleSolo";
import TrashIcon from "./trashIcon";
import {
  handlePlayPause,
  handleStop,
  handleRecord,
} from "@/functions/music/DAW/audioHandlers";
import {
  updateTrackVolume,
  updateTrackMuted,
  updateTrackPanning,
  deleteTrack,
  muteAllExceptThis,
} from "@/functions/music/DAW/trackHandlers";
import {
  formatTime,
  getPixelsPerSecond,
  handleTimeSelect,
} from "@/functions/music/DAW/timeHandlers";

const TimeRuler = dynamic(() => import("./timeRuler"), { ssr: false });

// Constante base para la relación 1:1
const PIXELS_PER_SECOND = 100; // 100px por segundo

const AudioEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showContent, setShowContent] = useState(true);

  const scrollContainerRef = useRef(null);
  const trackControlsRef = useRef(null);
  const tracksContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);

  // Inicialización del AudioContext
  useEffect(() => {
    const initAudioContext = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 48000 });
        // Esperar a la interacción del usuario para activar
        document.addEventListener(
          "click",
          async () => {
            await audioContextRef.current.resume();
          },
          { once: true }
        );
      }
    };
    initAudioContext();
  }, []);

  // Calcular el ancho del contenedor de tracks
  useEffect(() => {
    if (!tracksContainerRef.current) return;

    const maxDuration = Math.max(...tracks.map((t) => t.duration)) || 0;
    const totalWidth = maxDuration * PIXELS_PER_SECOND; // Ancho basado en la relación 1:1

    console.log("Ancho total del contenedor:", totalWidth, "px");
    tracksContainerRef.current.style.width = `${totalWidth}px`;
  }, [tracks]);

  // Bucle de animación para el scroll dinámico
  useEffect(() => {
    let animationFrame;
    const updateTime = () => {
      if (!isPlaying || !scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const firstTrack = tracks[0];
      if (!firstTrack?.audio) return;

      const currentTime = firstTrack.audio.currentTime;
      const duration = firstTrack.audio.duration;
      setCurrentTime(currentTime);

      if (autoScroll) {
        const maxScroll = container.scrollWidth - container.offsetWidth;
        const remainingTime = duration - currentTime;
        const containerTimeView = container.offsetWidth / PIXELS_PER_SECOND;

        let scrollPosition;
        if (remainingTime <= containerTimeView) {
          // Si queda menos tiempo que lo que cabe en el contenedor: scroll máximo
          scrollPosition = maxScroll;
        } else {
          // Posición normal: tiempo actual al borde izquierdo
          scrollPosition = currentTime * PIXELS_PER_SECOND;
        }

        

        container.scrollTo({
          left: Math.min(scrollPosition, maxScroll),
          behavior: "auto",
        });
      }

      animationFrame = requestAnimationFrame(updateTime);
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, tracks, autoScroll]);

  // Cargar audio desde el dispositivo
  const handleLoadAudio = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Asegurarse de que el AudioContext esté inicializado
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 48000 });
    }

    const url = URL.createObjectURL(file);
    const arrayBuffer = await file.arrayBuffer();

    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const audio = new Audio(url);
      audio.style.display = "none";
      document.body.appendChild(audio);

      const pannerNode = audioContextRef.current.createStereoPanner();
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(pannerNode).connect(audioContextRef.current.destination);

      setTracks((prev) => [
        ...prev,
        {
          id: Date.now(),
          url,
          audio,
          duration: audioBuffer.duration,
          audioBuffer,
          pannerNode,
          volume: 1,
          panning: 0,
          muted: false,
          name: `Track ${prev.length + 1}`,
        },
      ]);

      // Resetear el scroll al cargar nuevo audio
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = 0;
      }
    } catch (error) {
      console.error("Error al cargar el audio:", error);
    }
  };

  return (
    <div>
      <div className="editor-container">
        
        <div className="track-controls-sidebar" ref={trackControlsRef}>
          {tracks.map((track) => (
            <div key={track.id} className="track-controls">
              <ResponsiveContent showContent={showContent}>
                <div style={{ paddingBottom: "10px" }}>
                  <div>
                    <ToggleSolo
                      size={30}
                      isSolo={track.isSolo}
                      onToggle={() => muteAllExceptThis(track.id, setTracks)}
                    />
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => {
                        setTracks((prevTracks) =>
                          prevTracks.map((t) =>
                            t.id === track.id ? { ...t, name: e.target.value } : t
                          )
                        );
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "white",
                        fontSize: "14px",
                        outline: "none",
                        width: "100px",
                      }}
                    />
                    <TrashIcon onClick={() => deleteTrack(track.id, setTracks)} />
                  </div>
                  <RangeInput
                    value={track.volume * 100}
                    min={0}
                    max={100}
                    onChange={(val) => updateTrackVolume(track.id, val / 100, setTracks)}
                    children={
                      <ToggleMute
                        size={30}
                        isMuted={track.muted}
                        onToggle={() => updateTrackMuted(track.id, !track.muted, setTracks)}
                      />
                    }
                  />
                  <RangeInput
                    value={track.panning}
                    min={-50}
                    max={50}
                    onChange={(val) => updateTrackPanning(track.id, val, setTracks)}
                    children={
                      <PanIcon
                        panValue={track.panning}
                        onClick={(val) => updateTrackPanning(track.id, 0, setTracks)}
                      />
                    }
                  />
                </div>
              </ResponsiveContent>
            </div>
          ))}
        </div>

        
        <div className="timeline-container" ref={scrollContainerRef}>
          <div className="tracks-container" ref={tracksContainerRef}>
            {tracks.map((track) => (
              <Track
                key={track.id}
                track={track}
                pixelsPerSecond={PIXELS_PER_SECOND}
                onSelectTime={(selectedTime) =>
                  handleTimeSelect(
                    selectedTime,
                    tracks,
                    isPlaying,
                    scrollContainerRef,
                    setCurrentTime,
                    PIXELS_PER_SECOND
                  )
                }
              />
            ))}
          </div>
        </div>

        
        <div style={{ display: "none" }}>
          {tracks.map((track) => (
            <audio
              key={track.id}
              src={track.url}
              ref={(ref) => (track.audio = ref)}
            />
          ))}
        </div>
      </div>

      
      <div className="global-controls">
        <TogglePlayPause
          isPlaying={isPlaying}
          onToggle={() =>
            handlePlayPause(audioContextRef, tracks, currentTime, setIsPlaying)
          }
        />
        <StopIcon
          onClick={() =>
            handleStop(setIsPlaying, setCurrentTime, tracks, scrollContainerRef)
          }
        />
        <RecordIcon
          isRecording={isRecording}
          onClick={() =>
            handleRecord(
              isRecording,
              setIsRecording,
              mediaRecorderRef,
              audioContextRef,
              setTracks
            )
          }
        />
        <DownloadIcon onToggle={() => handleDownloadMix(tracks)} />
        <EditToggleIcon
          size={30}
          onToggle={() => setShowContent((prev) => !prev)}
        />
        <input
          type="file"
          accept="audio/*"
          onChange={handleLoadAudio}
          style={{ display: "none" }}
          id="audio-upload"
        />
        <label htmlFor="audio-upload" className="current-time-display">
          Cargar Audio
        </label>
        <div className="current-time-display">{formatTime(currentTime)}</div>
      </div>
    </div>
  );
};

export default AudioEditor;*/