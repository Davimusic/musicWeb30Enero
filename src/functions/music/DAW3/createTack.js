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


/*/ Modificar la creación de tracks de batería
export const createDrumMachineTrack = (setTracks, tracks, audioContextRef, subdivisionsPerPulse = 4) => {
  // Configuración básica del track de batería
  const drumMachineTrack = {
    id: `drum-machine-${Date.now()}`,
    name: "Drum Machine",
    type: "drumMachine",
    backgroundColorTrack: "#4a4a4a",
    volume: 0.7,
    muted: false,
    solo: false,
    startTime: 0,
    // Configuración de patrones rítmicos
    drumPattern: {
      subdivisionsPerPulse,
      pulsesPerMeasure: 4,
      measures: 10,
      // 88 sonidos posibles (como los DAWs profesionales)
      soundBank: Array(88).fill(null).map((_, i) => ({
        id: i,
        name: `Sound ${i + 1}`,
        active: false,
        // Esto se reemplazaría con samples reales en una implementación real
        audioBuffer: null
      })),
      // Patrones por defecto (matriz de pasos)
      patterns: Array(16).fill(null).map((_, patternIndex) => ({
        id: patternIndex,
        name: `Pattern ${patternIndex + 1}`,
        steps: Array(subdivisionsPerPulse * 4 * 4).fill(null).map((_, stepIndex) => ({
          id: stepIndex,
          activeSounds: []
        }))
      })),
      currentPattern: 0
    },
    // Esto es necesario para la compatibilidad con el sistema de tracks existente
    audioBuffer: null,
    sourceNode: null,
    isPlaying: false
  };

  // Agregar el track a la lista
  setTracks([...tracks, drumMachineTrack]);

  // En una implementación real, aquí cargaríamos los samples de batería
  // loadDrumSamples(audioContextRef, drumMachineTrack.id);
};*/

export const createDrumMachineTrack = (setTracks, tracks, audioContextRef, subdivisionsPerPulse = 4) => {
  // Definimos los sonidos básicos de batería
  const DRUM_SOUNDS = [
    { id: 0, name: "Kick", key: "kick" },
    { id: 1, name: "Snare", key: "snare" },
    { id: 2, name: "Hi-Hat", key: "hihat" },
    { id: 3, name: "Clap", key: "clap" }
  ];

  const drumMachineTrack = {
    id: `drum-machine-${Date.now()}`,
    name: "Drum Machine",
    type: "drumMachine",
    volume: 0.7,
    muted: false,
    solo: false,
    drumPattern: {
      BPM: 120,
      subdivisions: subdivisionsPerPulse,
      currentPattern: 0,
      patterns: [{
        id: 0,
        name: "Pattern 1",
        steps: Array(16).fill().map(() => ({
          activeSounds: []
        }))
      }]
    },
    // Configuración visual (opcional)
    visualConfig: {
      rows: DRUM_SOUNDS.length,
      colors: {
        kick: "#FF6B6B",
        snare: "#4ECDC4",
        hihat: "#45B7D1",
        clap: "#FFBE0B"
      }
    }
  };

  setTracks([...tracks, drumMachineTrack]);

  // Cargar samples (implementación opcional)
  // loadDrumSamples(audioContextRef, drumMachineTrack.id);
};










