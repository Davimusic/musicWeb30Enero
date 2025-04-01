"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
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
    audioNodesRef
  } = useAudioEngine();
  const router = useRouter();

  const [isRecording, setIsRecording] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  //para pixeles
  const [PIXELS_PER_SECOND, set_PIXELS_PER_SECOND] = useState(40);
  const [pixelsHeight, setPixelsHeight] = useState(100);

  //para mirar consumo de memoria 
  useEffect(() => {
    let intervalId;

    if (isPlaying) {
      async function getMemoryUsage() {
        try {
          const response = await fetch("/api/memory"); // Asegúrate de que la ruta sea correcta
          const data = await response.json();
          console.log(`Memoria usada: RSS: ${data.rss}, Heap: ${data.heapUsed}`);
        } catch (error) {
          console.error("Error al obtener datos de memoria:", error);
        }
      }

      intervalId = setInterval(getMemoryUsage, 5000); // Ejecuta cada 5 segundos
    }

    return () => {
      clearInterval(intervalId); // Detiene el intervalo cuando isPlaying cambia a false
    };
  }, [isPlaying]);
  
  




  const scrollContainerRef = useRef(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    trackId: null,
    content: null
  });

  // ==============================================
  // === NUEVO CÓDIGO PARA BLOQUEAR GESTOS ===
  // ==============================================
  const [showExitWarning, setShowExitWarning] = useState(false);
  const gestureStartX = useRef(0);
  const isHorizontalGesture = useRef(false);

  useEffect(() => {
    // 1. Bloquear gestos del touchpad/mouse
    const handleMouseDown = (e) => {
      if (e.button === 0) { // Solo botón izquierdo
        gestureStartX.current = e.clientX;
        isHorizontalGesture.current = false;
      }
    };

    const handleMouseMove = (e) => {
      if (gestureStartX.current !== 0) {
        const deltaX = e.clientX - gestureStartX.current;
        if (Math.abs(deltaX) > 30) { // Umbral para detectar gesto
          isHorizontalGesture.current = true;
        }
      }
    };

    const handleMouseUp = () => {
      if (isHorizontalGesture.current) {
        setShowExitWarning(true);
      }
      gestureStartX.current = 0;
      isHorizontalGesture.current = false;
    };

    // 2. Bloquear navegación con botones del navegador
    const handlePopState = (e) => {
      if (isHorizontalGesture.current) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
        setShowExitWarning(true);
      }
    };

    // 3. Configurar event listeners
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('popstate', handlePopState);

    // 4. Inicializar estado del historial
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleConfirmExit = () => {
    setShowExitWarning(false);
    isHorizontalGesture.current = false;
    // Permitir navegación después de confirmar
    window.history.back();
  };

  const handleCancelExit = () => {
    setShowExitWarning(false);
    isHorizontalGesture.current = false;
    // Mantener al usuario en la página actual
    window.history.pushState(null, '', window.location.pathname);
  };

  // 5. CSS para bloquear gestos del navegador
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

  // ==============================================
  // === AQUÍ COMIENZA TU CÓDIGO ORIGINAL ===
  // ==============================================

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
        // Limpieza al pausar (IDÉNTICO A TU VERSIÓN ORIGINAL)
        tracks.forEach((track) => {
          if (track.sourceNode) {
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
  
        Object.values(filterNodesRef.current).forEach((nodes) => {
          nodes.forEach((node) => node.disconnect());
        });
        filterNodesRef.current = {};
      } else {
        // Lógica de reproducción (IDÉNTICO A TU VERSIÓN ORIGINAL)
        if (ctx.state === "suspended") {
          await ctx.resume();
        }
  
        const startTimeInContext = ctx.currentTime;
        const globalCurrentTime = Number(currentTimeRef.current) || 0;

        // --- INICIO DE LA ÚNICA MODIFICACIÓN ---
        let finishedTracks = 0;
        const totalTracks = tracks.filter(t => t.audioBuffer).length;

        const checkAllTracksFinished = () => {
          finishedTracks++;
          if (finishedTracks === totalTracks) {
            //handleStop()
            console.log("Todos los tracks han terminado de reproducirse");
            // IMPORTANTE: NO reiniciamos currentTimeRef aquí para no afectar tu lógica
          }
        };
        // --- FIN DE LA ÚNICA MODIFICACIÓN ---
  
        // Primero detener todos los nodos existentes (IDÉNTICO A TU VERSIÓN ORIGINAL)
        tracks.forEach((track) => {
          if (track.sourceNode) {
            track.sourceNode.stop();
            track.sourceNode.disconnect();
            track.sourceNode = null;
          }
        });
  
        // Crear nuevos nodos (IDÉNTICO A TU VERSIÓN ORIGINAL excepto por la línea del onended)
        const updatedTracks = tracks.map((track) => {
          const shouldPlay = !track.muted && (!hasSoloTracks || (hasSoloTracks && track.solo));
  
          if (track.audioBuffer) {
            track.sourceNode = ctx.createBufferSource();
            track.sourceNode.buffer = track.audioBuffer;
            
            // ÚNICA ADICIÓN: Esta línea es lo único nuevo
            track.sourceNode.onended = checkAllTracksFinished;
  
            // Cadena de conexión (IDÉNTICO A TU VERSIÓN ORIGINAL)
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
  
            // Lógica de inicio (IDÉNTICO A TU VERSIÓN ORIGINAL - SIN CAMBIOS EN LA LÓGICA DE TIEMPO)
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
          return track;
        });
  
        if (tracks.some(t => t.isTimeSelectOffset)) {
          setTracks(updatedTracks);
        }
  
        // Log para depuración (IDÉNTICO A TU VERSIÓN ORIGINAL)
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
  
    handlePlayback();
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

  const updateTrackName = (trackId, newName) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? {...track, name: newName} : track
      )
    );
  };

  const updateTrackColor = (trackId, newColor) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? {...track, backgroundColorTrack: newColor} : track
      )
    );
  };

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
                  <div 
                    className={`sticky-track-header ${track.solo ? 'trackSolo' : ''}`}
                    style={{
                      position: 'sticky',
                      left: '10px',
                      top: '-20px',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: 'white',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                      width: 'auto',
                      marginLeft: '-180px',
                      float: 'left'
                    }}
                  >
                    <EditableTrackName 
                      name={track.name} 
                      onChange={(newName) => updateTrackName(track.id, newName)} 
                      style={{
                        backgroundColor: 'transparent',
                        padding: 0,
                        margin: 0,
                        border: 'none',
                        color: 'black'
                      }}
                    />
                    <ControlsIcon size={30} onToggle={() => openModal(track.id, 'trackControl')} />
                    <AudioLevelMeter 
                      analyser={audioNodesRef.current[track.id]?.analyser}
                      muted={track.muted}
                      clipTimes={track.clipTimes}       // Array con los tiempos en segundos de los clips
                      globalTime={currentTime} 
                      isPlaying={isPlaying} 
                      tracks={tracks} 
                      trackId={track.id}          // Tiempo global actual (en segundos)
                    />
                  </div>
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

      {/* Modal de advertencia por gestos */}
      {showExitWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ color: '#d32f2f', marginBottom: '1.5rem' }}>¡Acción no deseada detectada!</h3>
            <p style={{ marginBottom: '2rem', lineHeight: '1.5' }}>
              Has intentado navegar con un gesto del mouse. ¿Estás seguro que quieres salir del editor de audio?
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <button
                onClick={handleCancelExit}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  minWidth: '140px'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExit}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  minWidth: '140px'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

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
        />
      </div>
    </div>
  );
};

