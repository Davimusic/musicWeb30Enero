export const createNewTrack = (setTracks, audioBuffer, audioContextRef, tracks, audioNodesRef, tempTrackId = null) => {
  // Usar el tempTrackId si existe, o crear uno nuevo
  const trackId = tempTrackId || Date.now().toString();
  const ctx = audioContextRef.current;

  if (!ctx) {
    console.error("AudioContext no disponible al crear track");
    return null;
  }

  try {
    const gainNode = ctx.createGain();
    const pannerNode = ctx.createStereoPanner();
    const analyser = ctx.createAnalyser();

    gainNode.gain.value = 1;
    pannerNode.pan.value = 0;

    audioNodesRef.current[trackId] = {
      gainNode,
      pannerNode,
      analyser,
      context: ctx,
      lastVolume: 1,
      sourceNode: null
    };

    const newTrack = {
      id: trackId,
      audioBuffer,
      duration: audioBuffer?.duration || 0,
      volume: 100,
      panning: 0,
      muted: false,
      name: `Track ${tracks.length + 1}`,
      startTime: 0,
      offset: 0,
      filters: [],
      backgroundColorTrack: 'gold',
      isLoading: !!tempTrackId // Marcar si es un track temporal
    };

    setTracks(prev => [...prev, newTrack]);
    return trackId;

  } catch (error) {
    console.error("Error al crear nuevo track:", error);
    return null;
  }
};