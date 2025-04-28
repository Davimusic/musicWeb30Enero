"use client";
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import useAudioEngine from "@/functions/music/DAW3/useAudioEngine";
//import useTrackManager from "@/functions/music/DAW3/useTrackManager";
//import { useAudioControls } from "@/functions/music/DAW3/useAudioControls";
import { TrackControls } from "@/functions/music/DAW2/controls";
//import { PIXELS_PER_SECOND, setPixelsPerSecond } from "@/functions/music/DAW2/audioUtils";
import TimeRuler from "./timeRuler";
import { GlobalControls } from "@/functions/music/DAW2/controls";
//import { createTrack } from "@/functions/music/DAW2/audioUtils";
import { handleRecord, handleTimeSelect } from "@/functions/music/DAW2/audioHandlers";
import { createNewTrack } from "@/functions/music/DAW3/createTack";
import EditableTrackName from "@/functions/music/DAW3/editableTrackName";
'../../estilos/music/audioEditor.css'
'../../../src/estilos/general/general.css'
import SingleColorPickerModalContent from "./singleColorPickerModalContent";
import Modal from "./modal";
import handleTrackAction from "@/functions/music/DAW3/handleTrackAction";
import Knob from "./knob";
import { createFilterNode } from "@/functions/music/DAW2/audioHandlers";
import ColorPickerModalContent from "./colorPicker";
import ControlsIcon from "./controlsIcon";
import Menu from "./menu";
import MainLogo from "./mainLogo";
import { useRouter } from 'next/router';
import handleDownloadMix from "@/functions/music/handleDownloadMix";
import RangeInput from "./rangeInput";
import AudioLevelMeter from "@/functions/music/DAW3/audioLevelMeter";
import SubdivisionGrid from "@/functions/music/components/subdivisionGrid";
import TrackControlsModal from "@/functions/music/components/trackControlsModel";

import { PercussionSequencer } from "@/functions/music/components/subdivisionGrid";
import UploadAudiosFromDAW from "@/functions/music/components/uploadAudiosFromUsers";
import { WAVEFORM_STYLES } from "@/functions/music/drawWaveform";







const Track = dynamic(() => import("./track"), { ssr: false });

const scrollToCurrentTime = (currentTime, scrollContainerRef, PIXELS_PER_SECOND) => {
  if (scrollContainerRef.current) {
    const scrollPosition = currentTime * PIXELS_PER_SECOND;
    scrollContainerRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  }
};

const AudioEditor = () => {
  const {
    audioContextRef,
    isPlaying,
    currentTime,
    setIsPlaying,
    setCurrentTime,
    tracks,
    setTracks,
    isPlayingRef,
    filterNodesRef,
    currentTimeRef,
    mediaRecorderRef,
    tracksRef,
    audioNodesRef,
    sequencerBuffers,
    scheduledEvents,
    schedulerRef,
    preloadSequencerSamples,
    scheduleDrumMachine,
    startTransport
  } = useAudioEngine();
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [PIXELS_PER_SECOND, set_PIXELS_PER_SECOND] = useState(40);
  const [pixelsHeight, setPixelsHeight] = useState(100);
  const [subdivisionSettings, setSubdivisionSettings] = useState({
    pulsesPerSecond: 60,
    subdivisions: 3,
    timeSignatureTop: 4,    // Numerador del compás (ej. 4 en 4/4)
    timeSignatureBottom: 4, // Denominador del compás (ej. 4 en 4/4)
    enabled: false
  });
  const [waveFormStyle, setWaveFormStyle] = useState('DEFAULT');

  const scrollContainerRef = useRef(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    trackId: null,
    content: null
  });

  useEffect(() => {
    const gestureStart = { x: 0, y: 0 };
    const isGestureDetected = { horizontal: false, vertical: false };

    const handleMouseDown = (e) => {
        if (e.button === 0) {
            gestureStart.x = e.clientX;
            gestureStart.y = e.clientY;
            isGestureDetected.horizontal = false;
            isGestureDetected.vertical = false;
        }
    };

    const handleMouseMove = (e) => {
        if (gestureStart.x !== 0 || gestureStart.y !== 0) {
            const deltaX = e.clientX - gestureStart.x;
            const deltaY = e.clientY - gestureStart.y;

            if (Math.abs(deltaX) > 30) {
                isGestureDetected.horizontal = true;
                console.log("Movimiento horizontal detectado");
            }

            if (Math.abs(deltaY) > 30) {
                isGestureDetected.vertical = true;
                console.log("Movimiento vertical detectado");
            }
        }
    };

    const handleMouseUp = () => {
        gestureStart.x = 0;
        gestureStart.y = 0;
        isGestureDetected.horizontal = false;
        isGestureDetected.vertical = false;
    };

    const handlePopState = (e) => {
        if (isGestureDetected.horizontal || isGestureDetected.vertical) {
            e.preventDefault();
            window.history.pushState(null, '', window.location.pathname);
            console.log("Intento de cambiar de ruta bloqueado");
        }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, '', window.location.pathname);

    return () => {
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("popstate", handlePopState);
    };
}, []);




