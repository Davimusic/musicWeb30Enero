export const createNewTrack = (setTracks, audioBuffer, audioContextRef, tracks, audioNodesRef) => {
  const trackId = Date.now().toString();
  
  const ctx = audioContextRef.current;
  const gainNode = ctx.createGain();
  const pannerNode = ctx.createStereoPanner();

  // Configuración inicial
  gainNode.gain.value = 1; // Volumen inicial
  pannerNode.pan.value = 0; // Panorama centrado

  // Conexión básica
  gainNode.connect(pannerNode);
  pannerNode.connect(ctx.destination);

  // Almacenar los nodos en audioNodesRef
  audioNodesRef.current[trackId] = {
    gainNode,
    pannerNode,
    context: ctx,
    lastVolume: 1 // Valor inicial de volumen
  };

  const newTrack = {
    id: trackId,
    audioBuffer,
    duration: audioBuffer.duration,
    volume: 100,//en web audio api es de 0 a 100
    panning: 0,
    muted: false,
    name: `Track ${tracks.length + 1}`,
    startTime: 0,
    offset: 0,
    filters: [],
    backgroundColorTrack: 'gold',
    // No almacenamos los nodos aquí, solo en audioNodesRef
    sourceNode: null
  };

  setTracks((prev) => [...prev, newTrack]);
  return trackId;
}

export default createNewTrack;