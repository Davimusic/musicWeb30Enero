import React, { useEffect, useRef, useState } from 'react';

const AudioLevelMeter = ({ analyser, volume, muted }) => {
  const canvasRef = useRef(null);
  const [clipping, setClipping] = useState(false);
  const animationRef = useRef(null);
  const lastUpdate = useRef(0);

  useEffect(() => {
    

    // Configuración óptima del analyser
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    
    const ctx = canvasRef.current.getContext('2d');
    const WIDTH = canvasRef.current.width;
    const HEIGHT = canvasRef.current.height;
    const dataArray = new Float32Array(analyser.frequencyBinCount);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      // Limitar actualizaciones a 60fps máximo
      const now = Date.now();
      if (now - lastUpdate.current < 16) return; // ~60fps
      lastUpdate.current = now;

      // Obtener datos de audio
      analyser.getFloatTimeDomainData(dataArray);
      
      // Calcular niveles
      let sum = 0;
      let peak = 0;
      let clipCount = 0;
      
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] || 0; // Protección contra NaN
        const absValue = Math.abs(value);
        sum += value * value;
        peak = Math.max(peak, absValue);
        if (absValue >= 0.99) clipCount++;
      }

      const rms = Math.sqrt(sum / dataArray.length) || 0;
      const scaledLevel = Math.min(1, rms * 2); // Ajuste visual

      // Actualizar estado de clipping
      setClipping(clipCount > 10);

      // Dibujar medidor
      drawMeter(ctx, WIDTH, HEIGHT, scaledLevel, peak, clipping);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, clipping]);

  const drawMeter = (ctx, width, height, level, peak, isClipping) => {
    ctx.clearRect(0, 0, width, height);
    
    // Fondo
    ctx.fillStyle = muted ? '#444' : '#222';
    ctx.fillRect(0, 0, width, height);
    
    // Barra de nivel
    const barWidth = width * level;
    ctx.fillStyle = isClipping ? '#f00' : 
                   level > 0.8 ? '#ff8c00' : 
                   level > 0.5 ? '#ffd700' : '#0f0';
    ctx.fillRect(0, 0, barWidth, height);
    
    // Indicador de peak
    const peakPos = width * peak;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(peakPos - 1, 0, 2, height);
    
    // Texto de clipping
    if (isClipping) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CLIP', width / 2, height - 4);
    }
    
    // Texto de mute
    if (muted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MUTE', width / 2, height / 2 + 4);
    }
  };

  return (
    <div style={{ 
      display: 'inline-block',
      margin: '0 4px',
      verticalAlign: 'middle'
    }}>
      <canvas
        ref={canvasRef}
        width={100}
        height={16}
        style={{
          display: 'block',
          borderRadius: '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}
      />
    </div>
  );
};

export default AudioLevelMeter;






/*import { useEffect, useRef } from 'react';

const AudioLevelMeter = ({ mediaStream, audioContext }) => {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  useEffect(() => {
    if (audioContext && mediaStream && !analyserRef.current) {
      // Crear el AnalyserNode
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;

      // Conectar el MediaStream al AnalyserNode
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyserRef.current);

      // Crear el arreglo de datos
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }
  }, [audioContext, mediaStream]);

  useEffect(() => {
    const draw = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Limpiar el canvas
      ctx.clearRect(0, 0, width, height);

      // Dibujar la barra del nivel
      const level = Math.max(...dataArrayRef.current) / 256; // Normalizar entre 0 y 1
      ctx.fillStyle = level > 0.8 ? '#e74c3c' : '#27ae60';
      ctx.fillRect(0, 0, width * level, height);

      requestAnimationFrame(draw);
    };

    // Iniciar animación
    draw();
  }, []);

  return (
    <canvas ref={canvasRef} width={200} height={30} style={{ background: '#2d3436', borderRadius: '4px' }} />
  );
};

export default AudioLevelMeter;*/