useEffect(() => {
  if (subdivisionSettings.enabled) {
    console.log("Subdivision settings applied:", subdivisionSettings);
    // You might need additional logic here if other components need to react to subdivision changes
  }
}, [subdivisionSettings]);








useEffect(() => {
  console.log(waveFormStyle);
}, [waveFormStyle]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body {
        overscroll-behavior-x: none !important;
        touch-action: pan-y !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    console.log(tracks);
  }, [tracks]);

  useEffect(() => {
    console.log(PIXELS_PER_SECOND);
  }, [PIXELS_PER_SECOND]);

  useEffect(() => {
    if (loadingTrackId && tracks.some(track => track.id === loadingTrackId)) {
      setLoadingTrackId(null);
      setGlobalLoading(false);
    }
  }, [tracks, loadingTrackId]);

  const openModal = (trackId, content) => {
    setModalState({
      isOpen: true,
      trackId,
      content
    });
  };

  const closeModal = () => {
    setModalState(prev => ({...prev, isOpen: false}));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const openUpdateBackgroundColor = () => {
    openModal(null, 'ColorPickerModalContent');
    setIsMenuOpen(false);
  };

  const handleLoadAudio = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempTrackId = `loading-${Date.now()}`;
    setGlobalLoading(true);
    setLoadingTrackId(tempTrackId);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      const wasPlaying = isPlayingRef.current;

      if (wasPlaying) {
        setIsPlaying(false);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        tracks.forEach((track) => {
          if (track.sourceNode) {
            track.sourceNode.stop();
            track.sourceNode.disconnect();
            track.sourceNode = null;
          }
        });
      }

      createNewTrack(setTracks, audioBuffer, audioContextRef, tracks, audioNodesRef, tempTrackId);
      e.target.value = '';

      if (wasPlaying) {
        setTimeout(() => {
          setIsPlaying(true);
        }, 250);
      }

      setGlobalLoading(false);
      setLoadingTrackId(null);
    } catch (error) {
      console.error("Error al cargar audio:", error);
      setGlobalLoading(false);
      setLoadingTrackId(null);
    }
  };



  useEffect(() => {
    const ctx = audioContextRef.current;
  
    if (tracks.length === 0) {
      handleStop();
      return;
    }
  
    const hasSoloTracks = tracks.some(track => track.solo);
  
    const handlePlayback = async () => {
      
      if (!isPlayingRef.current) {
        // Detener todos los tracks normales
        tracks.forEach((track) => {
          if (track.type !== 'drumMachine' && track.sourceNode) {
            try {
              track.sourceNode.stop();
              track.sourceNode.disconnect();
            } catch (error) {
              console.error("Error stopping track:", error);
            }
            track.sourceNode = null;
            track.isPlaying = false;
          }
          if (track.isTimeSelectOffset) {
            track.offset = undefined;
            track.isTimeSelectOffset = false;
          }
        });
  
        // Limpiar filtros
        Object.values(filterNodesRef.current).forEach((nodes) => {
          nodes.forEach((node) => node.disconnect());
        });
        filterNodesRef.current = {};
        
        // Limpiar eventos programados del drum machine
        scheduledEvents.current.clear();
        clearTimeout(schedulerRef.current);
      } else {
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
  
        const startTimeInContext = ctx.currentTime;
        const globalCurrentTime = Number(currentTimeRef.current) || 0;

        let finishedTracks = 0;
        const totalTracks = tracks.filter(t => t.audioBuffer || t.type === 'drumMachine').length;

        const checkAllTracksFinished = () => {
          finishedTracks++;
          if (finishedTracks === totalTracks) {
            console.log("Todos los tracks han terminado de reproducirse");
          }
        };
  
        // Manejar tracks normales
        tracks.forEach((track) => {
          if (track.type !== 'drumMachine' && track.sourceNode) {
            track.sourceNode.stop();
            track.sourceNode.disconnect();
            track.sourceNode = null;
          }
        });
  
        const updatedTracks = tracks.map((track) => {
          const shouldPlay = !track.muted && (!hasSoloTracks || (hasSoloTracks && track.solo));
          
          // Manejar tracks de audio normales
          if (track.type !== 'drumMachine' && track.audioBuffer) {
            track.sourceNode = ctx.createBufferSource();
            track.sourceNode.buffer = track.audioBuffer;
            
            track.sourceNode.onended = checkAllTracksFinished;
  
            let lastNode = track.sourceNode;
  
            if (track.filters?.length > 0) {
              track.filters.forEach((filter, index) => {
                if (!filterNodesRef.current[track.id]) {
                  filterNodesRef.current[track.id] = [];
                }
                filterNodesRef.current[track.id][index] = createFilterNode(ctx, filter);
                lastNode.connect(filterNodesRef.current[track.id][index]);
                lastNode = filterNodesRef.current[track.id][index];
              });
            }
  
            if (!audioNodesRef.current[track.id]) {
              audioNodesRef.current[track.id] = {
                gainNode: ctx.createGain(),
                pannerNode: ctx.createStereoPanner(),
                analyser: ctx.createAnalyser()
              };
            }
  
            const targetGain = shouldPlay
              ? Math.min(track.volume || 0.7, 0.7) * (hasSoloTracks && track.solo ? 1 : 0.8)
              : 0;
  
            audioNodesRef.current[track.id].gainNode.gain.setValueAtTime(
              targetGain,
              ctx.currentTime
            );
  
            lastNode.connect(audioNodesRef.current[track.id].gainNode);
            audioNodesRef.current[track.id].gainNode.connect(audioNodesRef.current[track.id].pannerNode);
            audioNodesRef.current[track.id].pannerNode.connect(ctx.destination);
  
            if (track.isTimeSelectOffset && track.offset !== undefined) {
              track.sourceNode.start(startTimeInContext, track.offset);
              track.offset = undefined;
              track.isTimeSelectOffset = false;
            } else {
              const relativeTime = globalCurrentTime - (track.startTime || 0);
              if (relativeTime >= 0) {
                track.sourceNode.start(
                  startTimeInContext,
                  Math.min(relativeTime, track.audioBuffer.duration - 0.1)
                );
              } else {
                const startDelay = -relativeTime;
                track.sourceNode.start(startTimeInContext + startDelay, 0);
              }
            }
  
            track.isPlaying = shouldPlay;
          }
          // Manejar tracks de drum machine
          else if (track.type === 'drumMachine' && shouldPlay) {
            if (!audioNodesRef.current[track.id]) {
              audioNodesRef.current[track.id] = {
                gainNode: ctx.createGain(),
                pannerNode: ctx.createStereoPanner(),
                analyser: ctx.createAnalyser()
              };
              
              // Configurar ganancia inicial para drum machine
              audioNodesRef.current[track.id].gainNode.gain.setValueAtTime(
                Math.min(track.volume || 0.7, 0.7) * (hasSoloTracks && track.solo ? 1 : 0.8),
                ctx.currentTime
              );
            }
            
            track.isPlaying = true;
            scheduleDrumMachine(track, globalCurrentTime);
          }
          
          return track;
        });
  
        if (tracks.some(t => t.isTimeSelectOffset)) {
          setTracks(updatedTracks);
        }
  
        tracks.forEach(track => {
          if (track.audioBuffer) {
            console.log(`Track ${track.id} - StartTime: ${track.startTime || 0}, 
              GlobalTime: ${globalCurrentTime}, 
              Offset: ${track.offset !== undefined ? track.offset : 'auto'}, 
              BufferDur: ${track.audioBuffer.duration.toFixed(2)}s`);
          }
        });
      }
      
    };
  
    // Función optimizada para programar eventos de drum machine
    const scheduleDrumMachine = (track, globalCurrentTime) => {
      if (!isPlayingRef.current || !audioContextRef.current) return;

      const currentAudioTime = audioContextRef.current.currentTime;
      const lookAhead = 0.1; // Programar 100ms adelante
      const scheduleEnd = currentAudioTime + lookAhead;

      const pattern = track.drumPattern.patterns[track.drumPattern.currentPattern];
      const stepDuration = 60 / track.drumPattern.BPM / track.drumPattern.subdivisionsPerPulse;

      // Calcular rango de pasos a programar
      const startStep = Math.floor((globalCurrentTime) / stepDuration);
      const endStep = Math.floor((globalCurrentTime + lookAhead) / stepDuration);

      for (let step = startStep; step <= endStep; step++) {
        const stepIndex = step % pattern.steps.length; // Para loop
        const stepTime = currentAudioTime + (step * stepDuration) - globalCurrentTime;
        
        if (stepTime >= currentAudioTime && stepTime < scheduleEnd) {
          pattern.steps[stepIndex].activeSounds.forEach(sound => {
            const eventId = `${track.id}-${stepIndex}-${sound}`;
            
            if (!scheduledEvents.current.has(eventId)) {
              const buffer = sequencerBuffers.current.get(sound);
              if (buffer) {
                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                
                // Conectar a la cadena de efectos del track
                if (audioNodesRef.current[track.id]) {
                  source.connect(audioNodesRef.current[track.id].gainNode);
                } else {
                  source.connect(audioContextRef.current.destination);
                }
                
                source.start(stepTime);
                scheduledEvents.current.add(eventId);
                source.onended = () => {
                  scheduledEvents.current.delete(eventId);
                  checkAllTracksFinished();
                };
              }
            }
          });
        }
      }

      schedulerRef.current = setTimeout(() => scheduleDrumMachine(track, globalCurrentTime), lookAhead * 500);
    };

    // Función para limpiar eventos de drum machine
    const cleanupDrumMachineEvents = () => {
      const now = audioContextRef.current?.currentTime || 0;
      const toDelete = [];
      
      scheduledEvents.current.forEach(id => {
        const [trackId, stepIndex] = id.split('-');
        const track = tracks.find(t => t.id === trackId);
        if (track) {
          const stepDuration = 60 / track.drumPattern.BPM / track.drumPattern.subdivisionsPerPulse;
          
          // Asumimos que cada evento dura menos de 1 segundo
          if (now > (currentTimeRef.current + (parseInt(stepIndex) * stepDuration) + 1)) {
            toDelete.push(id);
          }
        }
      });

      toDelete.forEach(id => scheduledEvents.current.delete(id));
    };

    // Configurar limpieza periódica
    const cleanupInterval = setInterval(cleanupDrumMachineEvents, 1000);
    
    handlePlayback();
    
    return () => {
      clearInterval(cleanupInterval);
      clearTimeout(schedulerRef.current);
    };
  }, [isPlaying, tracks]);

  useEffect(() => {
    if (!isPlaying) return;

    const scrollInterval = setInterval(() => {
      setCurrentTime(prevTime => {
        const newTime = prevTime + 0.1;
        scrollToCurrentTime(newTime, scrollContainerRef, PIXELS_PER_SECOND);
        return newTime;
      });
    }, 100);

    return () => clearInterval(scrollInterval);
  }, [isPlaying, PIXELS_PER_SECOND]);

  const handlePlayPause = () => {
    tracks.length !== 0 && setIsPlaying((prev) => !prev);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    scrollContainerRef.current?.scrollTo({ left: 0 });
  };

  const handleToggleUI = () => {
    console.log("Alternando UI...");
  };

  const updateTrackColor = (trackId, newColor) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? {...track, backgroundColorTrack: newColor} : track
      )
    );
  };

  const BPM = 60;
  const pulsesPerMeasure = 4;
  const subdivisionsPerPulse = 3; // Nueva propiedad: subdivisiones por pulso
  const measuresToRender = 20;
  const additionalColumns = 2;
  //const secondsPerPulse = 60 / BPM;
  //const pulseWidth = Math.round(secondsPerPulse * PIXELS_PER_SECOND);
  const totalPulses = measuresToRender * pulsesPerMeasure + additionalColumns;
  const totalElements = totalPulses * subdivisionsPerPulse; // Total de elementos ahora incluye subdivisiones

  const renderModalContent = () => {
    const track = tracks.find(t => t.id === modalState.trackId);

    if (modalState.content === 'ColorPickerModalContent') {
      return (
        <ColorPickerModalContent 
          onClose={closeModal}
        />
      );
    } 
    
    if (modalState.content === 'trackControl') {
      return (
        <TrackControls 
          track={track}
          showContent={true}
          onAction={handleTrackAction}
          setIsPlaying={setIsPlaying}
          filterNodesRef={filterNodesRef}
          updateTrackColor={updateTrackColor}
          tracks={tracks}
          setTracks={setTracks}
          audioNodesRef={audioNodesRef}
          openModal={openModal}
          onClose={closeModal}
          audioContextRef={audioContextRef}
        />
      );
    }

    if (modalState.content === 'SingleColorPickerModalContent') {
      return <SingleColorPickerModalContent 
        initialColor={track.backgroundColorTrack}
        onClose={closeModal}
        onColorUpdate={(newColor)=>updateTrackColor(track.id, newColor)}/>
    }

    if (modalState.content === 'zoomSliders') {
      return (
        <div style={{width: '300px'}}>
          <h2 className="title-md" style={{textAlign: 'center', marginBottom: '20px', fontWeight: 300}}>
            Wave Render Zoom
          </h2>
          
          <h3 className="title-sm" style={{textAlign: 'center'}}>Width</h3>
          <RangeInput
            min={40}
            max={200}
            value={PIXELS_PER_SECOND}
            onChange={set_PIXELS_PER_SECOND}
          />
        
          <h3 className="title-sm" style={{textAlign: 'center'}}>Height</h3>
          <RangeInput
            min={40}
            max={200}
            value={pixelsHeight}
            onChange={setPixelsHeight}
          />
        </div>
      );
    }

    if (modalState.content === 'subdivisions') {
      return (
        <div style={{ width: '300px', padding: '20px' }}>
          <h2 className="title-md" style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 300 }}>
            Configuración de Subdivisiones (3 compases)
          </h2>
          
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.1)', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <p style={{ textAlign: 'center', margin: 0 }}>
              <strong>Compás fijo:</strong> 4/4 | <strong>Compases a renderizar:</strong> 3
            </p>
          </div>
    
          <div style={{ marginBottom: '20px' }}>
            <h3 className="title-sm" style={{ textAlign: 'center' }}>Pulsos por segundo</h3>
            <input
              type="number"
              min="1"
              max="200"
              value={subdivisionSettings.pulsesPerSecond}
              onChange={(e) => setSubdivisionSettings(prev => ({
                ...prev,
                pulsesPerSecond: Math.max(1, Math.min(200, parseInt(e.target.value) || 1))
              }))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 className="title-sm" style={{ textAlign: 'center' }}>Subdivisiones por pulso</h3>
            <input
              type="number"
              min="1"
              max="16"
              value={subdivisionSettings.subdivisions}
              onChange={(e) => setSubdivisionSettings(prev => ({
                ...prev,
                subdivisions: Math.max(1, Math.min(16, parseInt(e.target.value) || 1))
              }))}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                textAlign: 'center'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={closeModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                setSubdivisionSettings(prev => ({...prev, enabled: true}));
                closeModal();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      );
    }

    if (modalState.content === 'waveStyles') {
      
      return (
        <div style={{ width: '300px', padding: '20px' }}>
          <h2 className="title-md" style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 300 }}>
            Wave styles
          </h2>
          
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.1)', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <select
              value={waveFormStyle}
              onChange={(e) => setWaveFormStyle(e.target.value)}>
              
              <option value="default">DEFAULT</option>
              <option value="sc_split">SOUNDCLOUD_SPLIT</option>
              <option value="st_bars">SOUNDTRAP_BARS</option>
              <option value="glow_lines">GLOW_LINES</option>
              <option value="watercolor">WATERCOLOR</option>
              <option value="modern_bars">MODERN_BARS</option>
              <option value="dual_grad">DUAL_GRADIENT</option>
              <option value="neon_outline">NEON_OUTLINE</option>
              <option value="wavy_ribbon">WAVY_RIBBON</option>
              <option value="faded_peaks">FADED_PEAKS</option>
              <option value="geometric">GEOMETRIC</option>
            </select>  
          </div>
        </div>
      );
    }

    if (modalState.content === 'secuencer') {
      return (<PercussionSequencer handleLoadAudio={handleLoadAudio}/>);
    }
  };



  return (
    <div className="fullscreen-div backgroundColor1">
      {globalLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          color: 'white'
        }}>
          <MainLogo size={80} animate={true} />
          <p style={{ 
            marginTop: '20px', 
            fontSize: '1.2rem',
            animation: 'pulse-opacity 1.5s infinite'
          }}>
            loading audio...
          </p>
        </div>
      )}

      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        openUpdateBackgroundColor={openUpdateBackgroundColor}
        className="backgroundColor2"
      />

      <div className="editor-container">
        <div className="timeline-scroll-wrapper" ref={scrollContainerRef}>
          <div className="timeline-content">
            
            <TimeRuler pixelsPerSecond={PIXELS_PER_SECOND} tracks={tracks} /> 
            {tracks.map((track) => (
              <div key={track.id} className="track-container">
                {loadingTrackId === track.id && (
                  <div className="track-loading-overlay">
                    <div className="loading-content">
                      <MainLogo size={50} animate={true} />
                      <p style={{color: 'black'}}>Cargando audio...</p>
                    </div>
                  </div>
                )}
                
                <div style={{ 
                  visibility: loadingTrackId === track.id ? 'hidden' : 'visible',
                  height: loadingTrackId === track.id ? '100px' : 'auto'
                }}>
                  <TrackControlsModal 
                    track={track} 
                    openModal={openModal}
                    audioNodesRef={audioNodesRef}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    tracks={tracks}
                    setTracks={setTracks}
                    handleToggleSolo={()=> handleTrackAction("solo", track.id, setTracks, audioNodesRef, tracks)}
                    handleToggleMute={()=> handleTrackAction("mute", track.id, setTracks, audioNodesRef, tracks, !track.muted)}/>
                  <div className="track-waveform">
                    <Track
                      track={track}
                      pixelsPerSecond={PIXELS_PER_SECOND} 
                      pixelsHeight={pixelsHeight}
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
                          audioNodesRef, 
                        )
                      }
                      tracks={tracks}
                      setTracks={setTracks}
                      totalElements={totalElements}
                      openModal={openModal}
                      audioNodesRef={audioNodesRef}
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      audioContextRef={audioContextRef}
                      preloadSequencerSamples={preloadSequencerSamples}
                      scheduleDrumMachine={scheduleDrumMachine}
                      startTransport={startTransport}
                      waveFormStyle={waveFormStyle}
                      handleLoadAudio={handleLoadAudio}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Modal 
        className={'backgroundColor2 color2'} 
        isOpen={modalState.isOpen} 
        onClose={closeModal}
      >
        {renderModalContent()}
      </Modal>

      

      <div>
        <GlobalControls
          isPlaying={isPlaying}
          isRecording={isRecording} 
          currentTime={currentTime}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onRecord={() => handleRecord(isRecording, setIsRecording, mediaRecorderRef, audioContextRef, setTracks, tracks, audioNodesRef)}
          onDownload={()=>handleDownloadMix(tracks)}
          onToggleUI={handleToggleUI}
          onLoadAudio={handleLoadAudio}
          toggleMenu={toggleMenu}
          openModal={()=>openModal('', 'zoomSliders')}
          openSubdivision={()=>openModal('', 'subdivisions')}
          handleAddDrumMachine={()=>openModal('', 'secuencer')}
          waveStyles={()=>openModal('', 'waveStyles')}
        />
      </div>
    </div>
  );
};

export default AudioEditor;





















































