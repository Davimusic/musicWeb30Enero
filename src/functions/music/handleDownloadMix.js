// Función para mezclar y descargar las pistas
const handleDownloadMix = async (tracks) => {
    console.log('descarga');
    
    if (tracks.length === 0) {
      alert("No hay pistas para mezclar.");
      return;
    }
  
    try {
      const sampleRate = 44100; // Tasa de muestreo estándar
      const totalDuration = Math.max(...tracks.map((t) => t.duration)); // Duración máxima entre las pistas
      const totalSamples = Math.ceil(totalDuration * sampleRate); // Duración en muestras
  
      // Crear un contexto de audio offline
      const offlineContext = new OfflineAudioContext({
        numberOfChannels: 2, // Estéreo
        length: totalSamples,
        sampleRate: sampleRate,
      });
  
      // Conectar cada pista al contexto offline
      tracks.forEach((track) => {
        if (!track.audioBuffer) {
          console.warn("Track sin audioBuffer:", track.id);
          return;
        }
  
        // Crear un nodo de fuente para el audio
        const source = offlineContext.createBufferSource();
        source.buffer = track.audioBuffer;
  
        // Configurar el volumen
        const gainNode = offlineContext.createGain();
        gainNode.gain.value = track.muted ? 0 : track.volume;
  
        // Configurar el paneo (panning)
        const pannerNode = offlineContext.createStereoPanner();
        pannerNode.pan.value = track.panning / 50;
  
        // Conectar los nodos
        source.connect(gainNode).connect(pannerNode).connect(offlineContext.destination);
        source.start(0); // Iniciar la reproducción en el tiempo 0
      });
  
      // Renderizar el audio mezclado
      const renderedBuffer = await offlineContext.startRendering();
      console.log("Mezcla renderizada:", renderedBuffer);
  
      // Convertir el AudioBuffer a un archivo WAV
      const wavBlob = bufferToWav(renderedBuffer);
      console.log("Archivo WAV creado:", wavBlob);
  
      // Crear un enlace de descarga
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mezcla-${Date.now()}.wav`; // Nombre del archivo
      document.body.appendChild(a);
      a.click(); // Simular clic en el enlace
      document.body.removeChild(a); // Eliminar el enlace
      URL.revokeObjectURL(url); // Liberar memoria
  
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