export default AudioEditor;



































/*"use client";

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
import { reconnectAudioChain } from "../../functions/music/DAW2/controls";


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
  const filterNodesRef = useRef({});
  const { audioContextRef } = useAudioContext();
  const { scrollContainerRef, tracksContainerRef } = useAutoScroll(
    tracks,
    isPlaying,
    currentTimeRef,
    PIXELS_PER_SECOND,
    setCurrentTime
  );
  const isPlayingRef = useRef(isPlaying);
  const tracksRef = useRef(tracks);

  // Actualizar referencias cuando cambien los estados
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  

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
    console.log("isPlaying:", isPlayingRef.current);
    console.log("Tracks:", tracks);
  
    const ctx = audioContextRef.current;
  
    if (!isPlayingRef.current) {
      // Pausar todos los tracks
      tracks.forEach((track) => {
        if (track.sourceNode) {
          try {
            track.sourceNode.stop(); // Detener el nodo de audio
            track.sourceNode.disconnect(); // Desconectar el nodo
          } catch (error) {
            console.error("Error stopping track:", error);
          }
          track.sourceNode = null; // Limpiar la referencia
          track.isPlaying = false; // Actualizar el estado de reproducción
        }
      });
  
      // Limpiar los nodos de filtro
      Object.values(filterNodesRef.current).forEach((nodes) => {
        nodes.forEach((node) => node.disconnect());
      });
      filterNodesRef.current = {};
    } else {
      // Reiniciar la reproducción si isPlaying es true
      console.log('reinicia');
      
      tracks.forEach((track) => {
        if (!track.sourceNode && track.audioBuffer) {
          track.sourceNode = ctx.createBufferSource();
          track.sourceNode.buffer = track.audioBuffer;
  
          // Reconectar la cadena de audio (filtros, gainNode, etc.)
          let lastNode = track.sourceNode;
          if (track.filters && track.filters.length > 0) {
            track.filters.forEach((filter, index) => {
              if (!filterNodesRef.current[track.id]) {
                filterNodesRef.current[track.id] = [];
              }
              if (!filterNodesRef.current[track.id][index]) {
                filterNodesRef.current[track.id][index] = createFilterNode(ctx, filter);
              }
              lastNode.connect(filterNodesRef.current[track.id][index]);
              lastNode = filterNodesRef.current[track.id][index];
            });
          }
          lastNode.connect(track.gainNode);
  
          // Programar la reproducción
          const startTimeInContext = ctx.currentTime + (track.startTime - currentTime);
          const startOffset = Math.max(currentTime - track.startTime, 0);
          const remaining = track.duration - startOffset;
  
          if (remaining > 0) {
            track.sourceNode.start(startTimeInContext, startOffset, remaining);
            track.isPlaying = true;
          }
        }
      });
    }
  }, [isPlayingRef.current]); // Este efecto se ejecuta cuando isPlaying cambia

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
      removeFilter: (id, index) => {
        setTracks((prev) =>
          prev.map((track) => {
            if (track.id === id) {
              const newFilters = track.filters.filter((_, i) => i !== index);
              return { ...track, filters: newFilters };
            }
            return track;
          })
        );
  
        // Reconectar la cadena de audio
        const trackToUpdate = tracks.find((t) => t.id === id);
        if (trackToUpdate) {
          reconnectAudioChain(trackToUpdate);
        }
      },
  
      // En handleTrackAction, modificar addFilter:
addFilter: (id, filter) => {
  setTracks((prev) =>
    prev.map((track) =>
      track.id === id
        ? { ...track, filters: [...(track.filters || []), { ...filter, node: null }] }
        : track
    )
  );
},
  
      // En handleTrackAction
updateFilter: (id, index, newParams) => {
  setTracks((prev) =>
    prev.map((track) =>
      track.id === id
        ? {
            ...track,
            filters: track.filters.map((f, i) =>
              i === index ? { ...f, params: newParams } : f
            ),
          }
        : track
    )
  );

  // Actualizar nodos de audio
  const trackToUpdate = tracks.find((t) => t.id === id);
  if (trackToUpdate) {
    const filterNode = trackToUpdate.filters[index]?.node;
    if (filterNode) {
      // Actualizar parámetros del filtro (ejemplo para un lowpass)
      if (filterNode.type === "lowpass") {
        filterNode.frequency.value = newParams.frequency;
        filterNode.Q.value = newParams.Q;
      }
    }
  }

  const filterNode = filterNodesRef.current[id]?.[index];
  if (filterNode) {
    if (filterNode.type === 'lowpass') {
      filterNode.frequency.value = newParams.frequency;
      filterNode.Q.value = newParams.Q;
    }
  }
},
  
      redrawWaveform: (id) => {
        setTracks((prev) =>
          prev.map((track) =>
            track.id === id ? { ...track, redraw: !track.redraw } : track
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
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                      track={track} 
                      tracks={tracks}
                      setTracks={setTracks}
                      isPlayingRef={isPlayingRef} // Pasar referencia
                      tracksRef={tracksRef} // Pasar referencia
                      showContent={true}
                      onAction={handleTrackAction}
                      audioContextRef={audioContextRef}
                      filterNodesRef={filterNodesRef}
                      setCurrentTime={setCurrentTime}
                      scrollContainerRef={scrollContainerRef}
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
              startTimeRef,
              filterNodesRef 
            )
          }
          onStop={() =>
            handleStop(setIsPlaying, setCurrentTime, tracks, scrollContainerRef, filterNodesRef )
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

export default AudioEditor;*/






















