import React, { useEffect, useRef, useState } from "react";

const AudioLevelMeter = ({ analyser, muted, clipTimes, globalTime, isPlaying, tracks, trackId }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const clipTimeout = useRef(null);
    const [clipDetected, setClipDetected] = useState(false);
    const [smoothLevel, setSmoothLevel] = useState(0);
    const [isActive, setIsActive] = useState(true);


    useEffect(() => {
        const hasSoloTrack = tracks?.some(t => t.solo);
        const shouldBeActive = !hasSoloTrack || tracks?.find(t => t.id === trackId)?.solo;
        setIsActive(shouldBeActive);
    }, [tracks, trackId]);


    useEffect(() => {
        if (!analyser || !isActive) {
            // Si no está activo, resetear los estados
            setSmoothLevel(0);
            setClipDetected(false);
            return;
        }

        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.8;

        const ctx = canvasRef.current.getContext("2d");
        const WIDTH = canvasRef.current.width;
        const HEIGHT = canvasRef.current.height;
        const dataArray = new Float32Array(analyser.frequencyBinCount);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);

            analyser.getFloatTimeDomainData(dataArray);

            let peak = 0;
            let truePeakValue = 0;
            
            for (let i = 0; i < dataArray.length; i++) {
                const absVal = Math.abs(dataArray[i]);
                if (absVal > peak) peak = absVal;
                if (absVal > truePeakValue) truePeakValue = absVal;
            }

            // Visualización amplificada
            const displayLevel = Math.min(peak * 1.8, 1);
            
            setSmoothLevel(prev => {
                if (!isPlaying) return 0; // Reset inmediato al pausar
                const attack = displayLevel > prev ? 0.4 : 0.85;
                return prev * attack + displayLevel * (1 - attack);
            });

            // Detección de clipping solo si está activo
            const isClipping = truePeakValue >= 0.99 || 
                             (clipTimes?.some(t => Math.abs(globalTime - t) < 0.1));

            if (isClipping) {
                if (!clipDetected) {
                    setClipDetected(true);
                    clearTimeout(clipTimeout.current);
                    clipTimeout.current = setTimeout(() => {
                        setClipDetected(false);
                    }, 2000);
                }
            } else if (clipDetected) {
                clearTimeout(clipTimeout.current);
                setClipDetected(false);
            }
        };

        if (isPlaying && !muted) {
            draw();
        } else {
            setSmoothLevel(0);
            setClipDetected(false);
        }

        return () => {
            cancelAnimationFrame(animationRef.current);
            clearTimeout(clipTimeout.current);
        };
    }, [analyser, clipTimes, globalTime, isPlaying, clipDetected, muted, isActive]);

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const ctx = canvasRef.current.getContext("2d");
        const WIDTH = canvasRef.current.width;
        const HEIGHT = canvasRef.current.height;

        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        
        if (isActive && !muted && smoothLevel > 0) {
            const gradient = ctx.createLinearGradient(0, 0, WIDTH, 0);
            gradient.addColorStop(0, "#0f0");
            gradient.addColorStop(0.7, "#FFD700");
            gradient.addColorStop(0.95, "#FF4500");
            gradient.addColorStop(1, "#FF0000");

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, WIDTH * Math.pow(smoothLevel, 0.8), HEIGHT);
        } else {
            // Fondo diferente para activo/inactivo
            ctx.fillStyle = isActive ? "#333" : "#222";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }
    }, [smoothLevel, muted, isActive]);

    return (
        <div style={{
            height: "25px",
            width: "75px", // Ancho fijo para evitar cambios de layout
            position: "relative", // Contenedor relativo para los elementos absolutos
            opacity: isActive ? 1 : 0.5,
            transition: "opacity 0.3s ease, filter 0.3s ease", // Solo transicionar estas propiedades
            filter: isActive ? "none" : "grayscale(80%)",
        }}>
            <canvas
                ref={canvasRef}
                width={75}
                height={5}
                style={{
                    display: "block",
                    borderRadius: "3px",
                    background: isActive ? "#222" : "#111",
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0", // Ocupa todo el ancho del contenedor
                    opacity: muted ? 0.7 : 1,
                    transition: "opacity 0.3s ease, background 0.3s ease" // Solo propiedades que no afectan layout
                }}
            />
            
            {isActive && clipDetected && !muted && (
                <div style={{
                    position: "absolute",
                    top: "-15px",
                    left: "0",
                    right: "0", // Ocupa todo el ancho del contenedor
                    textAlign: "center",
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "18px",
                    textShadow: "0 0 3px white",
                    zIndex: 10,
                    animation: "flicker 1s infinite",
                    backgroundColor: 'white',
                    borderRadius: '3px'
                }}>
                    CLIP
                </div>
            )}
            
            {isActive && muted && (
                <div style={{
                    position: "absolute",
                    top: "-15px",
                    left: "0",
                    right: "0", // Ocupa todo el ancho del contenedor
                    textAlign: "center",
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "18px",
                    textShadow: "0 0 3px black",
                    zIndex: 10,
                    backgroundColor: 'white',
                    borderRadius: '3px'
                }}>
                    MUTED
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
