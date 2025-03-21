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






