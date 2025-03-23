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
    // Calcular la duración total incluyendo startTime
    const totalDuration = Math.max(...tracks.map((t) => t.startTime + t.duration)); 
    const totalSamples = Math.ceil(totalDuration * sampleRate);

    const offlineContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: totalSamples,
      sampleRate: sampleRate,
    });

    tracks.forEach((track) => {
      if (!track.audioBuffer) {
        console.warn("Track sin audioBuffer:", track.id);
        return;
      }

      const source = offlineContext.createBufferSource();
      source.buffer = track.audioBuffer;

      const gainNode = offlineContext.createGain();
      gainNode.gain.value = track.muted ? 0 : track.volume;

      const pannerNode = offlineContext.createStereoPanner();
      pannerNode.pan.value = track.panning / 50;

      // Aplicar los filtros en el mismo orden que en la reproducción
      let lastNode = source;
      lastNode.connect(gainNode).connect(pannerNode);

      if (track.filters && track.filters.length > 0) {
        track.filters.forEach((filter) => {
          const filterNode = createFilterNode(offlineContext, filter); // Crear el nodo de filtro
          lastNode.connect(filterNode); // Conectar el último nodo al filtro
          lastNode = filterNode; // Actualizar el último nodo
        });
      }

      // Conectar el último nodo al destino del contexto offline
      lastNode.connect(offlineContext.destination);

      // Iniciar en el startTime global y desde el offset del track
      source.start(track.startTime, track.offset); // <-- Línea corregida
    });

    const renderedBuffer = await offlineContext.startRendering();
    const wavBlob = bufferToWav(renderedBuffer);

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

// Función para convertir un AudioBuffer a un Blob WAV
const bufferToWav = (buffer) => {
  const numOfChan = buffer.numberOfChannels; // Número de canales (1 = mono, 2 = estéreo)
  const sampleRate = buffer.sampleRate; // Tasa de muestreo
  const length = buffer.length * numOfChan * 2 + 44; // Tamaño del archivo WAV
  const bufferArray = new ArrayBuffer(length); // Buffer para almacenar los datos
  const view = new DataView(bufferArray); // Vista para escribir los datos
  let pos = 0;

  // Escribir el encabezado WAV
  const writeString = (str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
    pos += str.length;
  };

  writeString("RIFF"); // ChunkID
  view.setUint32(pos, length - 8, true); // ChunkSize
  pos += 4;
  writeString("WAVE"); // Format
  writeString("fmt "); // Subchunk1ID
  view.setUint32(pos, 16, true); // Subchunk1Size
  pos += 4;
  view.setUint16(pos, 1, true); // AudioFormat (PCM)
  pos += 2;
  view.setUint16(pos, numOfChan, true); // NumChannels
  pos += 2;
  view.setUint32(pos, sampleRate, true); // SampleRate
  pos += 4;
  view.setUint32(pos, sampleRate * numOfChan * 2, true); // ByteRate
  pos += 4;
  view.setUint16(pos, numOfChan * 2, true); // BlockAlign
  pos += 2;
  view.setUint16(pos, 16, true); // BitsPerSample
  pos += 2;
  writeString("data"); // Subchunk2ID
  view.setUint32(pos, buffer.length * numOfChan * 2, true); // Subchunk2Size
  pos += 4;

  // Escribir los datos de audio
  const channels = [];
  for (let i = 0; i < numOfChan; i++) {
    channels.push(buffer.getChannelData(i)); // Obtener los datos de cada canal
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let chan = 0; chan < numOfChan; chan++) {
      const sample = Math.max(-1, Math.min(1, channels[chan][i])); // Limitar el valor entre -1 y 1
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true); // Convertir a 16 bits
      pos += 2;
    }
  }

  // Devolver el archivo WAV como un Blob
  return new Blob([bufferArray], { type: "audio/wav" });
};

export default handleDownloadMix;