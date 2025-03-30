"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import useAudioEngine from "@/functions/music/DAW3/useAudioEngine";
import useTrackManager from "@/functions/music/DAW3/useTrackManager";
import { useAudioControls } from "@/functions/music/DAW3/useAudioControls";
import { TrackControls } from "@/functions/music/DAW2/controls";
import { PIXELS_PER_SECOND } from "@/functions/music/DAW2/audioUtils";
import TimeRuler from "./timeRuler";
import { GlobalControls } from "@/functions/music/DAW2/controls";
import { createTrack } from "@/functions/music/DAW2/audioUtils";
import { handleRecord } from "@/functions/music/DAW2/audioHandlers";
import createNewTrack from "@/functions/music/DAW3/createTack";
import EditableTrackName from "@/functions/music/DAW3/editableTrackName";
'../../estilos/music/audioEditor.css'
import SingleColorPickerModalContent from "./singleColorPickerModalContent";
import Modal from "./modal";
import handleTrackAction from "@/functions/music/DAW3/handleTrackAction";
import Knob from "./knob";
import { createFilterNode } from "@/functions/music/DAW2/audioHandlers";
import ColorPickerModalContent from "./colorPicker";
import ControlsIcon from "./controlsIcon";
import Menu from "./menu";
import MainLogo from "./mainLogo";




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

  const [isRecording, setIsRecording] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    trackId: null,
    content: null
  });

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

      createNewTrack(setTracks, audioBuffer, audioContextRef, tracks, audioNodesRef, tempTrackId);
      e.target.value = '';
      scrollContainerRef.current?.scrollTo({ left: 0 });
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

    if (!isPlayingRef.current) {
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
      });

      Object.values(filterNodesRef.current).forEach((nodes) => {
        nodes.forEach((node) => node.disconnect());
      });
      filterNodesRef.current = {};
    } else {
      if (ctx.state === "suspended") {
        ctx.resume().then(() => {
          console.log("AudioContext resumido.");
        });
      }

      const startTimeInContext = ctx.currentTime;
      const currentTimeValue = Number(currentTimeRef.current) || 0;

      tracks.forEach((track) => {
        if (!track.sourceNode && track.audioBuffer) {
          track.sourceNode = ctx.createBufferSource();
          track.sourceNode.buffer = track.audioBuffer;

          let lastNode = track.sourceNode;
          
          if (track.filters?.length > 0) {
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
          
          const audioNodes = audioNodesRef.current[track.id];
          if (audioNodes) {
            lastNode.connect(audioNodes.gainNode);
            audioNodes.gainNode.connect(audioNodes.pannerNode);
            audioNodes.pannerNode.connect(ctx.destination);
          } else {
            lastNode.connect(ctx.destination);
          }

          const trackStartTime = Number(track.startTime) || 0;
          const startOffset = Math.max(currentTimeValue - trackStartTime, 0);

          if (isNaN(startOffset) || !isFinite(startOffset)) return;

          track.sourceNode.start(startTimeInContext, startOffset);
          track.isPlaying = true;
        }
      });
    }
  }, [isPlaying]);

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
  }, [isPlaying]);

  const handlePlayPause = () => {
    tracks.length !== 0 && setIsPlaying((prev) => !prev);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDownload = () => {
    console.log("Descargando mezcla...");
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
        />
      );
    }

    if (modalState.content === 'SingleColorPickerModalContent') {
      return <SingleColorPickerModalContent 
        initialColor={track.backgroundColorTrack}
        onClose={closeModal}
        onColorUpdate={(newColor)=>updateTrackColor(track.id, newColor)}/>
    }
  };

  return (
    <div className="fullscreen-div">
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
            Procesando archivo de audio...
          </p>
        </div>
      )}

      <Menu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        openUpdateBackgroundColor={openUpdateBackgroundColor}
        className="backgroundColor2"
      />

      <div className="editor-container backgroundColor1">
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
                    className="sticky-track-header"
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
                  </div>
                  <div className="track-waveform">
                    <Track
                      track={track}
                      pixelsPerSecond={PIXELS_PER_SECOND}
                      onSelectTime={() => console.log('hi')}
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
          onDownload={handleDownload}
          onToggleUI={handleToggleUI}
          onLoadAudio={handleLoadAudio}
          toggleMenu={toggleMenu}
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






















