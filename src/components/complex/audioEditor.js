

"use client";

import { useState, useRef, useEffect } from "react";
import "../../estilos/music/audioEditor.css";
import "../../estilos/general/general.css";
import TogglePlayPause from "./TogglePlayPause";
import DownloadIcon from "./downloadIcon";
import StopIcon from "./stopIcon";
import RecordIcon from "./recordIcon";
import TrashIcon from "./trashIcon";

const AudioEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [tracksDuration, setTracksDuration] = useState([]);
  const containerRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // Función para crear el waveform (las ondas de sonido)
  const createWaveform = async (url, canvas, zoomLevel) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

    const data = audioBuffer.getChannelData(0);
    const duration = audioBuffer.duration;

    const pixelsPerSecond = 500 * zoomLevel;
    const width = duration * pixelsPerSecond;
    const height = canvas.height;
    if (canvas.width !== width) {
      canvas.width = width; // Ajusta el ancho del canvas al zoom y la duración
    }

    const ctx = canvas.getContext("2d");
    const sampleInterval = Math.ceil(data.length / width);
    const samples = [];
    for (let i = 0; i < data.length; i += sampleInterval) {
      samples.push(data[i]);
    }
    const maxVal = Math.max(...samples.map(Math.abs));
    const scaleFactor = height / (2 * maxVal);

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
      const amp = Math.abs(samples[x]) * scaleFactor;
      ctx.lineTo(x, height / 2 - amp);
      ctx.lineTo(x, height / 2 + amp);
    }
    ctx.strokeStyle = "#2196f3";
    ctx.stroke();
  };

  // Inicializar AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  useEffect(() => {
    console.log(currentTime);
  }, [currentTime]);

  useEffect(() => {
    const getDurations = async () => {
      const durations = await Promise.all(
        tracks.map(
          (track) =>
            new Promise((resolve) => {
              track.audio.onloadedmetadata = () => {
                resolve(track.audio.duration);
              };
            })
        )
      );
  
      console.log("Duraciones de los audios:", durations); // Imprime las duraciones en la consola
      setTracksDuration(durations); // Actualiza el estado con las duraciones
    };
  
    if (tracks.length > 0) {
      getDurations();
    }
  }, [tracks]);
  
  
  



  const updateTime = () => {
    console.log('slsl');
    let longestTrack=  getLongestTrack()
    
    // Usar el tiempo de la primera pista como referencia
    const current = tracks[0].audio.currentTime;
    setCurrentTime(current);

    console.log(current);
    console.log(longestTrack);
    

    // Si se alcanzó el final del track más largo, detener la reproducción
    if (current >= longestTrack) {
      console.log("Reproducción completada.");
      handleStop();
      return
    } else {
      // Llamar a la función de nuevo en el siguiente frame
      requestAnimationFrame(updateTime);
    }
  };
  useEffect(() => {
    if(isPlaying){
      setTimeout(() => {
        updateTime();
      }, 500); // 2000 milisegundos = 2 segundos
    }
  }, [isPlaying]);

  // Función para obtener el track más largo
  const getLongestTrack = () => {
    if (tracksDuration.length === 0) return 1;
    return Math.max(...tracksDuration);
  };

  // Función Play/Pause
  const handlePlayPause = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      if (newState) {
        const longestTrack = getLongestTrack();

        console.log("Reproduciendo...");
        console.log("Duración del track más largo:", longestTrack);

        // Reproducir todas las pistas
        tracks.forEach((track) => {
          if (track.audio.readyState === 4) {
            track.audio.currentTime = currentTime;
            track.audio.play();
          }
        });

        
      } else {
        // Pausar todas las pistas
        tracks.forEach((track) => track.audio.pause());
      }
      return newState;
    });
  };

  // Función para detener todo
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    tracks.forEach((track) => {
      track.audio.pause();
      track.audio.currentTime = 0;
    });
  };

  // Manejo de grabación
  const handleRecord = async () => {
    if (!isRecording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
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
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
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

  // Función para eliminar una pista
  const deleteTrack = (id) => {
    setTracks((prevTracks) => prevTracks.filter((track) => track.id !== id));
  };

  // Efecto para actualizar el scroll del contenedor
  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer || tracks.length === 0) return;

    const longestTrack = getLongestTrack();
    const pixelsPerSecond = 500 * zoomLevel;
    let animationFrameId;

    if (isPlaying) {
      const updateScroll = () => {
        const currentPosition = currentTime * pixelsPerSecond;
        const math = Math.min(
          currentPosition - scrollContainer.clientWidth * 0.2,
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        );

        scrollContainer.scrollLeft = math;

        if (currentTime >= longestTrack) {
          console.log("Reproducción completada, deteniendo desplazamiento.");
          handleStop();
          return;
        }

        animationFrameId = requestAnimationFrame(updateScroll);
      };

      updateScroll();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, currentTime, zoomLevel, tracks]);

  // Componente Timeline para mostrar el progreso
  const Timeline = () => {
    const maxDuration = tracks.length > 0 ? Math.max(...tracks.map((track) => track.duration)) : 0;
    const width = maxDuration * 500 * zoomLevel;

    return (
      <div className="timeline-container">
        <div className="main-progress-bar" style={{ width: `${width}px` }}>
          <div
            className="progress-indicator"
            style={{
              left: `${(currentTime / maxDuration) * width}px`,
              transition: "left 0.1s linear",
            }}
          />
        </div>
      </div>
    );
  };

  // Componente Track para representar una pista de audio
  const Track = ({ track, deleteTrack }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (canvasRef.current) {
        createWaveform(track.url, canvasRef.current, zoomLevel);
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
          <TrashIcon size={20} onClick={() => deleteTrack(track.id)} />
        </div>
        <div className="waveform-container">
          <canvas
            ref={canvasRef}
            width={track.duration * 500 * zoomLevel}
            height="100"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="editor-container backgroundColor1">
      <Timeline />
      <div ref={containerRef} className="tracks-container">
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