import React, { useEffect, useRef, memo, useCallback } from "react";
import { drawWaveform } from "@/functions/music/drawWaveform";
import SubdivisionGrid from "@/functions/music/components/subdivisionGrid";
import useAudioEngine from "@/functions/music/DAW3/useAudioEngine";

const Track = memo(({ 
  track, 
  pixelsPerSecond, 
  onSelectTime, 
  tracks, 
  pixelsHeight, 
  setTracks, 
  totalElements, 
  openModal, 
  audioNodesRef, 
  currentTime, 
  isPlaying 
}) => {
  const canvasRef = useRef(null);
  const { 
    audioContextRef, 
    sequencerBuffers,
    scheduledEvents
  } = useAudioEngine();

  useEffect(() => {
    if (track.type !== "drumMachine" && track.audioBuffer) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      drawWaveform(
        canvas, 
        track.audioBuffer, 
        pixelsPerSecond, 
        track, 
        setTracks, 
        track.backgroundColorTrack
      );
    }
  }, [track, pixelsPerSecond, pixelsHeight]);

  const handleCellTrigger = useCallback((cellInfo) => {
    if (!audioContextRef.current || !isPlaying) return;
    
    const buffer = sequencerBuffers.current.get('kick');
    if (!buffer) return;

    const scheduleTime = audioContextRef.current.currentTime;
    const eventId = `${cellInfo.row}-${cellInfo.column}-${Math.floor(scheduleTime * 1000)}`;
    
    if (scheduledEvents.current.has(eventId)) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start(scheduleTime);
    
    scheduledEvents.current.add(eventId);
    source.onended = () => scheduledEvents.current.delete(eventId);
    
    console.log('Triggered:', cellInfo);
  }, [audioContextRef, isPlaying, sequencerBuffers, scheduledEvents]);

  const handleCanvasClick = (e) => {
    if (track.type === "drumMachine") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const stepWidth = (60 / 120) * pixelsPerSecond / track.drumPattern.subdivisionsPerPulse;
      const stepIndex = Math.floor(offsetX / stepWidth);
      console.log(`Step ${stepIndex} clicked in drum machine`);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !onSelectTime) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const startPixels = track.startTime * pixelsPerSecond;
    const effectiveOffsetX = Math.max(offsetX - startPixels, 0);
    const selectedTimeLocal = effectiveOffsetX / pixelsPerSecond;
    const selectedTimeGlobal = track.startTime + selectedTimeLocal;

    onSelectTime(selectedTimeGlobal);
  };

  const isSoloActive = tracks.some(t => t.solo);

  if (track.type === "drumMachine") {
    return (
      <div 
        className="track-container"
        style={{
          position: 'static',
          width: '100%',
          height: `${pixelsHeight}px`,
          marginBottom: '10px',
          paddingTop: `15px`,
          overflowY: 'auto'
        }}
      >
        <SubdivisionGrid
          PIXELS_PER_SECOND={pixelsPerSecond}
          pulsesPerMeasure={4}
          subdivisionsPerPulse={4}
          BPM={60}
          totalElements={8}
          rows={4}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onCellTrigger={handleCellTrigger}
        />
        
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }} 
          height={pixelsHeight} 
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleCanvasClick}
      style={{
        opacity: track.muted ? 0.5 : (isSoloActive && !track.solo ? 0.3 : 1),
      }}
    >
      <canvas ref={canvasRef} height={pixelsHeight} />
    </div>
  );
});

export default Track;








/*import React, { useEffect, useRef, memo, useCallback } from "react";
import { drawWaveform } from "@/functions/music/drawWaveform";
import SubdivisionGrid from "@/functions/music/components/subdivisionGrid";
import TrackControlsModal from "@/functions/music/components/trackControlsModel";

const Track = memo(({ track, pixelsPerSecond, onSelectTime, tracks, pixelsHeight, setTracks, totalElements, openModal, audioNodesRef, currentTime, isPlaying }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (track.type !== "drumMachine" && track.audioBuffer) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      drawWaveform(
        canvas, 
        track.audioBuffer, 
        pixelsPerSecond, 
        track, 
        setTracks, 
        track.backgroundColorTrack
      );
    }
  }, [track, pixelsPerSecond, pixelsHeight]);

  const handleCanvasClick = (e) => {
    if (track.type === "drumMachine") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      
      // Calcular el step clickeado basado en las subdivisiones
      const stepWidth = (60 / 120) * pixelsPerSecond / track.drumPattern.subdivisionsPerPulse;
      const stepIndex = Math.floor(offsetX / stepWidth);
      
      // Aquí manejarías la lógica para activar/desactivar el step
      console.log(`Step ${stepIndex} clicked in drum machine`);
      return;
    }

    // Lógica para tracks de audio normales
    const canvas = canvasRef.current;
    if (!canvas || !onSelectTime) return;

    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const startPixels = track.startTime * pixelsPerSecond;
    const effectiveOffsetX = Math.max(offsetX - startPixels, 0);
    const selectedTimeLocal = effectiveOffsetX / pixelsPerSecond;
    const selectedTimeGlobal = track.startTime + selectedTimeLocal;

    onSelectTime(selectedTimeGlobal);
  };

  const isSoloActive = tracks.some(t => t.solo);

  const handleCellTrigger = useCallback((cellInfo) => {
    const audio = new Audio('/uno.mp3'); // Accede directamente a la raíz
    audio.addEventListener('error', (e) => {
      console.error('Error al cargar el audio:', e);
    });

    audio.play().catch((error) => {
      console.error('Error de reproducción:', error);
    });
    
    console.log('Celda activada: ' + cellInfo);
    // Tu lógica adicional aquí
}, []);

  

  if (track.type === "drumMachine") {
    return (
      <div 
        className="track-container"
        style={{
          position: 'static',
          width: '100%',
          height: `${pixelsHeight}px`,
          marginBottom: '10px', // Ajusta según tu espaciado
          paddingTop: `15px`,
          overflowY: 'auto'
        }}
      >
        
  
        
        <SubdivisionGrid
    PIXELS_PER_SECOND={pixelsPerSecond}
    pulsesPerMeasure={4}
    subdivisionsPerPulse={4}
    BPM={60}
    totalElements={32}
    rows={4}
    currentTime={currentTime}
    isPlaying={isPlaying}
    onCellTrigger={handleCellTrigger}
  />
  
          
          {track.drumPattern.patterns[track.drumPattern.currentPattern].steps.map((step, i) => {
            if (step.activeSounds.length === 0) return null;
            
            const stepWidth = (60 / 120) * pixelsPerSecond / track.drumPattern.subdivisionsPerPulse;
            
            
          })}
  
          
          <canvas 
            ref={canvasRef} 
            style={{ display: 'none' }} 
            height={pixelsHeight} 
          />
        
      </div>
    );
  }

  return (
    <div
      onClick={handleCanvasClick}
      style={{
        opacity: track.muted ? 0.5 : (isSoloActive && !track.solo ? 0.3 : 1),
      }}
    >
    
      <canvas ref={canvasRef} height={pixelsHeight} />
    </div>
  );
});

export default Track;*/




















