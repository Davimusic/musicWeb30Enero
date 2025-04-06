import React, { useState, useEffect, useRef, useCallback } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';
import dynamic from 'next/dynamic';

// Importar dinámicamente el PianoGenerator para evitar problemas de SSR
const PianoGenerator = dynamic(
  () => import('./audioScaleGenerator'),
  { ssr: false, loading: () => <div>Cargando generador de piano...</div> }
);

// Constantes
const BPM = 120;
const DEFAULT_ROWS = 4;
const PIANO_KEYS = 88;
const PIANO_NOTES = [
  'A0', 'A#0', 'B0',
  ...Array.from({length: 7}, (_, i) => [
    `C${i+1}`, `C#${i+1}`, `D${i+1}`, `D#${i+1}`, `E${i+1}`, 
    `F${i+1}`, `F#${i+1}`, `G${i+1}`, `G#${i+1}`, `A${i+1}`, `A#${i+1}`, `B${i+1}`
  ]).flat(),
  'C8'
].slice(0, 88).reverse();

const DEFAULT_SAMPLES = ['kick', 'snare', 'hihat', 'clap'];
const DEFAULT_COLORS = {
  kick: '#FF6B6B', 
  snare: '#4ECDC4', 
  hihat: '#45B7D1', 
  clap: '#FFBE0B'
};

// Hook useAudioContext
const useAudioContext = () => {
  const audioContextRef = useRef(null);
  const [audioContextState, setAudioContextState] = useState('suspended');

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContextState(audioContextRef.current.state);
      audioContextRef.current.onstatechange = () => {
        setAudioContextState(audioContextRef.current.state);
      };
    }
  }, []);

  return { audioContextRef, audioContextState, initAudioContext };
};

// Hook usePianoSynth
const usePianoSynth = ({ audioContextRef }) => {
  const getNoteFrequency = (note) => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = parseInt(note.slice(-1));
    const key = note.slice(0, -1).replace("#", "#");
    const index = notes.indexOf(key);
    return 440 * Math.pow(2, (octave - 4) + (index - 9) / 12);
  };

  const playNote = useCallback((note, time, duration = 0.5, velocity = 0.8) => {
    if (!audioContextRef.current) return;

    const freq = getNoteFrequency(note);
    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(velocity * 0.6, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }, [audioContextRef]);

  return { playNote };
};

