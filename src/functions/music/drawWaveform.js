import { createFilterNode } from "./DAW2/audioHandlers";

export const drawWaveform = (
  canvas,
  audioBuffer,
  pixelsPerSecond,
  track,
  setTracks,
  waveformColor = "#2196F3",
  clipColor = "#FF0000"
) => {
  if (!canvas || !audioBuffer) return;

  const ctx = canvas.getContext("2d");
  const { duration, numberOfChannels: numChannels } = audioBuffer;
  const totalWidth = duration * pixelsPerSecond;
  const height = canvas.height;

  // Configurar canvas
  canvas.width = totalWidth + track.startTime * pixelsPerSecond;
  canvas.style.width = `${canvas.width}px`;
  ctx.clearRect(0, 0, canvas.width, height);

  // Crear contexto offline para procesar con filtros
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: numChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
  });

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  let lastNode = source;
  if (track.filters?.length > 0) {
    track.filters.forEach((filter) => {
      const filterNode = createFilterNode(offlineContext, filter);
      lastNode.connect(filterNode);
      lastNode = filterNode;
    });
  }
  lastNode.connect(offlineContext.destination);
  source.start(0);

  offlineContext
    .startRendering()
    .then((renderedBuffer) => {
      const sampleRate = renderedBuffer.sampleRate;
      const clipTimesSet = new Set();
      for (let channel = 0; channel < numChannels; channel++) {
        const data = renderedBuffer.getChannelData(channel);
        for (let i = 0; i < data.length; i++) {
          if (Math.abs(data[i]) >= 1.0) {
            clipTimesSet.add(i / sampleRate);
          }
        }
      }
      const clipTimes = Array.from(clipTimesSet).sort((a, b) => a - b);

      if (JSON.stringify(track.clipTimes) !== JSON.stringify(clipTimes)) {
        setTracks((prevTracks) =>
          prevTracks.map((t) =>
            t.id === track.id ? { ...t, clipTimes } : t
          )
        );
      }

      // Calcular picos de forma segura (sin desbordar la pila)
      const peaks = [];
      for (let channel = 0; channel < numChannels; channel++) {
        const data = renderedBuffer.getChannelData(channel);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const absVal = Math.abs(data[i]);
          if (absVal > peak) peak = absVal;
        }
        peaks[channel] = peak || 1; // Evitar división por cero
      }

      const channelHeight = numChannels === 2 ? height / 2 : height;
      const verticalScale = (channelHeight * 0.6) / Math.max(...peaks);
      const displayColor = waveformColor;

      // Dibujar forma de onda
      for (let channel = 0; channel < numChannels; channel++) {
        const data = renderedBuffer.getChannelData(channel);
        const yCenter =
          numChannels === 2
            ? channel === 0
              ? channelHeight / 2
              : channelHeight * 1.5
            : height / 2;

        ctx.beginPath();
        ctx.strokeStyle = displayColor;
        ctx.lineWidth = 1;

        for (let x = 0; x < totalWidth; x++) {
          const startTime = x / pixelsPerSecond;
          const endTime = (x + 1) / pixelsPerSecond;
          const startSample = Math.floor(startTime * sampleRate);
          const endSample = Math.ceil(endTime * sampleRate);

          let max = -Infinity;
          let min = Infinity;
          let hasClip = false;
          for (let i = startSample; i < endSample && i < data.length; i++) {
            max = Math.max(max, data[i]);
            min = Math.min(min, data[i]);
            if (Math.abs(data[i]) >= 1.0) hasClip = true;
          }

          const yMax = yCenter - max * verticalScale;
          const yMin = yCenter - min * verticalScale;
          const xPos = x + track.startTime * pixelsPerSecond;

          if (hasClip) {
            ctx.stroke(); // Cierra el trazo actual
            ctx.beginPath();
            ctx.strokeStyle = clipColor;
            ctx.lineWidth = 1.5;
            ctx.moveTo(xPos, yMax);
            ctx.lineTo(xPos, yMin);
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = displayColor;
            ctx.lineWidth = 1;
          } else {
            ctx.moveTo(xPos, yMax);
            ctx.lineTo(xPos, yMin);
          }
        }
        ctx.stroke();
      }
    })
    .catch((error) => {
      console.error("Error al renderizar el audio:", error);
    });
};










