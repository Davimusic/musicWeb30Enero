const drawWaveform = (canvas, audioBuffer, zoomLevel) => {
    if (!canvas || !audioBuffer) return;
  
    const ctx = canvas.getContext("2d");
    const data = audioBuffer.getChannelData(0); // Datos de audio
    const width = canvas.width; // Ancho del canvas (ya ajustado en el componente Track)
    const height = canvas.height;
    const centerY = height / 2;
  
    // Limpiar el canvas
    ctx.clearRect(0, 0, width, height);
  
    // Escalar la onda en función del zoom
    const totalSamples = data.length;
    const samplesPerPixel = totalSamples / width; // Muestras por píxel
  
    // Dibujar la forma de onda
    ctx.beginPath();
    ctx.moveTo(0, centerY);
  
    for (let x = 0; x < width; x++) {
      const start = Math.floor(x * samplesPerPixel);
      const end = Math.floor((x + 1) * samplesPerPixel);
      let sum = 0;
  
      // Calcular el promedio de amplitud para este segmento
      for (let i = start; i < end; i++) {
        sum += Math.abs(data[i] || 0);
      }
      const avg = sum / (end - start);
  
      // Escalar la amplitud en función del zoom
      const y = avg * centerY * zoomLevel; // Ajustar la amplitud con el zoom
      ctx.lineTo(x, centerY - y);
      ctx.lineTo(x, centerY + y);
    }
  
    // Estilo de la onda
    ctx.strokeStyle = "#2196f3"; // Color azul
    ctx.lineWidth = 1; // Grosor de la línea
    ctx.stroke();
  };
  
  export default drawWaveform;