// Hook usePlayback
const usePlayback = ({
  audioContextRef,
  isPlayingRef,
  selectedCellsRef,
  numeratorRef,
  subdivisionsPerPulseRef,
  measuresRef,
  measureWidthRef,
  rowSamplesRef,
  rowsRef,
  isPianoModeRef,
  buffersRef,
  pianoNotes,
  pianoSynth,
  pianoBuffers
}) => {
  const scheduledSourcesRef = useRef(new Set());
  const animationRef = useRef(null);
  const currentStepRef = useRef(0);
  const indicatorRef = useRef(null);
  const nextStepTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const gridContainerRef = useRef(null);

  const playSound = useCallback((sound, time) => {
    if (isPianoModeRef.current) {
      // Primero intentar usar los buffers generados
      if (pianoBuffers && pianoBuffers.has(sound)) {
        try {
          const buffer = pianoBuffers.get(sound);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.start(time);
          scheduledSourcesRef.current.add(source);
          source.onended = () => scheduledSourcesRef.current.delete(source);
          console.log(`Reproduciendo buffer generado para: ${sound}`);
          return;
        } catch (error) {
          console.error(`Error reproduciendo buffer para ${sound}:`, error);
        }
      }
      console.log(`Usando sintetizador para: ${sound}`);
      pianoSynth.playNote(sound, time);
    } else {
      if (!buffersRef.current.has(sound)) {
        console.log(`Sample no encontrado: ${sound}`);
        return;
      }
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        console.log('AudioContext no disponible');
        return;
      }
      
      const buffer = buffersRef.current.get(sound);
      if (!buffer) {
        console.log(`Buffer no disponible para: ${sound}`);
        return;
      }
      
      try {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        const now = audioContextRef.current.currentTime;
        const adjustedTime = Math.max(now, time);
        source.start(adjustedTime);
        scheduledSourcesRef.current.add(source);
        source.onended = () => scheduledSourcesRef.current.delete(source);
      } catch (error) {
        console.error('Error al reproducir sonido:', error);
      }
    }
  }, [audioContextRef, isPianoModeRef, pianoSynth, pianoBuffers, buffersRef]);

  const getCurrentPatternSteps = useCallback(() => {
    const currentTotalSteps = measuresRef.current * numeratorRef.current * subdivisionsPerPulseRef.current;
    const steps = Array.from({ length: currentTotalSteps }, () => ({ activeSounds: [] }));
    
    selectedCellsRef.current.forEach(cellId => {
      const [rowIndex, stepIndex] = cellId.split('-').map(Number);
      if (stepIndex < currentTotalSteps && rowIndex < rowsRef.current) {
        const sound = isPianoModeRef.current ? pianoNotes[rowIndex] : rowSamplesRef.current[rowIndex];
        steps[stepIndex].activeSounds.push(sound);
      }
    });
    
    return steps;
  }, [pianoNotes]);

  const stopPlayback = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    scheduledSourcesRef.current.forEach(source => {
      try { 
        source.stop(); 
        source.disconnect();
      } catch(e) { console.warn('Error al detener fuente:', e); }
    });
    
    scheduledSourcesRef.current.clear();
    if (indicatorRef.current) indicatorRef.current.style.transform = 'translateX(0)';
    
    currentStepRef.current = 0;
    nextStepTimeRef.current = 0;
    isPlayingRef.current = false;
    lastFrameTimeRef.current = 0;
  }, []);

  const startPlayback = useCallback(async (autoScroll, setIsPlaying) => {
    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      stopPlayback();
      
      if (gridContainerRef.current && autoScroll) {
        gridContainerRef.current.scrollTo({ left: 0, behavior: 'auto' });
      }
      
      startTimeRef.current = audioContextRef.current.currentTime;
      nextStepTimeRef.current = startTimeRef.current;
      currentStepRef.current = 0;
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastFrameTimeRef.current = performance.now();
      
      const scheduler = () => {
        if (!isPlayingRef.current) return;
        
        const currentTime = audioContextRef.current.currentTime;
        const elapsedTime = currentTime - startTimeRef.current;
        const currentGridWidth = measureWidthRef.current * measuresRef.current;
        const computedPixelsPerSecond = (measureWidthRef.current * BPM) / (numeratorRef.current * 60);
        const posX = (elapsedTime * computedPixelsPerSecond) % currentGridWidth;
        
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = `translate3d(${posX}px, 0, 0)`;
          
          if (autoScroll && gridContainerRef.current) {
            const container = gridContainerRef.current;
            const containerWidth = container.clientWidth;
            const scrollLeft = posX - containerWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
          }
        }
        
        const currentStepDuration = (60 / BPM) / subdivisionsPerPulseRef.current;
        const steps = getCurrentPatternSteps();
        const currentTotalSteps = measuresRef.current * numeratorRef.current * subdivisionsPerPulseRef.current;
        
        while (nextStepTimeRef.current < currentTime + 0.1) {
          const currentStep = currentStepRef.current % currentTotalSteps;
          if (steps[currentStep]?.activeSounds?.length > 0) {
            steps[currentStep].activeSounds.forEach(sound => {
              playSound(sound, nextStepTimeRef.current);
            });
          }
          currentStepRef.current++;
          nextStepTimeRef.current += currentStepDuration;
        }
        
        animationRef.current = requestAnimationFrame(scheduler);
      };
      
      animationRef.current = requestAnimationFrame(scheduler);
    } catch (error) {
      console.error('Error al iniciar reproducción:', error);
      stopPlayback();
      setIsPlaying(false);
    }
  }, [stopPlayback, playSound, getCurrentPatternSteps]);

  const togglePlayback = useCallback(async (isPlaying, setIsPlaying, autoScroll, samplesLoaded) => {
    if (!samplesLoaded) return;
    
    if (isPlaying) {
      stopPlayback();
      setIsPlaying(false);
    } else {
      await startPlayback(autoScroll, setIsPlaying);
    }
  }, [startPlayback, stopPlayback]);

  return {
    gridContainerRef,
    indicatorRef,
    togglePlayback,
    stopPlayback,
    playSound
  };
};

