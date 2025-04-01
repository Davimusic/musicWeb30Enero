import React, { useEffect, useRef, useState } from 'react';

const AudioLevelMeter = ({ analyser, volume, muted }) => {
  const canvasRef = useRef(null);
  const [showClip, setShowClip] = useState(false);
  const animationRef = useRef(null);
  const clipTimer = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    // Configuración del analyser
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;
    
    const ctx = canvasRef.current.getContext('2d');
    const WIDTH = canvasRef.current.width;
    const HEIGHT = canvasRef.current.height;
    const dataArray = new Float32Array(analyser.frequencyBinCount);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      // Obtener datos de audio
      analyser.getFloatTimeDomainData(dataArray);
      
      // Calcular niveles
      let sum = 0;
      let peak = 0;
      let clipCount = 0;
      
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] || 0;
        const absValue = Math.abs(value);
        sum += value * value;
        peak = Math.max(peak, absValue);
        if (absValue >= 0.99) clipCount++;
      }

      const rms = Math.sqrt(sum / dataArray.length) || 0;
      const scaledLevel = Math.min(1, rms * 2);

      // Manejo del clipping
      if (clipCount > 10) {
        // Reiniciar el temporizador si ya existe
        if (clipTimer.current) {
          clearTimeout(clipTimer.current);
        }
        
        // Mostrar mensaje y programar ocultación
        setShowClip(true);
        clipTimer.current = setTimeout(() => {
          setShowClip(false);
        }, 2000);
      }

      // Dibujar medidor
      drawMeter(ctx, WIDTH, HEIGHT, scaledLevel, peak);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (clipTimer.current) {
        clearTimeout(clipTimer.current);
      }
    };
  }, [analyser]);

  const drawMeter = (ctx, width, height, level, peak) => {
    ctx.clearRect(0, 0, width, height);
    
    // Fondo
    ctx.fillStyle = muted ? '#444' : '#222';
    ctx.fillRect(0, 0, width, height);
    
    // Barra de nivel
    const barWidth = width * level;
    ctx.fillStyle = level > 0.8 ? '#ff8c00' : 
                   level > 0.5 ? '#ffd700' : '#0f0';
    ctx.fillRect(0, 0, barWidth, height);
    
    // Indicador de peak
    const peakPos = width * peak;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(peakPos - 1, 0, 2, height);
    
    // Texto de mute
    if (muted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, height);
    }
  };

  return (
    <div style={{ 
      display: 'inline-block',
      margin: '0 4px',
      verticalAlign: 'middle',
      position: 'relative'
    }}>
      {/* Mensaje de clip que aparece por encima */}
      {showClip && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 10,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          CLIP
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        width={100}
        height={16}
        style={{
          display: 'block',
          borderRadius: '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
      />
      
      {/* Texto de mute (ahora en React en lugar de canvas) */}
      {muted && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}>
          MUTE
        </div>
      )}
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
