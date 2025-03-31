  import { createNewTrack } from "../DAW3/createTack";
  /*export const handlePlayPause = async (
    audioContextRef,
    tracks,
    currentTime,
    setIsPlaying,
    isPlaying,
    startTimeRef,
    filterNodesRef
  ) => {
    const ctx = audioContextRef.current;
    if (!tracks[0]) return;

    if (ctx.state === "suspended") await ctx.resume();
    console.log(isPlaying);
    
    if (!isPlaying) {
      // Iniciar reproducción
      startTimeRef.current = ctx.currentTime - currentTime;

      tracks.forEach((track) => {
        if (track.sourceNode) {
          track.sourceNode.disconnect();
          try {
            track.sourceNode.stop();
          } catch (e) {}
        }

        track.sourceNode = ctx.createBufferSource();
        track.sourceNode.buffer = track.audioBuffer;

        // Reconectar cadena de audio (filtros, gainNode, etc.)
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

        // Programar reproducción
        const startTimeInContext = ctx.currentTime + (track.startTime - currentTime);
        const startOffset = Math.max(currentTime - track.startTime, 0);
        const remaining = track.duration - startOffset;

        if (remaining > 0) {
          track.sourceNode.start(startTimeInContext, startOffset, remaining);
          track.isPlaying = true;
        }
      });
    } else {
      // Detener reproducción
      tracks.forEach((track) => {
        if (track.sourceNode) {
          track.sourceNode.onended = null; // Eliminar listeners
          try {
            track.sourceNode.stop();
          } catch (e) {}
          track.sourceNode.disconnect();
          track.sourceNode = null;
        }
        track.isPlaying = false;
      });

      // Limpiar filtros
      Object.values(filterNodesRef.current).forEach((nodes) => {
        nodes.forEach((node) => node.disconnect());
      });
      filterNodesRef.current = {};
    }

    setIsPlaying(!isPlaying);
  };*/

  export const createFilterNode = (context, filterConfig) => {
    switch(filterConfig.type) {
      case 'lowpass':
      case 'highpass':
      case 'bandpass':
      case 'notch': {
        const filter = context.createBiquadFilter();
        filter.type = filterConfig.type;
        
        // Usar parámetros actualizados del filterConfig
        filter.frequency.value = filterConfig.params?.frequency ?? 20000;
        filter.Q.value = filterConfig.params?.Q ?? 1;
        
        return filter;
      }
      
      case 'delay': {
        const delay = context.createDelay();
        delay.delayTime.value = filterConfig.params?.time ?? 0.5;
        return delay;
      }
      
      case 'compressor': {
        const compressor = context.createDynamicsCompressor();
        // Configurar parámetros actualizados
        compressor.threshold.value = filterConfig.params?.threshold ?? -24;
        compressor.knee.value = filterConfig.params?.knee ?? 30;
        compressor.ratio.value = filterConfig.params?.ratio ?? 12;
        compressor.attack.value = filterConfig.params?.attack ?? 0.003;
        compressor.release.value = filterConfig.params?.release ?? 0.25;
        return compressor;
      }
      
      default:
        return context.createGain();
    }
  };

  /*export const handleStop = (setIsPlaying, setCurrentTime, tracks, scrollContainerRef, filterNodesRef ) => {
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

    Object.values(filterNodesRef.current).forEach(nodes => {
      nodes.forEach(node => node.disconnect());
    });
    filterNodesRef.current = {};
  };*/




  export const handleRecord = async (
    isRecording,
    setIsRecording,
    mediaRecorderRef,
    audioContextRef,
    setTracks,
    tracks,
    audioNodesRef 
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
  
        createNewTrack(setTracks, audioBuffer, audioContextRef, tracks, audioNodesRef)
      };
  
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error al grabar:", error);
    }
  };

  export const handleTimeSelect = (
    selectedTimeGlobal,
    tracks,
    isPlaying,
    audioContextRef,
    scrollContainerRef,
    setCurrentTime,
    pixelsPerSecond,
    setTracks,
    setIsPlaying,
    audioNodesRef
  ) => {
    if (!audioContextRef?.current) {
      console.error("AudioContext no disponible");
      return;
    }
  
    console.log(selectedTimeGlobal);
    
    // 1. Actualizar tiempo global
    setCurrentTime(selectedTimeGlobal);
  
    // 2. Calcular y guardar nuevos offsets para cada track
    const updatedTracks = tracks.map(track => ({
      ...track,
      // Solo establecer offset si el selectedTimeGlobal está dentro de la duración del track
      offset: Math.max(
        Math.min(selectedTimeGlobal - track.startTime, track.duration - 0.1),
        0
      ),
      // Marcar explícitamente que este es un offset temporal
      isTimeSelectOffset: true
    }));
  
    setTracks(updatedTracks);
  
    // 3. Reiniciar reproducción con un pequeño retraso
    if (isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 50);
    } else {
      // Si no estaba playing, forzar un re-render para aplicar los offsets
      setTracks([...updatedTracks]);
    }
  
    // 4. Actualizar scroll
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollLeft = selectedTimeGlobal * pixelsPerSecond;
    }
  };




  
  /*export const restartTracks = async (
    audioContextRef,
    tracksRef,
    currentTime,
    setIsPlaying,
    isPlayingRef,
    startTimeRef,
    filterNodesRef,
    setCurrentTime,
    scrollContainerRef
  ) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
  
    
    console.log(isPlayingRef.current);
    console.log(tracksRef);
    
    
    if (isPlayingRef.current) {
      isPlayingRef.current = false
      
      //handleStop(setIsPlaying, setCurrentTime, tracksRef, scrollContainerRef, filterNodesRef);
    }
  };*/