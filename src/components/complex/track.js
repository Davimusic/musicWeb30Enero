import React, { useEffect, useRef, memo, useCallback } from "react";
import { drawWaveform } from "@/functions/music/drawWaveform";
import SubdivisionGrid from "@/functions/music/components/subdivisionGrid";
import TrackControlsModal from "@/functions/music/components/trackControlsModel";
import PianoGenerator from "@/functions/music/components/audioScaleGenerator";

const Track = memo(({ track, pixelsPerSecond, onSelectTime, tracks, pixelsHeight, setTracks, totalElements, openModal, audioNodesRef, currentTime, isPlaying, audioContextRef, preloadSequencerSamples, scheduleDrumMachine, startTransport }) => {
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

  // En el componente Track
  const handleCellTrigger = useCallback(({ rowIndex, stepIndex, sound, action }) => {
    setTracks(prevTracks => prevTracks.map(t => {
      if (t.id === track.id) {
        const newPatterns = [...t.drumPattern.patterns];
        const currentPattern = newPatterns[t.drumPattern.currentPattern];
        
        const updatedSteps = currentPattern.steps.map((step, idx) => {
          if (idx === stepIndex) {
            const sounds = new Set(step.activeSounds);
            action === 'add' ? sounds.add(sound) : sounds.delete(sound);
            return { ...step, activeSounds: [...sounds] };
          }
          return step;
        });
        
        currentPattern.steps = updatedSteps;
        return { ...t, drumPattern: { ...t.drumPattern, patterns: newPatterns } };
      }
      return t;
    }));
  }, [track.id, setTracks]); 
  

  if (track.type === "drumMachine") {
    return (
      <div 
        className="track-container"
        style={{
          position: 'static',
          width: '100%',
          //height: `${pixelsHeight}px`,
          marginBottom: '10px', // Ajusta según tu espaciado
          paddingTop: `15px`,
          overflowY: 'auto'
        }}
      >
        
  
        {/*<PianoGenerator/>*/}
        <SubdivisionGrid/>
  {/*PIXELS_PER_SECOND={pixelsPerSecond}
  pulsesPerMeasure={4}
  subdivisionsPerPulse={4} // 16 pasos por compás
  BPM={120}
  totalElements={16} // 1 compás
  rows={4} // Kick, Snare, Hihat, Clap
  isPlaying={isPlaying}
  currentTime={currentTime}
  onCellTrigger={handleCellTrigger}
  startTransport={startTransport}
  audioContext={audioContextRef.current}
/>*/}
          
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

export default Track;




















