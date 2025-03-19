// handlePlayPause.js
export const handlePlayPause = async (audioContextRef, tracks, currentTime, setIsPlaying, isPlaying, startTimeRef) => {
    const ctx = audioContextRef.current;
    
    if (ctx.state === "suspended") await ctx.resume();
  
    if (!isPlaying) {
      startTimeRef.current = audioContextRef.current.currentTime - currentTime;
    }
  
    tracks.forEach(track => {
      if (track.sourceNode && track.isPlaying) {
        try {
          track.sourceNode.stop();
        } catch (error) {
          console.warn("Error stopping node:", error);
        }
        track.sourceNode.disconnect();
      }
  
      if (!isPlaying) {
        track.sourceNode = ctx.createBufferSource();
        track.sourceNode.buffer = track.audioBuffer;
        track.sourceNode.connect(track.gainNode);
        track.sourceNode.start(0, Math.min(currentTime, track.duration));
        track.sourceNode.onended = () => {
          track.isPlaying = false;
          track.sourceNode = null;
        };
      }
  
      track.isPlaying = !isPlaying;
    });
  
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
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunks, { type: "audio/webm; codecs=opus" });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
  
        const audio = new Audio(URL.createObjectURL(blob));
        audio.style.display = "none";
        document.body.appendChild(audio);
  
        const pannerNode = audioContextRef.current.createStereoPanner();
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(pannerNode).connect(audioContextRef.current.destination);
  
        stream.getTracks().forEach((track) => track.stop());
  
        setTracks((prev) => [
          ...prev,
          {
            id: Date.now(),
            url: URL.createObjectURL(blob),
            audio,
            duration: audioBuffer.duration,
            audioBuffer,
            pannerNode,
            volume: 1,
            panning: 0,
            muted: false,
            name: `Track ${prev.length + 1}`,
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
    selectedTime,
    tracks,
    isPlaying,
    scrollContainerRef,
    setCurrentTime,
    pixelsPerSecond
  ) => {
    const container = scrollContainerRef.current;
    if (!container) return;
  
    const maxScroll = container.scrollWidth - container.offsetWidth;
    const scrollPosition = Math.min(selectedTime * pixelsPerSecond, maxScroll);
  
    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  
    tracks.forEach((track) => {
      if (track.audio) {
        track.audio.currentTime = selectedTime;
        if (isPlaying) track.audio.play();
      }
    });
  
    setCurrentTime(selectedTime);
  };