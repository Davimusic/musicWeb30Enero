/*export const handlePlayPause = async (audioContextRef, tracks, currentTime, setIsPlaying) => {
    try {
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
  
      const playPromises = tracks.map((track) => {
        if (!track.audio) return;
        track.audio.currentTime = currentTime;
        return track.audio.play();
      });
  
      await Promise.all(playPromises);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error general de reproducción:", error);
      setIsPlaying(false);
    }
  };
  
  export const handleStop = (setIsPlaying, setCurrentTime, tracks, scrollContainerRef) => {
    setIsPlaying(false);
    setCurrentTime(0);
    tracks.forEach((track) => {
      if (track.audio) {
        track.audio.pause();
        track.audio.currentTime = 0;
      }
    });
    if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
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
  };*/