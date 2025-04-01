  import { createNewTrack } from "../DAW3/createTack";

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



