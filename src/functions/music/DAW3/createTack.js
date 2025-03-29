export const createNewTrack = (
  setTracks, 
  audioBuffer, 
  audioContextRef, 
  tracks, 
  audioNodesRef,
  tempTrackId = null // Nuevo parámetro opcional
) => {
  const trackId = tempTrackId || Date.now().toString(); // Usa tempTrackId si existe
  
  const ctx = audioContextRef.current;
  const gainNode = ctx.createGain();
  const pannerNode = ctx.createStereoPanner();

  // Configuración inicial (sin cambios)
  gainNode.gain.value = 1;
  pannerNode.pan.value = 0;

  // Conexión básica (sin cambios)
  gainNode.connect(pannerNode);
  pannerNode.connect(ctx.destination);

  // Almacenar los nodos (sin cambios)
  audioNodesRef.current[trackId] = {
    gainNode,
    pannerNode,
    context: ctx,
    lastVolume: 1
  };

  const newTrack = {
    id: trackId,
    audioBuffer,
    duration: audioBuffer.duration,
    volume: 100,
    panning: 0,
    muted: false,
    name: `Track ${tracks.length + 1}`,
    startTime: 0,
    offset: 0,
    filters: [],
    backgroundColorTrack: 'gold',
    sourceNode: null
  };

  setTracks((prev) => [...prev, newTrack]);
  return trackId;
};

export default createNewTrack;