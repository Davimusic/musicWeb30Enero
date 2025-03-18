"use client";

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
import drawWaveform from "@/functions/music/drawWaveform";
import ResponsiveContent from "./responsiveContent";
import ToggleMute from "./ToggleMute";
import PanIcon from "./panIcon";
import ToggleSolo from "./toggleSolo";
import TrashIcon from "./trashIcon";

const TimeRuler = dynamic(() => import("./timeRuler"), { ssr: false });

const AudioEditor = () => {
  // Estados
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [showContent, setShowContent] = useState(true);

  const scrollContainerRef = useRef(null);
  const trackControlsRef = useRef(null);
  const tracksContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);

  // Sincronizar scroll vertical
  useEffect(() => {
    const trackControls = trackControlsRef.current;
    const tracksContainer = tracksContainerRef.current;

    const syncScroll = (source, target) => {
      if (source && target && source.scrollTop !== target.scrollTop) {
        target.scrollTop = source.scrollTop;
      }
    };

    const handleTrackControlsScroll = () => syncScroll(trackControls, tracksContainer);
    const handleTracksScroll = () => syncScroll(tracksContainer, trackControls);

    trackControls?.addEventListener("scroll", handleTrackControlsScroll);
    tracksContainer?.addEventListener("scroll", handleTracksScroll);

    return () => {
      trackControls?.removeEventListener("scroll", handleTrackControlsScroll);
      tracksContainer?.removeEventListener("scroll", handleTracksScroll);
    };
  }, []);

  // Actualizar dimensiones del contenedor
  useEffect(() => {
    const updateDimensions = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        setContainerWidth(container.offsetWidth);

        // Actualizar variable CSS con altura real de los controles
        const globalControls = container.querySelector('.global-controls');
        if (globalControls) {
          document.documentElement.style.setProperty(
            '--global-controls-height',
            `${globalControls.offsetHeight}px`
          );
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [tracks]);

  // Inicializar AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => audioContextRef.current?.close();
  }, []);

  // Efecto para el desplazamiento automático durante la reproducción
  useEffect(() => {
    if (isPlaying && autoScroll && tracks.length > 0 && scrollContainerRef.current) {
      const pixelsPerSecond = 500 * zoomLevel;
      const maxDurationTrack = tracks.reduce((prev, curr) =>
        curr.duration > prev.duration ? curr : prev
      );
      const duration = maxDurationTrack.duration;

      // Añadir un margen adicional al contenedor (2 segundos en este caso)
      const margin = 2; // Margen en segundos
      const containerWidth = (duration + margin) * pixelsPerSecond;

      // Ajustar el ancho del contenedor
      const tracksContainer = scrollContainerRef.current.querySelector(".tracks-container");
      if (tracksContainer) {
        tracksContainer.style.width = `${containerWidth}px`;
      }

      const intervalId = setInterval(() => {
        const currentTime = maxDurationTrack.audio?.currentTime || 0;

        // Verificar si el audio ha terminado naturalmente
        if (maxDurationTrack.audio?.ended || currentTime >= duration) {
          scrollContainerRef.current.scrollLeft = duration * pixelsPerSecond;
          setIsPlaying(false);
          setHasEnded(true);
          clearInterval(intervalId);
          return;
        }

        // Actualizar desplazamiento
        scrollContainerRef.current.scrollLeft = currentTime * pixelsPerSecond;
      }, 50);

      return () => clearInterval(intervalId);
    }
  }, [isPlaying, autoScroll, zoomLevel, tracks]);

  // Reproducir/pausar todos los audios
  const handlePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);

    tracks.forEach((track) => {
      if (!track.audio) return;
      newState ? track.audio.play() : track.audio.pause();
      track.audio.currentTime = currentTime;
    });
  };

  // Detener todos los audios
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    tracks.forEach((track) => {
      if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
      }
    });
    if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
  };

  // Eliminar track (detener audio y limpiar)
  const deleteTrack = (id) => {
    setTracks((prev) =>
      prev.filter((track) => {
        if (track.id === id) {
          track.audio?.pause();
          URL.revokeObjectURL(track.url);
        }
        return track.id !== id;
      })
    );
  };

  // Grabación de audio
  const handleRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        const audio = new Audio(url);
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
            name: `Track ${prev.length + 1}`, // Nombre por defecto
          },
        ]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error al grabar:", error);
    }
  };

  // Manejar la subida de un archivo de audio
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const audio = new Audio(url);

    audio.onloadedmetadata = async () => {
      const duration = audio.duration;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

        const pannerNode = audioContextRef.current.createStereoPanner();
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(pannerNode).connect(audioContextRef.current.destination);

        setTracks((prev) => [
          ...prev,
          {
            id: Date.now(),
            url,
            audio,
            duration,
            audioBuffer, // Asegúrate de que el audioBuffer esté asignado
            pannerNode,
            volume: 1,
            panning: 0,
            muted: false,
            name: `Track ${prev.length + 1}`, // Nombre por defecto
          },
        ]);
      } catch (error) {
        console.error("Error al decodificar el archivo de audio:", error);
      }
    };
  };

  // Cambiar zoom
  const handleZoomChange = (newValue) => {
    setZoomLevel(newValue);
  };

  return (
    <div className="editor-container">
      {/* Controles laterales */}
      <div className="track-controls-sidebar" ref={trackControlsRef}>
        {tracks.map((track) => (
          <div key={track.id} className="track-controls">
            <ResponsiveContent showContent={showContent}>
              <div style={{ paddingBottom: "10px" }}>
                <div style={{}}>
                  <ToggleSolo
                    size={30}
                    isSolo={track.isSolo}
                    onToggle={() => muteAllExceptThis(track.id)}
                  />
                  {/* Input editable para el nombre del track */}
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
                      width: "100px", // Ajusta el ancho según sea necesario
                    }}
                  />
                  <TrashIcon onClick={() => deleteTrack(track.id)} />
                </div>
                <RangeInput
                  value={track.volume * 100}
                  min={0}
                  max={100}
                  onChange={(val) => updateTrackVolume(track.id, val / 100)}
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
                  onChange={(val) => updateTrackPanning(track.id, val)}
                  children={
                    <PanIcon
                      panValue={track.panning}
                      onClick={(val) => updateTrackPanning(track.id, 0)}
                    />
                  }
                />
              </div>
            </ResponsiveContent>
          </div>
        ))}
      </div>

      {/* Línea de tiempo con scroll */}
      <div className="timeline-container" ref={scrollContainerRef}>
        <div className="tracks-container" ref={tracksContainerRef}>
          {tracks.map((track) => (
            <Track key={track.id} track={track} zoomLevel={zoomLevel} />
          ))}
        </div>
        <TimeRuler
          duration={Math.max(...tracks.map((t) => t.duration))}
          zoomLevel={zoomLevel}
        />
      </div>

      {/* Controles globales */}
      <div className="global-controls">
        <TogglePlayPause isPlaying={isPlaying} onToggle={handlePlayPause} />
        <StopIcon onClick={handleStop} />
        <RecordIcon isRecording={isRecording} onClick={handleRecord} />
        <RangeInput
          value={zoomLevel}
          min={0.1}
          max={3}
          step={0.1}
          onChange={handleZoomChange}
          label="Zoom"
        />
        <DownloadIcon onToggle={() => handleDownloadMix(tracks)} />
        <EditToggleIcon size={30} onToggle={() => setShowContent((prev) => !prev)} />
        {/* Botón para subir archivo de audio */}
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label style={{color: 'white'}} htmlFor="file-upload" className="upload-button">
          Subir Audio
        </label>
      </div>
    </div>
  );
};

export default AudioEditor;