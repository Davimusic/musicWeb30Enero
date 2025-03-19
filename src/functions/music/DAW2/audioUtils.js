export const PIXELS_PER_SECOND = 100;

export const createTrack = async (file, audioContext, tracks) => {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    // Crear nodos de Web Audio API
    const gainNode = audioContext.createGain();
    const pannerNode = audioContext.createStereoPanner();
    const sourceNode = audioContext.createBufferSource();
    
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode).connect(pannerNode).connect(audioContext.destination);
  
    return {
      id: Date.now(),
      audioBuffer,
      sourceNode,
      gainNode,
      pannerNode,
      duration: audioBuffer.duration,
      volume: 1,
      panning: 0,
      muted: false,
      name: `Track ${tracks.length + 1}`,
      startTime: 0,  // Nuevo: Tiempo de inicio de reproducción
      offset: 0      // Nuevo: Offset de reproducción
    };
  };


export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};