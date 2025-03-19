export const PIXELS_PER_SECOND = 100;

export const createTrack = async (file, audioContext, tracks) => {
    const url = URL.createObjectURL(file);
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
    const audio = new Audio(url);
    audio.style.display = "none";
    document.body.appendChild(audio);
  
    const pannerNode = audioContext.createStereoPanner();
    const source = audioContext.createMediaElementSource(audio);
    source.connect(pannerNode).connect(audioContext.destination);
  
    return {
      id: Date.now(),
      url,
      audio,
      audioBuffer,
      pannerNode,
      duration: audioBuffer.duration,
      volume: 1,
      panning: 0,
      muted: false,
      name: `Track ${tracks.length + 1}`, // Usamos tracks.length para generar el nombre
    };
  };


export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};