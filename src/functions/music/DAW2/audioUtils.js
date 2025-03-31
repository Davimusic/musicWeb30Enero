//export const PIXELS_PER_SECOND = 40;

export let PIXELS_PER_SECOND = 40;

export const setPixelsPerSecond = (value) => {
  PIXELS_PER_SECOND = value;
};




  export const createTrack = async (file, audioContext, tracks) => {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    // Crear nodos
    const gainNode = audioContext.createGain();
    const pannerNode = audioContext.createStereoPanner();
  
    // Conectar la cadena de audio
    gainNode.connect(pannerNode).connect(audioContext.destination);
  
    return {
      id: Date.now(),
      audioBuffer,
      gainNode,
      pannerNode,
      duration: audioBuffer.duration,
      volume: 1,
      panning: 0,
      muted: false,
      name: `Track ${tracks.length + 1}`,
      sourceNode: null,
      startTime: 0,
      offset: 0,
      filters: [],
      audioContext
    };
  };

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};