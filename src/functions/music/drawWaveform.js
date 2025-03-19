export const drawWaveform = (canvas, audioBuffer, pixelsPerSecond) => {
    if (!canvas || !audioBuffer) return;
  
    const ctx = canvas.getContext("2d");
    const data = audioBuffer.getChannelData(0);
    const duration = audioBuffer.duration;
    const totalWidth = duration * pixelsPerSecond;
    const height = canvas.height;
    const centerY = height / 2;
  
    canvas.width = totalWidth;
    canvas.style.width = `${totalWidth}px`;
    ctx.clearRect(0, 0, totalWidth, height);
  
    const sampleRate = audioBuffer.sampleRate;
    const totalSamples = data.length;
    const samplesPerPixel = sampleRate / pixelsPerSecond;
  
    ctx.beginPath();
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 1;
  
    for (let x = 0; x < totalWidth; x++) {
      const startSample = Math.floor(x * samplesPerPixel);
      const endSample = Math.min(Math.floor((x + 1) * samplesPerPixel), totalSamples - 1);
  
      if (startSample >= totalSamples) break;
  
      let max = -Infinity;
      let min = Infinity;
      for (let i = startSample; i <= endSample; i++) {
        const value = data[i];
        max = Math.max(max, value);
        min = Math.min(min, value);
      }
  
      const yMax = centerY - max * centerY;
      const yMin = centerY - min * centerY;
  
      ctx.moveTo(x, yMax);
      ctx.lineTo(x, yMin);
    }
  
    ctx.stroke();
  
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(33, 150, 243, 0.2)");
    gradient.addColorStop(1, "rgba(33, 150, 243, 0.05)");
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillRect(0, 0, totalWidth, height);
  };

  export default drawWaveform






/*const drawWaveform = (canvas, audioBuffer, pixelsPerSecond) => {
    if (!canvas || !audioBuffer) return;
  
    const ctx = canvas.getContext("2d");
    const data = audioBuffer.getChannelData(0); // Datos del canal de audio
    const duration = audioBuffer.duration; // Duración del audio en segundos
    const totalWidth = duration * pixelsPerSecond; // Ancho total basado en la relación 1:1
    const height = canvas.height; // Altura del canvas
    const centerY = height / 2; // Centro vertical del canvas
  
    // Ajustar el ancho del canvas
    canvas.width = totalWidth;
    canvas.style.width = `${totalWidth}px`;
  
    // Limpiar el canvas antes de dibujar
    ctx.clearRect(0, 0, totalWidth, height);
  
    // Calcular muestras por píxel
    const sampleRate = audioBuffer.sampleRate; // Tasa de muestreo del audio
    const totalSamples = data.length; // Número total de muestras
    const samplesPerPixel = sampleRate / pixelsPerSecond; // Muestras por píxel
  
    // Configurar estilo de la onda
    ctx.beginPath();
    ctx.strokeStyle = "#2196f3"; // Color azul
    ctx.lineWidth = 1; // Grosor de la línea
  
    // Dibujar la onda
    for (let x = 0; x < totalWidth; x++) {
      const startSample = Math.floor(x * samplesPerPixel); // Muestra inicial del bloque
      const endSample = Math.min(
        Math.floor((x + 1) * samplesPerPixel),
        totalSamples - 1 // Evitar sobrepasar el array
      );
  
      // Si no hay más muestras, terminar el dibujo
      if (startSample >= totalSamples) break;
  
      // Encontrar los valores máximo y mínimo en el bloque actual
      let max = -Infinity;
      let min = Infinity;
      for (let i = startSample; i <= endSample; i++) {
        const value = data[i];
        max = Math.max(max, value);
        min = Math.min(min, value);
      }
  
      // Convertir los valores a coordenadas Y
      const yMax = centerY - max * centerY; // Valor máximo en Y
      const yMin = centerY - min * centerY; // Valor mínimo en Y
  
      // Dibujar la línea vertical
      ctx.moveTo(x, yMax);
      ctx.lineTo(x, yMin);
    }
  
    // Renderizar la onda
    ctx.stroke();
  
    // Dibujar fondo degradado (opcional)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(33, 150, 243, 0.2)"); // Azul claro
    gradient.addColorStop(1, "rgba(33, 150, 243, 0.05)"); // Azul muy transparente
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "destination-over"; // Dibujar detrás de la onda
    ctx.fillRect(0, 0, totalWidth, height);
  
    // Debug: Mostrar parámetros de renderizado
    console.log("Datos de renderizado:");
    console.log("Duración del audio:", duration, "segundos");
    console.log("Píxeles por segundo:", pixelsPerSecond);
    console.log("Ancho total del canvas:", totalWidth, "px");
    console.log("Muestras totales:", totalSamples);
    console.log("Muestras por píxel:", samplesPerPixel);
  };
  
  export default drawWaveform;*/