  /*export const handlePlayPause = async (
    audioContextRef,
    tracks,
    currentTime,
    setIsPlaying,
    isPlaying,
    startTimeRef
  ) => {
    const ctx = audioContextRef.current;
  
    if (!tracks[0]) return null;
  
    // Reanudar el contexto si está suspendido
    if (ctx.state === "suspended") await ctx.resume();
  
    if (!isPlaying) {
      startTimeRef.current = ctx.currentTime - currentTime;
  
      tracks.forEach((track) => {
        // Detener y desconectar el nodo anterior si existe
        if (track.sourceNode) {
          track.sourceNode.disconnect();
          try {
            track.sourceNode.stop();
          } catch (e) {}
        }
  
        // Crear un nuevo sourceNode
        track.sourceNode = ctx.createBufferSource();
        track.sourceNode.buffer = track.audioBuffer;
  
        // Conectar el sourceNode a la cadena de audio
        track.sourceNode.connect(track.gainNode);
  
        // Calcular cuándo debe comenzar este track
        const startTimeInContext = ctx.currentTime + (track.startTime - currentTime);
  
        // Calcular el offset dentro del archivo de audio
        const startOffset = Math.max(currentTime - track.startTime, 0);
  
        // Calcular la duración restante del audio
        const remaining = track.duration - startOffset;
  
        // Programar la reproducción solo si hay audio restante
        if (remaining > 0) {
          track.sourceNode.start(startTimeInContext, startOffset, remaining);
          track.isPlaying = true; // Actualizar el estado de reproducción
        }
      });
    } else {
      // Detener la reproducción
      tracks.forEach((track) => {
        if (track.sourceNode) {
          try {
            track.sourceNode.stop();
          } catch (e) {}
          track.sourceNode.disconnect();
          track.sourceNode = null;
        }
        track.isPlaying = false; // Actualizar el estado de reproducción
      });
    }
  
    setIsPlaying(!isPlaying);
  };*/
  import { reconnectAudioChain } from "./controls";


  export const handlePlayPause = async (
    audioContextRef,
    tracks,
    currentTime,
    setIsPlaying,
    isPlaying,
    startTimeRef
  ) => {
    const ctx = audioContextRef.current;
  
    if (!tracks[0]) return null;
  
    // Reanudar el contexto si está suspendido
    if (ctx.state === "suspended") await ctx.resume();
  
    if (!isPlaying) {
      startTimeRef.current = ctx.currentTime - currentTime;
  
      tracks.forEach((track) => {
        // Detener y desconectar el nodo anterior si existe
        if (track.sourceNode) {
          track.sourceNode.disconnect();
          try {
            track.sourceNode.stop();
          } catch (e) {}
        }
  
        // Crear un nuevo sourceNode
        track.sourceNode = ctx.createBufferSource();
        track.sourceNode.buffer = track.audioBuffer;
  
        // Reconectar la cadena de audio
        let lastNode = track.sourceNode;
  
        if (track.filters && track.filters.length > 0) {
          track.filters.forEach((filter) => {
            if (!filter.node) {
              // Si el nodo del filtro no existe, crearlo
              filter.node = createFilterNode(ctx, filter);
            }
            lastNode.connect(filter.node); // Conectar el último nodo al filtro
            lastNode = filter.node; // Actualizar el último nodo
          });
        }
  
        // Conectar el último nodo al gainNode
        lastNode.connect(track.gainNode);
  
        // Calcular cuándo debe comenzar este track
        const startTimeInContext = ctx.currentTime + (track.startTime - currentTime);
  
        // Calcular el offset dentro del archivo de audio
        const startOffset = Math.max(currentTime - track.startTime, 0);
  
        // Calcular la duración restante del audio
        const remaining = track.duration - startOffset;
  
        // Programar la reproducción solo si hay audio restante
        if (remaining > 0) {
          track.sourceNode.start(startTimeInContext, startOffset, remaining);
          track.isPlaying = true; // Actualizar el estado de reproducción
        }
      });
    } else {
      // Detener la reproducción
      tracks.forEach((track) => {
        if (track.sourceNode) {
          try {
            track.sourceNode.stop();
          } catch (e) {}
          track.sourceNode.disconnect();
          track.sourceNode = null;
        }
        track.isPlaying = false; // Actualizar el estado de reproducción
      });
    }
  
    setIsPlaying(!isPlaying);
  };



  export const createFilterNode = (context, filterConfig) => {
    switch(filterConfig.type) {
      case 'lowpass':
      case 'highpass':
      case 'bandpass':
      case 'notch': {
        const filter = context.createBiquadFilter();
        filter.type = filterConfig.type;
        filter.frequency.value = filterConfig.params.frequency || 20000;
        filter.Q.value = filterConfig.params.Q || 1;
        return filter;
      }
      
      case 'delay': {
        const delay = context.createDelay();
        delay.delayTime.value = filterConfig.params.time || 0.5;
        return delay;
      }
      
      case 'compressor': {
        const compressor = context.createDynamicsCompressor();
        // Configurar parámetros del compressor
        return compressor;
      }
      
      default:
        return context.createGain(); // Nodo neutro si el tipo no es reconocido
    }
  };



  export const handleStop = (setIsPlaying, setCurrentTime, tracks, scrollContainerRef) => {
    const now = performance.now(); // Usamos tiempo de alta precisión
  
    tracks.forEach((track) => {
      if (track.sourceNode) {
        try {
          // Verificamos si el nodo fue iniciado antes de intentar detenerlo
          if (track.sourceNode.playbackState === track.sourceNode.PLAYING_STATE ||
              track.sourceNode.playbackState === track.sourceNode.SCHEDULED_STATE) {
            track.sourceNode.stop();
          }
          track.sourceNode.disconnect();
        } catch (error) {
          console.warn("Error stopping audio node:", error);
        }
  
        // Limpiar el nodo
        track.sourceNode = null;
      }
  
      // Resetear estado de la pista
      track.isPlaying = false;
      track.offset = 0;
    });
  
    // Resetear estado global
    setIsPlaying(false);
    setCurrentTime(0);
  
    // Resetear scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  };
  

  
  
  export const handleRecord = async (
    isRecording,
    setIsRecording,
    mediaRecorderRef,
    audioContextRef,
    setTracks
  ) => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 48000, channelCount: 1 },
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
  
      const audioChunks = [];
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  
      mediaRecorder.onstop = async () => {
        // Detener los tracks del stream para liberar el micrófono
        stream.getTracks().forEach((track) => track.stop()); // <-- Corrección aquí
  
        const blob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
  
        // Crear nodos como en createTrack
        const gainNode = audioContextRef.current.createGain();
        const pannerNode = audioContextRef.current.createStereoPanner();
        gainNode.connect(pannerNode).connect(audioContextRef.current.destination);
  
        setTracks((prev) => [
          ...prev,
          {
            id: Date.now(),
            audioBuffer,
            gainNode,
            pannerNode,
            duration: audioBuffer.duration,
            volume: 1,
            panning: 0,
            muted: false,
            name: `Track ${prev.length + 1}`,
            sourceNode: null,
            startTime: 0,
            offset: 0,
          },
        ]);
      };
  
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error al grabar:", error);
    }
  };


  export const handleTimeSelect = (
    selectedTimeGlobal, // <-- Tiempo global (línea de tiempo completa)
    tracks,
    isPlaying,
    audioContextRef,
    scrollContainerRef,
    setCurrentTime,
    pixelsPerSecond,
    setTracks,
    setIsPlaying 
  ) => {
    setCurrentTime(selectedTimeGlobal); // Actualizar el tiempo global
  
    tracks.forEach((track) => {
      // Calcular el offset relativo al startTime del track
      const startOffset = Math.max(selectedTimeGlobal - track.startTime, 0);
      track.offset = startOffset;
  
      if (audioContextRef?.current && track.sourceNode) {
        try {
          setIsPlaying(false);
          setTimeout(() => {
            if (track.sourceNode) {
              track.sourceNode.stop(); // Detener el nodo actual si existe
            }
  
            // Crear nuevo nodo
            track.sourceNode = audioContextRef.current.createBufferSource();
            track.sourceNode.buffer = track.audioBuffer; // Asignar el buffer del audio
  
            // Reconectar la cadena de filtros si existen
            if (track.filters && track.filters.length > 0) {
              let lastNode = track.sourceNode;
  
              // Reconectar todos los filtros
              track.filters.forEach((filter) => {
                if (!filter.node) {
                  // Si el nodo del filtro no existe, crearlo
                  filter.node = createFilterNode(audioContextRef.current, filter);
                }
                lastNode.connect(filter.node); // Conectar el último nodo al filtro
                lastNode = filter.node; // Actualizar el último nodo
              });
  
              // Conectar el último nodo al gainNode
              lastNode.connect(track.gainNode);
            } else {
              // Si no hay filtros, conectar directamente al gainNode
              track.sourceNode.connect(track.gainNode);
            }
  
            setIsPlaying(true);
  
            // Iniciar desde el offset relativo al track
            track.sourceNode.start(0, startOffset);
          }, 1000); // 1000 ms = 1 segundo
        } catch (error) {
          console.error("Error al sincronizar track:", error);
        }
      }
    });
  
    if (scrollContainerRef?.current) {
      const scrollPos = selectedTimeGlobal * pixelsPerSecond; // Scroll basado en tiempo global
      scrollContainerRef.current.scrollLeft = scrollPos; // Actualiza el scroll según la referencia seleccionada
    }
  };
  