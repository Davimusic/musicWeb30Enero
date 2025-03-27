const createNewTrack = (setTracks, audioBuffer, audioContextRef, tracks) =>{
    const newTrack = {
      id: Date.now(),
      audioBuffer, // <--- Usar el audioBuffer decodificado
      gainNode: audioContextRef.current.createGain(),
      pannerNode: audioContextRef.current.createStereoPanner(),
      duration: audioBuffer.duration, // <--- Duración real del audio
      volume: 1,
      panning: 0,
      muted: false,
      name: `Track ${tracks.length + 1}`,
      sourceNode: null,
      startTime: 0,
      offset: 0,
      filters: [],
      backgroundColorTrack: 'gold'
    };

    setTracks((prev) => [...prev, newTrack]);
}

export default createNewTrack