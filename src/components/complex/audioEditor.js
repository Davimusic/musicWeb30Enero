"use client";

import { useState, useRef, useEffect } from 'react';
import '../../estilos/music/audioEditor.css';
import '../../estilos/general/general.css';
import TogglePlayPause from './TogglePlayPause';
import DownloadIcon from './downloadIcon';
import StopIcon from './stopIcon';
import RecordIcon from './recordIcon';
import ToggleMute from './ToggleMute';
import TrashIcon from './trashIcon';

const AudioEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const audioContextRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 segundo = 1 píxel
  const mediaRecorderRef = useRef(null);

  // Configuración inicial del AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Función para manejar play/pause
  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    if (isPlaying) {
      tracks.forEach((track) => track.audio.pause());
    } else {
      tracks.forEach((track) => {
        if (track.audio.readyState === 4) {
          track.audio.currentTime = currentTime;
          track.audio.play();
        }
      });
    }
  };

  // Función para manejar la grabación
  const handleRecord = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.volume = 1;

        audio.onloadedmetadata = () => {
          const duration = audio.duration;
          setTracks((prevTracks) => [
            ...prevTracks,
            {
              id: Date.now(),
              url,
              audio,
              duration,
              volume: 1,
              muted: false,
            },
          ]);

          // Generar el waveform para el audio grabado
          const canvas = document.createElement('canvas');
          canvas.width = duration * zoomLevel; // 1 segundo = 1 píxel
          canvas.height = 100;
          createWaveform(url, canvas);
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Función para manejar el stop
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    tracks.forEach((track) => {
      track.audio.pause();
      track.audio.currentTime = 0;
    });
  };

  // Función para cargar un archivo de audio
  const loadAudio = async (file) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.volume = 1;

    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      setTracks((prevTracks) => [
        ...prevTracks,
        {
          id: Date.now(),
          url,
          audio,
          duration,
          volume: 1,
          muted: false,
        },
      ]);
    };
  };

  // Función para eliminar un track
  const deleteTrack = (id) => {
    setTracks((prevTracks) => prevTracks.filter((track) => track.id !== id));
  };

  // Lógica principal de waveform con proporción correcta
  const createWaveform = async (url, canvas) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
  
    const data = audioBuffer.getChannelData(0);
    const duration = audioBuffer.duration; // Duración del audio en segundos
  
    // Definir el factor de proporción (1 segundo = X píxeles)
    const pixelsPerSecond = 500; // Puedes ajustar este valor según tus necesidades
    const width = duration * pixelsPerSecond; // Ancho proporcional a la duración
    const height = canvas.height;
  
    // Asignar el ancho al canvas
    canvas.width = width;
    const ctx = canvas.getContext('2d');
  
    // Reducir el muestreo para mejorar el rendimiento
    const sampleInterval = Math.ceil(data.length / width); // Muestrear según el ancho del canvas
    const samples = [];
    for (let i = 0; i < data.length; i += sampleInterval) {
      samples.push(data[i]);
    }
  
    // Normalización de datos
    const maxVal = Math.max(...samples.map(Math.abs));
    const scaleFactor = height / (2 * maxVal);
  
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
  
    for (let x = 0; x < width; x++) {
      const amp = Math.abs(samples[x]) * scaleFactor;
      ctx.lineTo(x, height / 2 - amp);
      ctx.lineTo(x, height / 2 + amp);
    }
  
    ctx.strokeStyle = 'red';
    ctx.stroke();
  };

  // Sistema de scroll y línea de tiempo maestra
  const Timeline = () => {
    const timelineRef = useRef(null);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
      if (!containerRef.current) return;

      const scrollContainer = containerRef.current;
      const updateScroll = () => {
        const progress = currentTime / duration;
        scrollContainer.scrollLeft = progress * (scrollContainer.scrollWidth - scrollContainer.clientWidth);
      };

      if (isPlaying) {
        const interval = setInterval(updateScroll, 100);
        return () => clearInterval(interval);
      }
    }, [isPlaying, currentTime, duration]);

    return (
      <div className="timeline-container">
        <div
          ref={timelineRef}
          className="main-progress-bar"
          style={{ width: `${duration * zoomLevel}px` }} // Ajustar al zoom
        >
          <div
            className="progress-indicator"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // Componente de pista individual
  const Track = ({ track, deleteTrack }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (canvasRef.current) {
        createWaveform(track.url, canvasRef.current);
      }
    }, [track.url, zoomLevel]);

    return (
      <div className="track">
        <div className="track-header">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={track.volume}
            onChange={(e) => updateVolume(track.id, e.target.value)}
          />
          <TrashIcon size={20} onClick={() => deleteTrack(track.id)} /> {/* Botón para borrar */}
        </div>
        <div className="waveform-container">
          <canvas
            ref={canvasRef}
            width={track.duration * zoomLevel} // 1 segundo = 1 píxel
            height="100"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="editor-container backgroundColor1">
      <Timeline />

      <div
        ref={containerRef}
        className="tracks-container"
        style={{
          width: '100vw',
          overflowX: 'auto',
          transform: `scaleX(${zoomLevel})`,
        }}
      >
        {tracks.map((track) => (
          <Track key={track.id} track={track} deleteTrack={deleteTrack} />
        ))}
      </div>

      <div className="controls backgroundColor2">
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