/*import { createFilterNode } from "./DAW2/audioHandlers";

export const drawWaveform = (canvas, audioBuffer, pixelsPerSecond, track, waveformColor = "#2196F3", clipColor = "#FF0000") => {

  console.log(waveformColor);
  
  if (!canvas || !audioBuffer) return;

  const ctx = canvas.getContext("2d");
  const { duration, numberOfChannels: numChannels } = audioBuffer;
  const totalWidth = duration * pixelsPerSecond;
  const height = canvas.height;

  // Configuración inicial
  canvas.width = totalWidth + track.startTime * pixelsPerSecond;
  canvas.style.width = `${canvas.width}px`;
  ctx.clearRect(0, 0, canvas.width, height);

  // Procesar audio
  const offlineContext = new OfflineAudioContext({
    numberOfChannels: numChannels,
    length: audioBuffer.length,
    sampleRate: audioBuffer.sampleRate,
  });

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;

  // Aplicar filtros
  let lastNode = source;
  if (track.filters?.length > 0) {
    track.filters.forEach(filter => {
      const filterNode = createFilterNode(offlineContext, filter);
      lastNode.connect(filterNode);
      lastNode = filterNode;
    });
  }
  lastNode.connect(offlineContext.destination);
  source.start(0);

  offlineContext.startRendering().then(renderedBuffer => {
    // 1. Calcular picos máximos y clipping
    let hasGlobalClip = false;
    const peaks = [];
    const clippingMaps = [];
    
    for (let channel = 0; channel < numChannels; channel++) {
      const data = renderedBuffer.getChannelData(channel);
      let peak = 0;
      clippingMaps[channel] = new Array(data.length).fill(false);
      
      for (let i = 0; i < data.length; i++) {
        const absValue = Math.abs(data[i]);
        if (absValue > peak) peak = absValue;
        if (absValue >= 1.0) {
          clippingMaps[channel][i] = true;
          hasGlobalClip = true;
        }
      }
      peaks[channel] = peak || 1; // Evitar división por cero
    }

    // 2. Configurar parámetros visuales
    const channelHeight = numChannels === 2 ? height / 2 : height;
    const verticalScale = channelHeight * 0.6 / Math.max(...peaks);
    const displayColor = waveformColor;//hasGlobalClip ? clipColor : waveformColor;
    
    // 3. Dibujar cada canal
    for (let channel = 0; channel < numChannels; channel++) {
      const data = renderedBuffer.getChannelData(channel);
      const samplesPerPixel = data.length / totalWidth;
      const yCenter = numChannels === 2 ? 
        (channel === 0 ? channelHeight / 2 : channelHeight * 1.5) : 
        height / 2;

      // Dibujar forma de onda principal
      ctx.beginPath();
      ctx.strokeStyle = displayColor;
      ctx.lineWidth = 1;

      for (let x = 0; x < totalWidth; x++) {
        const startSample = Math.floor(x * samplesPerPixel);
        const endSample = Math.floor((x + 1) * samplesPerPixel);
        
        let max = -Infinity;
        let min = Infinity;
        let hasClip = false;

        // Calcular valores extremos
        for (let i = startSample; i < endSample && i < data.length; i++) {
          max = Math.max(max, data[i]);
          min = Math.min(min, data[i]);
          if (clippingMaps[channel][i]) hasClip = true;
        }

        // Aplicar escalado
        const yMax = yCenter - (max * verticalScale);
        const yMin = yCenter - (min * verticalScale);

        // Dibujar línea principal
        ctx.moveTo(x + track.startTime * pixelsPerSecond, yMax);
        ctx.lineTo(x + track.startTime * pixelsPerSecond, yMin);

        // Resaltar clipping si existe
        if (hasClip && hasGlobalClip) {
          ctx.stroke();
          ctx.beginPath();
          ctx.strokeStyle = clipColor;
          ctx.lineWidth = 1.5;
          ctx.moveTo(x + track.startTime * pixelsPerSecond, yMax);
          ctx.lineTo(x + track.startTime * pixelsPerSecond, yMin);
          ctx.stroke();
          ctx.beginPath();
          ctx.strokeStyle = displayColor;
          ctx.lineWidth = 1;
        }
      }
      ctx.stroke();
    }

  }).catch(console.error);
};

export default drawWaveform;*/


