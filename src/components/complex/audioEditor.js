"use client";

import { useState, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';

const AudioEditor = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        height: 100,
      });

      wavesurfer.load('path/to/your/audio/file.mp3');

      return () => {
        wavesurfer.destroy();
      };
    }
  }, [isClient]);

  if (!isClient) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Audio Editor</h1>
      <div id="waveform"></div>
    </div>
  );
};

export default AudioEditor;





/*"use client";


import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import '../../estilos/music/audioEditor.css';
import '../../estilos/general/general.css'
import TogglePlayPause from './TogglePlayPause';
import DownloadIcon from './downloadIcon';
import StopIcon from './stopIcon';
import RecordIcon from './recordIcon';
import ToggleMute from './ToggleMute';
import TrashIcon from './trashIcon';

// Componente TrackWaveform
const TrackWaveform = ({
  track,
  onDelete,
  onEditName,
  onToggleMute,
  onVolumeChange,
  wavesurferInstancesRef,
  currentTime,
  setDuration,
  maxDuration,
  setSelectedRegion,
  isPlaying,
  syncTime,
}) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [trackName, setTrackName] = useState(track.name);

  // Sincronizar el tiempo de reproducción cuando cambie syncTime
  useEffect(() => {
    if (
      wavesurferRef.current?.backend &&
      !wavesurferRef.current.isSeeking &&
      maxDuration > 0 &&
      syncTime <= maxDuration
    ) {
      const normalizedTime = syncTime / maxDuration;
      if (normalizedTime >= 0 && normalizedTime <= 1) {
        wavesurferRef.current.seekTo(normalizedTime);
      }
    }
  }, [syncTime, maxDuration]);

  // Inicializar WaveSurfer
  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorColor: 'navy',
        height: 100,
        responsive: true,
        minPxPerSec: 500,
        fillParent: false,
        plugins: [RegionsPlugin.create()],
      });

      wavesurferRef.current.load(track.url);

      wavesurferInstancesRef.current.push({ id: track.id, wavesurfer: wavesurferRef.current });

      wavesurferRef.current.on('ready', () => {
        const trackDuration = wavesurferRef.current.getDuration();
        setDuration((prevDuration) => Math.max(prevDuration, trackDuration));
      });

      wavesurferRef.current.on('region-created', (region) => {
        setSelectedRegion({ start: region.start, end: region.end });
      });

      wavesurferRef.current.on('finish', () => {
        console.log(`Track ${track.id} ha terminado de reproducirse.`);
      });

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferInstancesRef.current = wavesurferInstancesRef.current.filter(
            (ws) => ws.id !== track.id
          );
        }
      };
    }
  }, [track.url]);

  // Actualizar el volumen del track
  useEffect(() => {
    if (wavesurferRef.current && !track.muted) {
      wavesurferRef.current.setVolume(track.volume);
    }
  }, [track.volume, track.muted]);

  // Manejar cambios en el nombre del track
  const handleNameChange = (e) => {
    setTrackName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    onEditName(trackName);
  };

  return (
    <div style={{marginTop: '20px', padding: '10px', borderRadius: '0.7em'}} className="track-container backgroundColor2">
      {isEditingName ? (
        <input
          type="text"
          value={trackName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          autoFocus
        />
      ) : (
        <h3 onClick={() => setIsEditingName(true)}>{trackName}</h3>
      )}
      <div
        ref={waveformRef}
        className="waveform"
      ></div>
      <div className="track-controls">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={track.muted ? 0 : track.volume}
          onChange={(e) => onVolumeChange(track.id, parseFloat(e.target.value))}
          className="volume-slider"
        />
        
        <ToggleMute size={30} isMuted={track.muted} onToggle={onToggleMute} buttonColor={'red'}/>
        <TrashIcon size={30} onClick={onDelete}/>
        
      </div>
    </div>
  );
};

// Componente principal AudioEditor...
const AudioEditor = () => {
  const [tracks, setTracks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxDuration, setMaxDuration] = useState(0); // Duración máxima
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [syncTime, setSyncTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const wavesurferInstancesRef = useRef([]);
  const waveformContainerRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());

  // Extender un track con silencio
  const extendTrackWithSilence = async (trackUrl, targetDuration) => {
    const ffmpeg = ffmpegRef.current;

    // Convertir el archivo a un formato compatible con FFmpeg
    await ffmpeg.writeFile('input.webm', await fetchFile(trackUrl));

    // Calcular la duración actual del track
    const duration = await getTrackDuration(trackUrl);

    // Si el track es más corto que la duración objetivo, agregar silencio
    if (duration < targetDuration) {
      const silenceDuration = targetDuration - duration;

      await ffmpeg.exec([
        '-i', 'input.webm',
        '-af', `apad=pad_dur=${silenceDuration}`,
        'output.webm'
      ]);

      const data = await ffmpeg.readFile('output.webm');
      return URL.createObjectURL(new Blob([data], { type: 'audio/webm' }));
    }

    // Si el track ya tiene la duración correcta, devolverlo sin cambios
    return trackUrl;
  };

  // Obtener la duración de un track
  const getTrackDuration = async (trackUrl) => {
    const audio = new Audio(trackUrl);
    return new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });
    });
  };

  // Agregar un nuevo track
  const addTrack = async (trackUrl) => {
    const targetDuration = maxDuration; // Duración del track más largo
    const extendedUrl = await extendTrackWithSilence(trackUrl, targetDuration);

    const newTrack = {
      id: Date.now(),
      url: extendedUrl,
      name: `Track ${tracks.length + 1}`,
      volume: 1,
      muted: false,
    };

    setTracks([...tracks, newTrack]);
  };

  // Actualizar syncTime cuando cambie currentTime
  useEffect(() => {
    setSyncTime(currentTime);
  }, [currentTime]);

  // Configurar FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => console.log(message));
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    };
    loadFFmpeg();
  }, []);

  // Limpiar recursos al desmontar el componente
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      wavesurferInstancesRef.current.forEach((ws) => {
        if (ws.wavesurfer) {
          ws.wavesurfer.destroy();
        }
      });
    };
  }, []);

  // Sincronizar el scroll de todos los tracks
  useEffect(() => {
    const handleScroll = () => {
      const scrollLeft = waveformContainerRef.current.scrollLeft;
      wavesurferInstancesRef.current.forEach((ws) => {
        if (ws.wavesurfer) {
          ws.wavesurfer.container.scrollLeft = scrollLeft;
        }
      });
    };

    if (waveformContainerRef.current) {
      waveformContainerRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (waveformContainerRef.current) {
        waveformContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Calcular la duración máxima
  useEffect(() => {
    let max = 0;
    wavesurferInstancesRef.current.forEach((ws) => {
      if (ws.wavesurfer && ws.wavesurfer.getDuration() > max) {
        max = ws.wavesurfer.getDuration();
      }
    });
    setMaxDuration(max);
  }, [tracks]);

  // Actualizar el tiempo global usando requestAnimationFrame
  useEffect(() => {
    let animationFrameId;
    let lastTime = 0;

    const updateCurrentTime = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000; // Tiempo en segundos

      if (isPlaying) {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + delta;
          if (newTime >= maxDuration) {
            stopAllTracks();
            return 0;
          }
          return newTime;
        });
        lastTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(updateCurrentTime);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateCurrentTime);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, maxDuration]);

  // Sincronizar regiones en todos los tracks
  useEffect(() => {
    wavesurferInstancesRef.current.forEach((ws) => {
      if (ws.wavesurfer && selectedRegion) {
        ws.wavesurfer.clearRegions();
        ws.wavesurfer.addRegion({
          start: selectedRegion.start,
          end: selectedRegion.end,
          color: 'rgba(0, 255, 0, 0.1)',
        });
      }
    });
  }, [selectedRegion]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        addTrack(url); // Agregar el track extendido con silencio
        audioChunksRef.current = [];

        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteTrack = (id) => {
    setTracks((prevTracks) => {
      const newTracks = prevTracks.filter((track) => track.id !== id);

      // Recalcular la duración más larga
      let max = 0;
      wavesurferInstancesRef.current.forEach((ws) => {
        if (ws.wavesurfer && ws.wavesurfer.getDuration() > max) {
          max = ws.wavesurfer.getDuration();
        }
      });
      setMaxDuration(max);

      return newTracks;
    });

    // Eliminar la instancia de WaveSurfer
    const instance = wavesurferInstancesRef.current.find((ws) => ws.id === id);
    if (instance) {
      instance.wavesurfer.destroy();
      wavesurferInstancesRef.current = wavesurferInstancesRef.current.filter((ws) => ws.id !== id);
    }
  };

  const playAllTracks = () => {
    if (!isPlaying && maxDuration > 0) { // Validar maxDuration
      // Verificar que todas las instancias estén listas
      const allReady = wavesurferInstancesRef.current.every(
        (ws) => ws.wavesurfer && ws.wavesurfer.isReady
      );

      if (allReady) {
        // Sincronizar tiempo en todos los tracks antes de reproducir
        const normalizedTime = selectedRegion
          ? selectedRegion.start / maxDuration
          : currentTime / maxDuration;
        seekAllTracks(normalizedTime);

        // Iniciar reproducción
        wavesurferInstancesRef.current.forEach((ws) => {
          if (ws.wavesurfer) {
            ws.wavesurfer.play();
          }
        });
        setIsPlaying(true);
      } else {
        console.warn('Algunos tracks no están listos para reproducirse.');
      }
    }
  };

  const pauseAllTracks = () => {
    if (isPlaying) {
      wavesurferInstancesRef.current.forEach((ws) => {
        if (ws.wavesurfer) {
          ws.wavesurfer.pause();
        }
      });
      setIsPlaying(false);
    }
  };

  const seekAllTracks = (normalizedTime) => {
    // Validar que normalizedTime sea un número entre 0 y 1
    if (typeof normalizedTime !== 'number' || normalizedTime < 0 || normalizedTime > 1 || maxDuration <= 0) {
      return;
    }

    const targetTime = normalizedTime * maxDuration;

    // Evitar actualizaciones redundantes
    if (Math.abs(currentTime - targetTime) < 0.01) return;

    // Actualizar el tiempo global
    setCurrentTime(targetTime);

    // Sincronizar todos los tracks
    wavesurferInstancesRef.current.forEach((ws) => {
      if (ws.wavesurfer && !ws.wavesurfer.isSeeking) {
        ws.wavesurfer.isSeeking = true; // Marcar que estamos ajustando el tiempo
        ws.wavesurfer.seekTo(normalizedTime);
        ws.wavesurfer.isSeeking = false; // Restablecer la bandera
      }
    });
  };

  const stopAllTracks = () => {
    wavesurferInstancesRef.current.forEach((ws) => {
      if (ws.wavesurfer) {
        ws.wavesurfer.stop(); // Detener y reiniciar el track
      }
    });
    setIsPlaying(false);
    setCurrentTime(0); // Reiniciar el tiempo a 0
  };

  const editTrackName = (id, newName) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === id ? { ...track, name: newName } : track
      )
    );
  };

  const toggleMute = (id) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === id ? { ...track, muted: !track.muted } : track
      )
    );
  };

  const setTrackVolume = (id, volume) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.id === id ? { ...track, volume } : track
      )
    );
  };

  const exportMix = async () => {
    const ffmpeg = ffmpegRef.current;
    const activeTracks = tracks.filter(t => !t.muted);

    // Procesar cada pista
    for (const [index, track] of activeTracks.entries()) {
      const response = await fetch(track.url);
      const audioData = await response.arrayBuffer();
      await ffmpeg.writeFile(`input${index}.webm`, new Uint8Array(audioData));

      // Comandos FFmpeg para ajustar volumen y recortar región
      let filter = `volume=${track.volume}`;
      if (selectedRegion) {
        filter += `, atrim=start=${selectedRegion.start}:end=${selectedRegion.end}`;
      }

      await ffmpeg.exec([
        '-i', `input${index}.webm`,
        '-af', filter,
        `output${index}.wav`
      ]);
    }

    // Mezclar todas las pistas
    await ffmpeg.exec([
      ...activeTracks.flatMap((_, i) => ['-i', `output${i}.wav`]),
      '-filter_complex', `amix=inputs=${activeTracks.length}:duration=longest`,
      'final.wav'
    ]);

    // Descargar el resultado
    const data = await ffmpeg.readFile('final.wav');
    const url = URL.createObjectURL(new Blob([data], { type: 'audio/wav' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mezcla-final.wav';
    a.click();
  };

  return (
    <div className="audio-editor backgroundColor1">
      <h1 className="editor-title">Editor de Audio Multitrack</h1>
      <div
        ref={waveformContainerRef}
        className="waveform-container"
      >
        {tracks.map((track) => (
          <TrackWaveform
            key={track.id}
            track={track}
            onDelete={() => deleteTrack(track.id)}
            onEditName={(newName) => editTrackName(track.id, newName)}
            onToggleMute={() => toggleMute(track.id)}
            onVolumeChange={(volume) => setTrackVolume(track.id, volume)}
            wavesurferInstancesRef={wavesurferInstancesRef}
            currentTime={currentTime}
            setDuration={setDuration}
            maxDuration={maxDuration}
            setSelectedRegion={setSelectedRegion}
            isPlaying={isPlaying}
            syncTime={syncTime}
          />
        ))}
      </div>
      <div className="controls backgroundColor1">
        
        <RecordIcon size={30} onClick={isRecording ? stopRecording : startRecording} isRecording={isRecording}/>
        
        <TogglePlayPause size={30} isPlaying={isPlaying} onToggle={isPlaying ? pauseAllTracks : playAllTracks}/>
        
        <StopIcon size={30} onClick={stopAllTracks}/>
        
        <DownloadIcon size={30} isOpen={true} onToggle={exportMix}/>
      </div>
      <div className="time-controls">
        <input
          type="range"
          min="0"
          max={maxDuration}
          step="0.1"
          value={currentTime}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value);
            setCurrentTime(newTime);
            if (maxDuration > 0) { // Validar maxDuration
              seekAllTracks(newTime / maxDuration);
            }
          }}
          className="time-slider"
        />
        <p>
          Tiempo Actual: {currentTime.toFixed(2)}s / Duración Total: {maxDuration.toFixed(2)}s
        </p>
        {selectedRegion && (
          <p>
            Región Seleccionada: {selectedRegion.start.toFixed(2)}s - {selectedRegion.end.toFixed(2)}s
          </p>
        )}
      </div>
    </div>
  );
};

export default AudioEditor;*/