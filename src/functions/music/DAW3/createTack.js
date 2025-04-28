export const createNewTrack = (
  setTracks,
  audioBuffer,
  audioContextRef,
  tracks,
  audioNodesRef,
  tempTrackId = null
) => {
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

    // Configuración óptima del Analyser para medición de niveles
    analyser.fftSize = 2048; // Tamaño adecuado para análisis de waveform
    analyser.smoothingTimeConstant = 0.8; // Suavizado moderado para lecturas estables
    analyser.minDecibels = -90;
    analyser.maxDecibels = 0;

    gainNode.gain.value = 1;
    pannerNode.pan.value = 0;

    // Conexión de nodos: source -> gain -> analyser -> panner -> destination
    gainNode.connect(analyser);
    analyser.connect(pannerNode);
    pannerNode.connect(ctx.destination);

    audioNodesRef.current[trackId] = {
      gainNode,
      pannerNode,
      analyser,
      context: ctx,
      lastVolume: 1,
      sourceNode: null,
      timeDomainData: new Float32Array(analyser.fftSize),
      frequencyData: new Uint8Array(analyser.frequencyBinCount)
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
      backgroundColorTrack: "#2bc6c8",
      isLoading: !!tempTrackId,
      lastPeakLevel: 0,
      lastRMSLevel: 0,
      clipping: false // Esta propiedad se actualizará cuando se detecten clips
    };

    setTracks(prev => [...prev, newTrack]);
    return trackId;
  } catch (error) {
    console.error("Error al crear nuevo track:", error);
    return null;
  }
};















