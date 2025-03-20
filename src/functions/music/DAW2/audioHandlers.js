// audioHandlers.js (handlePlayPause)
export const handlePlayPause = async (audioContextRef, tracks, currentTime, setIsPlaying, isPlaying, startTimeRef) => {
    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") await ctx.resume();
  
    if (!isPlaying) {
        startTimeRef.current = ctx.currentTime - currentTime;
        
        tracks.forEach(track => {
          if (track.sourceNode) {
            track.sourceNode.disconnect();
            try { track.sourceNode.stop(); } catch(e) {}
          }
          
          track.sourceNode = ctx.createBufferSource();
          track.sourceNode.buffer = track.audioBuffer;
          track.sourceNode.connect(track.gainNode);
          
          // Iniciar en el punto correcto
          track.sourceNode.start(0, currentTime % track.duration);
        });
      } else {
      tracks.forEach(track => {
        track.sourceNode?.stop();
        track.offset += ctx.currentTime - track.startTime;
      });
    }
  
    setIsPlaying(!isPlaying);
  };
  
  export const handleStop = (setIsPlaying, setCurrentTime, tracks, scrollContainerRef) => {
    const now = performance.now(); // Usamos tiempo de alta precisión
  
    tracks.forEach(track => {
      if (track.sourceNode && track.isPlaying) {
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
      // audioHandlers.js (handleRecord)
mediaRecorder.onstop = async () => {
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
        offset: 0
      }
    ]);
  };
  
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error al grabar:", error);
    }
  };

  export const handleTimeSelect = (selectedTime, tracks, scrollContainerRef, setCurrentTime, pixelsPerSecond) => {
    setCurrentTime(selectedTime);
    
    tracks.forEach(track => {
      track.offset = selectedTime;
      if (track.sourceNode) {
        track.sourceNode.stop();
        track.sourceNode = audioContextRef.current.createBufferSource();
        track.sourceNode.buffer = track.audioBuffer;
        track.sourceNode.connect(track.gainNode);
        track.sourceNode.start(0, selectedTime);
      }
    });
  
    if (scrollContainerRef.current) {
      const scrollPos = selectedTime * pixelsPerSecond;
      scrollContainerRef.current.scrollLeft = scrollPos;
    }
  };