// Hook useRecording
const useRecording = ({ audioContextRef, buffersRef }) => {
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [recordingRow, setRecordingRow] = useState(null);
  const [isGlobalRecording, setIsGlobalRecording] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newSampleName, setNewSampleName] = useState('');
  const [customSamples, setCustomSamples] = useState([]);

  const startRecording = (rowIndex) => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setRecordingRow(rowIndex);
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          audioContextRef.current.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const customKey = `custom${rowIndex}`;
            buffersRef.current.set(customKey, audioBuffer);
            setRecordingRow(null);
          }, (err) => {
            console.error("Error decoding recorded audio", err);
            setRecordingRow(null);
          });
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
      })
      .catch(err => console.error("Error accessing microphone: ", err));
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const startGlobalRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setIsGlobalRecording(true);
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          audioContextRef.current.decodeAudioData(arrayBuffer, (audioBuffer) => {
            setShowNameInput(true);
            const tempName = `custom-${Date.now()}`;
            buffersRef.current.set(tempName, audioBuffer);
            setNewSampleName(tempName);
            setIsGlobalRecording(false);
          }, (err) => {
            console.error("Error decoding recorded audio", err);
            setIsGlobalRecording(false);
          });
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
      })
      .catch(err => {
        console.error("Error accessing microphone: ", err);
        setIsGlobalRecording(false);
      });
  };

  const stopGlobalRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const saveCustomSample = (rowSamples, setRowSamples) => {
    if (newSampleName.trim()) {
      const tempName = `custom-${Date.now()}`;
      const buffer = buffersRef.current.get(tempName);
      if (buffer) {
        buffersRef.current.delete(tempName);
        buffersRef.current.set(newSampleName.trim(), buffer);
      }
      setCustomSamples(prev => [...prev, { name: newSampleName.trim(), buffer }]);
      setShowNameInput(false);
      setNewSampleName('');
    }
  };

  return {
    recordingRow,
    isGlobalRecording,
    showNameInput,
    newSampleName,
    customSamples,
    setNewSampleName,
    setShowNameInput,
    startRecording,
    stopRecording,
    startGlobalRecording,
    stopGlobalRecording,
    saveCustomSample
  };
};

// Hook useSamples
const useSamples = ({ isPianoMode, audioContextRef }) => {
  const buffersRef = useRef(new Map());
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  const loadSamples = useCallback(async () => {
    const samples = {
      kick: '/uno.mp3', 
      snare: '/dos.mp3', 
      hihat: '/tres.mp3', 
      clap: '/cuatro.mp3'
    };
    
    try {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const responses = await Promise.all(
        Object.values(samples).map(url => fetch(url))
      );
      const arrayBuffers = await Promise.all(responses.map(res => res.arrayBuffer()));
      const audioBuffers = await Promise.all(
        arrayBuffers.map((buffer, index) =>
          audioContextRef.current.decodeAudioData(buffer).catch(error => {
            console.error(`Error decoding ${Object.keys(samples)[index]}:`, error);
            return null;
          })
        )
      );
      
      audioBuffers.forEach((buffer, index) => {
        if (buffer) buffersRef.current.set(Object.keys(samples)[index], buffer);
      });
      
      setSamplesLoaded(true);
    } catch (error) {
      console.error('Error cargando samples:', error);
      setSamplesLoaded(false);
    }
  }, [isPianoMode, audioContextRef]);

  return { buffersRef, samplesLoaded, loadSamples };
};

