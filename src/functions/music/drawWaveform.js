import { createFilterNode } from "./DAW2/audioHandlers";


export const drawWaveform = (canvas, audioBuffer, pixelsPerSecond, track) => {
  if (!canvas || !audioBuffer) return;

  const ctx = canvas.getContext("2d");
  const data = audioBuffer.getChannelData(0);
  const duration = audioBuffer.duration;
  const totalWidth = duration * pixelsPerSecond;
  const height = canvas.height;
  const centerY = height / 2;

  // Ajustar el ancho del canvas para incluir el espacio antes del startTime
  canvas.width = totalWidth + track.startTime * pixelsPerSecond;
  canvas.style.width = `${totalWidth + track.startTime * pixelsPerSecond}px`;
  ctx.clearRect(0, 0, canvas.width, height);

  const sampleRate = audioBuffer.sampleRate;
  const totalSamples = data.length;
  const samplesPerPixel = sampleRate / pixelsPerSecond;

  // Crear un nuevo AudioContext offline para procesar los filtros
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: 1,
    length: totalSamples,
    sampleRate: sampleRate,
  });

  // Crear un buffer source para el audio original
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Aplicar los filtros en el mismo orden que en la reproducción
  let lastNode = source;

  if (track.filters && track.filters.length > 0) {
    track.filters.forEach((filter) => {
      const filterNode = createFilterNode(offlineContext, filter);
      lastNode.connect(filterNode);
      lastNode = filterNode;
    });
  }

  // Conectar el último nodo al destino del contexto offline
  lastNode.connect(offlineContext.destination);

  // Iniciar la reproducción en el contexto offline
  source.start(0);

  // Procesar el audio con los filtros aplicados
  offlineContext.startRendering().then((renderedBuffer) => {
    const filteredData = renderedBuffer.getChannelData(0);

    // Dibujar la forma de onda filtrada
    ctx.beginPath();
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 1;

    for (let x = 0; x < totalWidth; x++) {
      const startSample = Math.floor(x * samplesPerPixel);
      const endSample = Math.min(startSample + Math.floor(samplesPerPixel), totalSamples - 1);

      if (startSample >= totalSamples) break;

      let max = -Infinity;
      let min = Infinity;
      for (let i = startSample; i <= endSample; i++) {
        const value = filteredData[i];
        max = Math.max(max, value);
        min = Math.min(min, value);
      }

      const yMax = centerY - max * centerY;
      const yMin = centerY - min * centerY;

      // Desplazar la onda según el startTime
      ctx.moveTo(x + track.startTime * pixelsPerSecond, yMax);
      ctx.lineTo(x + track.startTime * pixelsPerSecond, yMin);
    }

    ctx.stroke();

    // Aplicar un gradiente para mejorar la visualización
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(33, 150, 243, 0.2)");
    gradient.addColorStop(1, "rgba(33, 150, 243, 0.05)");
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillRect(0, 0, canvas.width, height);
  }).catch((error) => {
    console.error("Error al procesar el audio con filtros:", error);
  });
};

export default drawWaveform;



