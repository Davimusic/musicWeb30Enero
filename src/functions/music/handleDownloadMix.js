import { createFilterNode } from "./DAW2/audioHandlers";



const handleDownloadMix = async (tracks) => {
  console.log('descarga');
  console.log(tracks);

  if (tracks.length === 0) {
    alert("No hay pistas para mezclar.");
    return;
  }

  try {
    const sampleRate = 44100;
    // Calcular la duración total incluyendo startTime (ORIGINAL - CORRECTO)
    const totalDuration = Math.max(...tracks.map((t) => t.startTime + t.duration)); 
    const totalSamples = Math.ceil(totalDuration * sampleRate);

    const offlineContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: totalSamples,
      sampleRate: sampleRate,
    });

    // MODIFICACIÓN PRINCIPAL: Conexión correcta de nodos con filtros
    tracks.forEach((track) => {
      if (!track.audioBuffer) {
        console.warn("Track sin audioBuffer:", track.id);
        return;
      }

      const source = offlineContext.createBufferSource();
      source.buffer = track.audioBuffer;

      // 1. Nodo de volumen (CORRECCIÓN: normalizar a 0-1)
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = track.muted ? 0 : track.volume / 100;

      // 2. Nodo de pan (ORIGINAL - CORRECTO)
      const pannerNode = offlineContext.createStereoPanner();
      pannerNode.pan.value = track.panning / 50;

      // Cadena base (source -> gain -> pan)
      source.connect(gainNode);
      gainNode.connect(pannerNode);

      // 3. Conexión de filtros (MODIFICACIÓN CLAVE)
      let lastNode = pannerNode;

      if (track.filters && track.filters.length > 0) {
        track.filters.forEach((filter) => {
          const filterNode = createFilterNode(offlineContext, filter);
          lastNode.disconnect(offlineContext.destination); // Desconectar anterior
          lastNode.connect(filterNode);
          lastNode = filterNode;
        });
      }

      // Conexión final al destino (CON TODOS LOS EFECTOS APLICADOS)
      lastNode.connect(offlineContext.destination);

      // Iniciar reproducción (ORIGINAL - CORRECTO)
      source.start(track.startTime, track.offset);
    });

    // Renderizado y creación de WAV (ORIGINAL - CORRECTO)
    const renderedBuffer = await offlineContext.startRendering();
    const wavBlob = bufferToWav(renderedBuffer);

    // Descarga del archivo (ORIGINAL - CORRECTO)
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mezcla-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Descarga completada.");
  } catch (error) {
    console.error("Error al generar la mezcla:", error);
    alert("Error al crear la mezcla. Verifica la consola.");
  }
};

// Función bufferToWav (ORIGINAL - SIN MODIFICACIONES NECESARIAS)
const bufferToWav = (buffer) => {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  let pos = 0;

  const writeString = (str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
    pos += str.length;
  };

  writeString("RIFF");
  view.setUint32(pos, length - 8, true);
  pos += 4;
  writeString("WAVE");
  writeString("fmt ");
  view.setUint32(pos, 16, true);
  pos += 4;
  view.setUint16(pos, 1, true);
  pos += 2;
  view.setUint16(pos, numOfChan, true);
  pos += 2;
  view.setUint32(pos, sampleRate, true);
  pos += 4;
  view.setUint32(pos, sampleRate * numOfChan * 2, true);
  pos += 4;
  view.setUint16(pos, numOfChan * 2, true);
  pos += 2;
  view.setUint16(pos, 16, true);
  pos += 2;
  writeString("data");
  view.setUint32(pos, buffer.length * numOfChan * 2, true);
  pos += 4;

  const channels = [];
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let chan = 0; chan < numOfChan; chan++) {
      const sample = Math.max(-1, Math.min(1, channels[chan][i]));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      pos += 2;
    }
  }

  return new Blob([bufferArray], { type: "audio/wav" });
};





export default handleDownloadMix;