// Componente Controls
const Controls = ({
  isPianoMode,
  togglePianoMode,
  rows,
  handleRowsChange,
  numerator,
  setNumerator,
  denominator,
  setDenominator,
  subdivisionsPerPulse,
  setSubdivisionsPerPulse,
  measures,
  setMeasures,
  autoScroll,
  setAutoScroll,
  measureWidth,
  setMeasureWidth,
  componentHeight,
  setComponentHeight,
  isPlaying,
  samplesLoaded,
  audioContextState,
  togglePlayback,
  isGlobalRecording,
  startGlobalRecording,
  stopGlobalRecording,
  showNameInput,
  newSampleName,
  setNewSampleName,
  saveCustomSample,
  showPianoGenerator,
  setShowPianoGenerator,
  pianoBuffersLoaded,
  pianoGenerationStatus
}) => (
  <>
    <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
      <label>
        <input
          type="checkbox"
          checked={isPianoMode}
          onChange={togglePianoMode}
          style={{ marginRight: '8px' }}
        />
        Modo Piano (88 teclas)
      </label>
      
      {!isPianoMode && (
        <label>
          Número de filas:{' '}
          <input
            type="number"
            min="1"
            max="88"
            value={rows}
            onChange={(e) => handleRowsChange(Number(e.target.value))}
            disabled={isPianoMode}
          />
        </label>
      )}
    </div>

    <div style={{ 
      marginBottom: '20px', 
      padding: '15px', 
      backgroundColor: '#f0f0f0', 
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Grabar nuevo sample:</h3>
        <button
          onClick={() => setShowPianoGenerator(!showPianoGenerator)}
          style={{ 
            padding: '8px 16px',
            backgroundColor: showPianoGenerator ? '#ff4444' : '#9c27b0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showPianoGenerator ? 'Ocultar Generador Piano' : 'Mostrar Generador Piano'}
        </button>
      </div>

      {pianoGenerationStatus.loaded && (
        <div style={{ 
          padding: '10px',
          backgroundColor: '#4caf50',
          color: 'white',
          borderRadius: '4px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          ✓ Piano de 88 notas cargado y listo para usar
        </div>
      )}

      {pianoGenerationStatus.error && (
        <div style={{ 
          padding: '10px',
          backgroundColor: '#ff4444',
          color: 'white',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          Error: {pianoGenerationStatus.error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={isGlobalRecording ? stopGlobalRecording : startGlobalRecording}
          style={{ 
            padding: '8px 16px',
            backgroundColor: isGlobalRecording ? '#ff4444' : '#4CAF50', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isGlobalRecording ? '⏹ Detener grabación' : '🎤 Grabar nuevo sample'}
        </button>

        {showNameInput && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={newSampleName}
              onChange={(e) => setNewSampleName(e.target.value)}
              placeholder="Nombre del sample"
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                flex: 1
              }}
            />
            <button 
              onClick={saveCustomSample}
              style={{ 
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Guardar
            </button>
          </div>
        )}
      </div>
    </div>

    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Numerador (pulsos por compás):{' '}
        <input
          type="number"
          min="1"
          max="10"
          value={numerator}
          onChange={e => setNumerator(Number(e.target.value))}
          style={{ padding: '6px', width: '60px' }}
        />
      </label>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Denominador:{' '}
        <select 
          value={denominator} 
          onChange={e => setDenominator(Number(e.target.value))}
          style={{ padding: '6px' }}
        >
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
          <option value={32}>32</option>
        </select>
      </label>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Subdivisiones por pulso:{' '}
        <input
          type="number"
          min="1"
          max="16"
          value={subdivisionsPerPulse}
          onChange={e => setSubdivisionsPerPulse(Number(e.target.value))}
          style={{ padding: '6px', width: '60px' }}
        />
      </label>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Compases:{' '}
        <input
          type="number"
          min="1"
          max="10"
          value={measures}
          onChange={e => setMeasures(Number(e.target.value))}
          style={{ padding: '6px', width: '60px' }}
        />
      </label>
    </div>
    
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={autoScroll}
          onChange={(e) => setAutoScroll(e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        Scroll dinámico durante la reproducción
      </label>
    </div>
    
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Ancho del compás: {measureWidth}px
        <input
          type="range"
          min="300"
          max="1200"
          value={measureWidth}
          onChange={e => setMeasureWidth(Number(e.target.value))}
          style={{ width: '100%', marginTop: '4px' }}
        />
      </label>
      <label style={{ display: 'block', marginBottom: '8px' }}>
        Alto de la grilla: {componentHeight}px
        <input
          type="range"
          min="150"
          max="600"
          value={componentHeight}
          onChange={e => setComponentHeight(Number(e.target.value))}
          style={{ width: '100%', marginTop: '4px' }}
        />
      </label>
    </div>
    
    <div style={{ 
      display: 'flex', 
      gap: '20px', 
      marginBottom: '20px', 
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <button
        onClick={togglePlayback}
        disabled={!samplesLoaded}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isPlaying ? '#ff4444' : samplesLoaded ? '#4CAF50' : '#cccccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: samplesLoaded ? 'pointer' : 'not-allowed',
          minWidth: '120px',
          fontWeight: 'bold'
        }}
      >
        {!samplesLoaded ? 'Cargando...' : isPlaying ? '⏹ Detener' : '▶ Reproducir'}
      </button>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ fontSize: '14px' }}>BPM: {BPM}</div>
        <div style={{ fontSize: '14px' }}>Estado Audio: {audioContextState}</div>
      </div>
    </div>
  </>
);

// Componente Grid
const Grid = ({
  isPianoMode,
  rows,
  totalSteps,
  totalStepsPerMeasure,
  subdivisionsPerPulse,
  measureWidth,
  measures,
  componentHeight,
  rowHeight,
  totalGridWidth,
  cellWidth,
  selectedCells,
  rowSamples,
  pianoNotes,
  isBlackKey,
  getSampleColor,
  handleCellClick,
  gridContainerRef,
  indicatorRef
}) => {
  const is88KeyMode = isPianoMode && rows === 88;

  let octaveGroups = [];
  if (is88KeyMode) {
    let groupStart = 0;
    for (let i = 0; i < rows; i++) {
      const note = pianoNotes[i];
      if (i > 0 && note[0] === 'B' && note[1] !== '#') {
        octaveGroups.push({
          start: groupStart,
          span: i - groupStart,
          label: pianoNotes[groupStart]
        });
        groupStart = i;
      }
    }
    octaveGroups.push({
      start: groupStart,
      span: rows - groupStart,
      label: pianoNotes[groupStart]
    });
  }

  return (
    <div
      style={{
        position: 'relative',
        width: `${measureWidth}px`,
        height: isPianoMode ? `${rows * rowHeight}px` : `${componentHeight}px`,
        overflowX: 'auto',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        padding: '2px',
        scrollBehavior: 'smooth',
        border: '1px solid #ddd'
      }}
      ref={gridContainerRef}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `60px repeat(${totalSteps}, ${cellWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
          gap: '2px',
          position: 'relative',
          width: `${60 + totalGridWidth}px`,
          minWidth: '100%'
        }}
      >
        {is88KeyMode ? (
          <>
            {octaveGroups.map((group, idx) => (
              <div
                key={`octave-${idx}`}
                style={{
                  gridColumn: '1 / 2',
                  gridRow: `${group.start + 1} / span ${group.span}`,
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                {group.label}
              </div>
            ))}
            {Array.from({ length: rows }).map((_, rowIndex) => {
              if (!octaveGroups.some((group) => group.start === rowIndex)) {
                return (
                  <div
                    key={`empty-${rowIndex}`}
                    style={{
                      gridColumn: '1 / 2',
                      gridRow: rowIndex + 1
                    }}
                  />
                );
              }
              return null;
            })}

            {Array.from({ length: rows }).map((_, rowIndex) =>
              Array.from({ length: totalSteps }).map((_, stepIndex) => {
                const cellId = `${rowIndex}-${stepIndex}`;
                const isActive = selectedCells.has(cellId);
                let cellBorderLeft = '1px solid #eee';

                if (stepIndex % totalStepsPerMeasure === 0) {
                  cellBorderLeft = '3px solid black';
                } else if (stepIndex % subdivisionsPerPulse === 0) {
                  cellBorderLeft = '2px solid gray';
                }

                return (
                  <div
                    key={`cell-${rowIndex}-${stepIndex}`}
                    onClick={() => handleCellClick(rowIndex, stepIndex)}
                    style={{
                      gridColumn: stepIndex + 2,
                      gridRow: rowIndex + 1,
                      backgroundColor: isActive
                        ? getSampleColor(rowSamples[rowIndex])
                        : isPianoMode && isBlackKey(pianoNotes[rowIndex])
                        ? '#222'
                        : '#f9f9f9',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderTop: '1px solid #eee',
                      borderBottom: '1px solid #eee',
                      borderRight: '1px solid #eee',
                      borderLeft: cellBorderLeft,
                      width: `${cellWidth}px`,
                      height: `${rowHeight}px`
                    }}
                  />
                );
              })
            )}
          </>
        ) : (
          Array.from({ length: rows }).map((_, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <div
                style={{
                  gridColumn: '1 / 2',
                  gridRow: rowIndex + 1,
                  backgroundColor:
                    isPianoMode && isBlackKey(pianoNotes[rowIndex])
                      ? '#333'
                      : '#fff',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight:
                    isPianoMode && isBlackKey(pianoNotes[rowIndex])
                      ? 'bold'
                      : 'normal',
                  color:
                    isPianoMode && isBlackKey(pianoNotes[rowIndex])
                      ? '#fff'
                      : '#333'
                }}
              >
                {isPianoMode ? pianoNotes[rowIndex] : `Fila ${rowIndex + 1}`}
              </div>
              {Array.from({ length: totalSteps }).map((_, stepIndex) => {
                const cellId = `${rowIndex}-${stepIndex}`;
                const isActive = selectedCells.has(cellId);
                let cellBorderLeft = '1px solid #eee';

                if (stepIndex % totalStepsPerMeasure === 0) {
                  cellBorderLeft = '3px solid black';
                } else if (stepIndex % subdivisionsPerPulse === 0) {
                  cellBorderLeft = '2px solid gray';
                }

                return (
                  <div
                    key={`cell-${rowIndex}-${stepIndex}`}
                    onClick={() => handleCellClick(rowIndex, stepIndex)}
                    style={{
                      gridColumn: stepIndex + 2,
                      gridRow: rowIndex + 1,
                      backgroundColor: isActive
                        ? getSampleColor(rowSamples[rowIndex])
                        : isPianoMode && isBlackKey(pianoNotes[rowIndex])
                        ? '#222'
                        : '#f9f9f9',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderTop: '1px solid #eee',
                      borderBottom: '1px solid #eee',
                      borderRight: '1px solid #eee',
                      borderLeft: cellBorderLeft,
                      width: `${cellWidth}px`,
                      height: `${rowHeight}px`
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))
        )}
      </div>

      <div
        ref={indicatorRef}
        style={{
          position: 'absolute',
          left: '60px',
          top: 0,
          height: '100%',
          width: '2px',
          backgroundColor: 'red',
          zIndex: 10,
          transform: 'translateX(0)',
          willChange: 'transform'
        }}
      />
    </div>
  );
};

Grid.defaultProps = {
  selectedCells: new Set()
};

// Componente RowControls
const RowControls = ({
  rows,
  rowSamples,
  setRowSamples,
  getSampleColor,
  handleSelectorColor,
  customSamples,
  recordingRow,
  startRecording,
  stopRecording
}) => (
  <div style={{ 
    display: 'flex', 
    gap: '20px', 
    marginTop: '20px', 
    justifyContent: 'center', 
    flexWrap: 'wrap', 
    width: '100%' 
  }}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={`legend-${rowIndex}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: getSampleColor(rowSamples[rowIndex]),
            borderRadius: '2px',
            cursor: 'pointer'
          }}
          onClick={() => handleSelectorColor(
            getSampleColor(rowSamples[rowIndex]), 
            rowSamples[rowIndex]
          )}
        />
        <select
          value={rowSamples[rowIndex]}
          onChange={(e) => {
            const value = e.target.value;
            setRowSamples(prev => {
              const newArr = [...prev];
              newArr[rowIndex] = value;
              return newArr;
            });
          }}
          style={{ padding: '6px', borderRadius: '4px', minWidth: '150px' }}
        >
          <option value="kick">Kick</option>
          <option value="snare">Snare</option>
          <option value="hihat">Hihat</option>
          <option value="clap">Clap</option>
          {customSamples.map((sample, idx) => (
            <option key={idx} value={sample.name}>
              {sample.name}
            </option>
          ))}
        </select>
        <button
          onClick={recordingRow === rowIndex ? stopRecording : () => startRecording(rowIndex)}
          style={{
            padding: '4px 8px',
            backgroundColor: recordingRow === rowIndex ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          {recordingRow === rowIndex ? '⏹' : '🎤'}
        </button>
      </div>
    ))}
  </div>
);

// Componente principal SubdivisionGrid
const SubdivisionGrid = () => {
  const [isPianoMode, setIsPianoMode] = useState(false);
  const [numerator, setNumerator] = useState(4);
  const [denominator, setDenominator] = useState(4);
  const [subdivisionsPerPulse, setSubdivisionsPerPulse] = useState(4);
  const [measures, setMeasures] = useState(1);
  const [measureWidth, setMeasureWidth] = useState(800);
  const [componentHeight, setComponentHeight] = useState(300);
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [rowSamples, setRowSamples] = useState(
    Array(DEFAULT_ROWS).fill().map((_, i) => DEFAULT_SAMPLES[i] || 'kick')
  );
  const [soundColors, setSoundColors] = useState(DEFAULT_COLORS);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [color, setColor] = useState('');
  const [openColorSelector, setOpenColorSelector] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const [showPianoGenerator, setShowPianoGenerator] = useState(false);
  const [pianoBuffers, setPianoBuffers] = useState(new Map());
  const [pianoGenerationStatus, setPianoGenerationStatus] = useState({
    loaded: false,
    loading: false,
    error: null
  });

  const pianoGeneratorRef = useRef(null);
  const numeratorRef = useRef(numerator);
  const subdivisionsPerPulseRef = useRef(subdivisionsPerPulse);
  const measuresRef = useRef(measures);
  const measureWidthRef = useRef(measureWidth);
  const rowSamplesRef = useRef(rowSamples);
  const rowsRef = useRef(rows);
  const isPianoModeRef = useRef(isPianoMode);
  const selectedCellsRef = useRef(selectedCells);

  const { audioContextRef, audioContextState, initAudioContext } = useAudioContext();
  const { buffersRef, samplesLoaded, loadSamples } = useSamples({ isPianoMode, audioContextRef });
  const pianoSynth = usePianoSynth({ audioContextRef });
  const playback = usePlayback({
    audioContextRef,
    isPlayingRef: useRef(isPlaying),
    selectedCellsRef,
    numeratorRef,
    subdivisionsPerPulseRef,
    measuresRef,
    measureWidthRef,
    rowSamplesRef,
    rowsRef,
    isPianoModeRef,
    buffersRef,
    pianoNotes: PIANO_NOTES,
    pianoSynth,
    pianoBuffers
  });
  const recording = useRecording({ audioContextRef, buffersRef });

  useEffect(() => { selectedCellsRef.current = selectedCells; }, [selectedCells]);
  useEffect(() => { numeratorRef.current = numerator; }, [numerator]);
  useEffect(() => { subdivisionsPerPulseRef.current = subdivisionsPerPulse; }, [subdivisionsPerPulse]);
  useEffect(() => { measuresRef.current = measures; }, [measures]);
  useEffect(() => { measureWidthRef.current = measureWidth; }, [measureWidth]);
  useEffect(() => { rowSamplesRef.current = rowSamples; }, [rowSamples]);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  useEffect(() => { isPianoModeRef.current = isPianoMode; }, [isPianoMode]);

  const isBlackKey = (note) => note.includes('#');

  const handleRowsChange = (newRows) => {
    const maxRows = isPianoMode ? PIANO_KEYS : 88;
    const numRows = Math.max(1, Math.min(maxRows, newRows));
    setRows(numRows);
    
    setRowSamples(prev => {
      const newRowSamples = Array(numRows).fill().map((_, i) => 
        i < prev.length ? prev[i] : DEFAULT_SAMPLES[i % DEFAULT_SAMPLES.length] || 'kick'
      );
      return newRowSamples;
    });
  };

  const togglePianoMode = () => {
    const newPianoMode = !isPianoMode;
    setIsPianoMode(newPianoMode);
    handleRowsChange(newPianoMode ? PIANO_KEYS : DEFAULT_ROWS);
    
    // Reiniciar el estado de reproducción al cambiar modos
    playback.stopPlayback();
    setIsPlaying(false);
  };

  const getSampleColor = (sample) => {
    if (soundColors[sample]) return soundColors[sample];
    if (sample.startsWith("custom")) return "#9b59b6";
    return "#a5d6a7";
  };

  const changeObjectColor = (key, newColor) => {
    setSoundColors(prev => ({ ...prev, [key]: newColor }));
  };

  const handleSelectorColor = (color, key) => {
    setColor(color);
    setSelectedKey(key);
    setOpenColorSelector(true);
  };

  const handleCellClick = (rowIndex, stepIndex) => {
    const cellId = `${rowIndex}-${stepIndex}`;
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      newSet.has(cellId) ? newSet.delete(cellId) : newSet.add(cellId);
      return newSet;
    });
    
    initAudioContext();
    const sound = isPianoMode ? PIANO_NOTES[rowIndex] : rowSamples[rowIndex];
    playback.playSound(sound, audioContextRef.current.currentTime + 0.05);
  };

  const loadPianoBuffers = useCallback(async () => {
    try {
      setPianoGenerationStatus({ loaded: false, loading: true, error: null });
      
      if (pianoGeneratorRef.current && pianoGeneratorRef.current.isReady) {
        const buffers = pianoGeneratorRef.current.getNoteBuffers();
        
        // Verificar que tenemos buffers para todas las notas
        const allNotesLoaded = PIANO_NOTES.every(note => buffers.has(note));
        if (!allNotesLoaded) {
          throw new Error('No se generaron todas las notas del piano');
        }
        
        setPianoBuffers(buffers);
        setPianoGenerationStatus({ loaded: true, loading: false, error: null });
      }
    } catch (error) {
      console.error('Error cargando buffers de piano:', error);
      setPianoGenerationStatus({ 
        loaded: false, 
        loading: false, 
        error: error.message 
      });
    }
  }, []);

  const totalStepsPerMeasure = numerator * subdivisionsPerPulse;
  const totalSteps = measures * totalStepsPerMeasure;
  const cellWidth = measureWidth / totalStepsPerMeasure;
  const totalGridWidth = measureWidth * measures;
  const rowHeight = isPianoMode ? 20 : componentHeight / rows;

  useEffect(() => {
    loadSamples();
    return () => {
      playback.stopPlayback();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [loadSamples, playback.stopPlayback, audioContextRef]);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {openColorSelector && (
        <Modal isOpen={openColorSelector} onClose={() => setOpenColorSelector(false)}>
          <SingleColorPickerModalContent 
            initialColor={color}
            onColorUpdate={(newColor) => {
              changeObjectColor(selectedKey, newColor);
              setOpenColorSelector(false);
            }}
            onClose={() => setOpenColorSelector(false)}
          />
        </Modal>
      )}

      {showPianoGenerator && (
        <div style={{ 
          marginBottom: '30px', 
          border: '1px solid #ddd', 
          padding: '20px', 
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <PianoGenerator ref={pianoGeneratorRef} />
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={loadPianoBuffers}
              disabled={!pianoGeneratorRef.current?.isReady || pianoGenerationStatus.loading}
              style={{
                padding: '10px 20px',
                backgroundColor: pianoGenerationStatus.loaded 
                  ? '#4CAF50' 
                  : pianoGeneratorRef.current?.isReady 
                    ? '#2196F3' 
                    : '#cccccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: pianoGeneratorRef.current?.isReady ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                minWidth: '200px'
              }}
            >
              {pianoGenerationStatus.loading ? 'Cargando...' : 
               pianoGenerationStatus.loaded ? '✓ Piano Cargado' : 
               'Cargar Piano en Secuenciador'}
            </button>
            
            {pianoGenerationStatus.error && (
              <div style={{ 
                color: '#f44336', 
                marginTop: '10px',
                fontSize: '14px'
              }}>
                Error: {pianoGenerationStatus.error}
              </div>
            )}
            
            {pianoGenerationStatus.loaded && (
              <div style={{ 
                color: '#4CAF50', 
                marginTop: '10px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Piano cargado correctamente ({PIANO_NOTES.length}/{PIANO_NOTES.length} muestras)
              </div>
            )}
          </div>
        </div>
      )}

      <Controls 
        isPianoMode={isPianoMode}
        togglePianoMode={togglePianoMode}
        rows={rows}
        handleRowsChange={handleRowsChange}
        numerator={numerator}
        setNumerator={setNumerator}
        denominator={denominator}
        setDenominator={setDenominator}
        subdivisionsPerPulse={subdivisionsPerPulse}
        setSubdivisionsPerPulse={setSubdivisionsPerPulse}
        measures={measures}
        setMeasures={setMeasures}
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        measureWidth={measureWidth}
        setMeasureWidth={setMeasureWidth}
        componentHeight={componentHeight}
        setComponentHeight={setComponentHeight}
        isPlaying={isPlaying}
        samplesLoaded={samplesLoaded}
        audioContextState={audioContextState}
        togglePlayback={() => playback.togglePlayback(isPlaying, setIsPlaying, autoScroll, samplesLoaded)}
        isGlobalRecording={recording.isGlobalRecording}
        startGlobalRecording={recording.startGlobalRecording}
        stopGlobalRecording={recording.stopGlobalRecording}
        showNameInput={recording.showNameInput}
        newSampleName={recording.newSampleName}
        setNewSampleName={recording.setNewSampleName}
        saveCustomSample={() => recording.saveCustomSample(rowSamples, setRowSamples)}
        showPianoGenerator={showPianoGenerator}
        setShowPianoGenerator={setShowPianoGenerator}
        pianoBuffersLoaded={pianoGenerationStatus.loaded}
        pianoGenerationStatus={pianoGenerationStatus}
      />

      <Grid
        isPianoMode={isPianoMode}
        rows={rows}
        totalSteps={totalSteps}
        totalStepsPerMeasure={totalStepsPerMeasure}
        subdivisionsPerPulse={subdivisionsPerPulse}
        measureWidth={measureWidth}
        measures={measures}
        componentHeight={componentHeight}
        rowHeight={rowHeight}
        totalGridWidth={totalGridWidth}
        cellWidth={cellWidth}
        selectedCells={selectedCells}
        rowSamples={rowSamples}
        pianoNotes={PIANO_NOTES}
        isBlackKey={isBlackKey}
        getSampleColor={getSampleColor}
        handleCellClick={handleCellClick}
        gridContainerRef={playback.gridContainerRef}
        indicatorRef={playback.indicatorRef}
      />

      {!isPianoMode && (
        <RowControls
          rows={rows}
          rowSamples={rowSamples}
          setRowSamples={setRowSamples}
          getSampleColor={getSampleColor}
          handleSelectorColor={handleSelectorColor}
          customSamples={recording.customSamples}
          recordingRow={recording.recordingRow}
          startRecording={recording.startRecording}
          stopRecording={recording.stopRecording}
        />
      )}
    </div>
  );
};

export default SubdivisionGrid;