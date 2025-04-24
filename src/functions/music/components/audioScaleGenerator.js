import React, { useState, useEffect, useRef, useCallback } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';

const BPM = 120;
const DEFAULT_ROWS = 4;
const PIANO_KEYS = 88;

let PREDEFINED_PIANO_SAMPLES = [
  { id: 'piano', name: 'Piano (A4)', path: '/C3-1s.wav', baseFreq: 440 },
  { id: 'voz', name: 'Voz (A4)', path: '/vos.wav', baseFreq: 440 },
  { id: 'uno', name: 'Uno (A4)', path: '/uno.mp3', baseFreq: 440 },
];

const getNoteName = (midiNote) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  return `${noteNames[midiNote % 12]}${octave}`;
};

const PIANO_NOTES = Array.from({ length: 88 }, (_, i) => getNoteName(21 + i)).reverse();

const DEFAULT_SAMPLES = ['kick', 'snare', 'hihat', 'clap'];
const DEFAULT_COLORS = {
  kick: '#FF6B6B', 
  snare: '#4ECDC4', 
  hihat: '#45B7D1', 
  clap: '#FFBE0B'
};

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
  pianoNotes
}) => {
  const scheduledSourcesRef = useRef(new Set());
  const animationRef = useRef(null);
  const currentStepRef = useRef(0);
  const indicatorRef = useRef(null);
  const nextStepTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const gridContainerRef = useRef(null);

  const getNoteFrequency = (note) => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = parseInt(note.slice(-1));
    const key = note.slice(0, -1).replace("#", "#");
    const index = notes.indexOf(key);
    return 440 * Math.pow(2, (octave - 4) + (index - 9) / 12);
  };

  const playSound = useCallback((sound, time) => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
  
    if (isPianoModeRef.current) {
      const pianoSample = buffersRef.current.get('pianoSample');
      if (pianoSample) {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = pianoSample.buffer;
        
        const noteFreq = getNoteFrequency(sound);
        const playbackRate = noteFreq / pianoSample.baseFreq;
        source.playbackRate.value = playbackRate;

        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.setValueAtTime(0.8, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 1);

        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        source.start(time);
        scheduledSourcesRef.current.add(source);
      }
    } else {
      const buffer = buffersRef.current.get(sound);
      if (buffer) {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 0.8;
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        source.start(time);
        scheduledSourcesRef.current.add(source);
      }
    }
  }, [audioContextRef, isPianoModeRef, buffersRef]);

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
  }, [measuresRef, numeratorRef, subdivisionsPerPulseRef, selectedCellsRef, rowsRef, isPianoModeRef, pianoNotes, rowSamplesRef]);

  const stopPlayback = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    scheduledSourcesRef.current.forEach(source => {
      try { 
        source.stop(); 
        source.disconnect();
      } catch(e) { 
        console.warn('Error stopping source:', e); 
      }
    });
    
    scheduledSourcesRef.current.clear();
    
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = 'translateX(0)';
    }
    
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
      console.error('Error starting playback:', error);
      stopPlayback();
      setIsPlaying(false);
    }
  }, [
    audioContextRef, 
    stopPlayback, 
    getCurrentPatternSteps, 
    playSound, 
    isPlayingRef, 
    gridContainerRef, 
    measureWidthRef, 
    measuresRef, 
    numeratorRef, 
    subdivisionsPerPulseRef
  ]);

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
    playSound,
    gridContainerRef,
    indicatorRef,
    togglePlayback,
    stopPlayback,
    startPlayback
  };
};

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
      console.error('Error loading samples:', error);
      setSamplesLoaded(false);
    }
  }, [isPianoMode, audioContextRef]);

  return { buffersRef, samplesLoaded, loadSamples };
};

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
  selectedPianoSample,
  setSelectedPianoSample,
  pianoSamples
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

    {isPianoMode && (
      <div style={{ marginBottom: '20px' }}>
        <label>
          Sample de Piano:
          <select
            value={selectedPianoSample}
            onChange={(e) => setSelectedPianoSample(e.target.value)}
            style={{ marginLeft: '10px', padding: '6px' }}
          >
            {pianoSamples.map(sample => (
              <option key={sample.id} value={sample.id}>
                {sample.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    )}

    <div style={{ 
      marginBottom: '20px', 
      padding: '15px', 
      backgroundColor: '#f0f0f0', 
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <h3 style={{ margin: 0 }}>Grabar nuevo sample:</h3>
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
  indicatorRef,
  activeRows
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
  const [selectedPianoSample, setSelectedPianoSample] = useState('piano');

  const numeratorRef = useRef(numerator);
  const subdivisionsPerPulseRef = useRef(subdivisionsPerPulse);
  const measuresRef = useRef(measures);
  const measureWidthRef = useRef(measureWidth);
  const rowSamplesRef = useRef(rowSamples);
  const rowsRef = useRef(rows);
  const isPianoModeRef = useRef(isPianoMode);
  const selectedCellsRef = useRef(selectedCells);
  const baseBufferRef = useRef(null);

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
    pianoNotes: PIANO_NOTES
  });
  const recording = useRecording({ audioContextRef, buffersRef });

  useEffect(() => {
    const loadPianoSample = async () => {
      if (!isPianoMode) return;
      
      const sample = PREDEFINED_PIANO_SAMPLES.find(s => s.id === selectedPianoSample);
      if (!sample) return;

      try {
        const response = await fetch(sample.path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        buffersRef.current.set('pianoSample', {
          buffer: audioBuffer,
          baseFreq: sample.baseFreq
        });
      } catch (error) {
        console.error('Error cargando sample de piano:', error);
      }
    };

    loadPianoSample();
  }, [selectedPianoSample, isPianoMode]);

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
        selectedPianoSample={selectedPianoSample}
        setSelectedPianoSample={setSelectedPianoSample}
        pianoSamples={PREDEFINED_PIANO_SAMPLES}
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
        activeRows={activeRows}
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







/*'use client';  para las 88 teclas funciona espectacular
import { useState, useRef, useEffect } from 'react';

const PianoGenerator = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [selectedOctave, setSelectedOctave] = useState(4);
  const audioContextRef = useRef(null);
  const sourceNodesRef = useRef([]);
  const masterGainRef = useRef(null);
  const baseBufferRef = useRef(null);

  // Generar frecuencias para las 88 notas del piano (A0 a C8)
  const generatePianoFrequencies = () => {
    const notes = [];
    for (let midi = 21; midi <= 108; midi++) {
      const freq = 440 * Math.pow(2, (midi - 69) / 12); // Fórmula MIDI
      const noteName = getNoteName(midi);
      notes.push({
        midi,
        name: noteName,
        frequency: freq,
        playbackRate: Math.pow(2, (midi - 69) / 12) // Ratio basado en A4
      });
    }
    return notes;
  };

  // Convertir número MIDI a nombre de nota (ej. 69 -> "A4")
  const getNoteName = (midiNote) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
  };

  const pianoNotes = generatePianoFrequencies();

  // Inicializar AudioContext y efectos
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 44100,
      latencyHint: 'playback'
    });
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.gain.value = 0.7;
    masterGainRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Cargar y procesar archivo de audio
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReady(false);
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Limitar duración del sample
      if (audioBuffer.duration > 3) {
        alert('Usa samples cortos (menos de 3 segundos) para mejor rendimiento');
        return;
      }

      baseBufferRef.current = audioBuffer;
      setIsReady(true);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error al procesar el archivo. Usa formatos WAV o MP3.');
    }
  };

  // Reproducir nota con optimizaciones
  const playNote = (note) => {
    if (!isReady) return;

    stopAllNotes();
    setActiveNote(note.midi);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = baseBufferRef.current;
    
    // Estrategia híbrida para mejor calidad
    source.playbackRate.value = note.playbackRate;
    
    // Configurar envolvente ADSR
    const gainNode = audioContextRef.current.createGain();
    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    source.connect(gainNode);
    gainNode.connect(masterGainRef.current);
    
    source.start();
    source.stop(now + 1.5);
    
    sourceNodesRef.current.push(source);
    source.onended = () => setActiveNote(null);
  };

  // Reproducir octava completa
  const playOctave = async () => {
    if (!isReady || isPlaying) return;

    setIsPlaying(true);
    stopAllNotes();

    const octaveNotes = pianoNotes.filter(n => 
      Math.floor(n.midi / 12) - 1 === selectedOctave
    );

    const startTime = audioContextRef.current.currentTime + 0.1;
    
    octaveNotes.forEach((note, index) => {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = baseBufferRef.current;
      source.playbackRate.value = note.playbackRate;
      
      const gainNode = audioContextRef.current.createGain();
      const noteStart = startTime + index * 0.5;
      
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(1, noteStart + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 1);

      source.connect(gainNode);
      gainNode.connect(masterGainRef.current);
      
      source.start(noteStart);
      source.stop(noteStart + 1);
      
      sourceNodesRef.current.push(source);
    });

    setTimeout(() => setIsPlaying(false), octaveNotes.length * 500);
  };

  // Detener todas las notas
  const stopAllNotes = () => {
    sourceNodesRef.current.forEach(source => {
      try { 
        source.stop(); 
        source.disconnect();
      } catch(e) {}
    });
    sourceNodesRef.current = [];
    setActiveNote(null);
  };

  // Filtrar notas para la octava seleccionada
  const filteredNotes = pianoNotes.filter(note => 
    Math.floor(note.midi / 12) - 1 === selectedOctave
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Generador de Piano Completo</h1>
        <p className="text-gray-600 mb-6">
          Carga un sample de referencia (A4 440Hz recomendado) para generar las 88 notas del piano
        </p>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de audio de referencia:
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Usa un sample corto (1-2 segundos) de piano, guitarra o voz para mejores resultados
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar octava: {selectedOctave}
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={selectedOctave}
              onChange={(e) => setSelectedOctave(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>A0</span>
              <span>C8</span>
            </div>
          </div>
        </div>

        {isReady ? (
          <>
            <div className="mb-6 flex justify-center space-x-4">
              <button
                onClick={playOctave}
                disabled={isPlaying}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${
                  isPlaying ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? 'Reproduciendo...' : `Reproducir Octava ${selectedOctave}`}
              </button>
              <button
                onClick={stopAllNotes}
                className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Detener
              </button>
            </div>

            <div className="relative h-32 overflow-x-auto">
              <div className="absolute flex space-x-1">
                {filteredNotes.map((note) => (
                  <button
                    key={note.midi}
                    onClick={() => playNote(note)}
                    className={`w-12 h-32 flex flex-col items-center justify-end pb-2 rounded-b-md border
                      ${note.name.includes('#') 
                        ? 'bg-black text-white h-20 -mx-2 z-10' 
                        : 'bg-white text-gray-800 border-gray-300'}
                      ${activeNote === note.midi ? 'ring-2 ring-blue-500' : ''}
                      hover:brightness-95 transition-all`}
                  >
                    <span className={`text-xs ${note.name.includes('#') ? 'text-white' : 'text-gray-600'}`}>
                      {note.name.replace('#', '♯')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Nota actual:</strong> {activeNote ? pianoNotes.find(n => n.midi === activeNote)?.name : 'Ninguna'}</p>
              <p><strong>Frecuencia:</strong> {activeNote ? pianoNotes.find(n => n.midi === activeNote)?.frequency.toFixed(2) + ' Hz' : '--'}</p>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            {audioFile ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600">Procesando audio...</p>
              </div>
            ) : (
              <p className="text-gray-500">Sube un archivo de audio para generar el piano completo</p>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Consejos profesionales:</h3>
          <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
            <li>Para notas graves, usa samples con buen contenido de bajos</li>
            <li>Las teclas negras muestran sostenidos (♯) en notación musical</li>
            <li>Mantén pulsaciones cortas para mejor rendimiento</li>
            <li>Octava 4 corresponde al rango central del piano</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PianoGenerator;
*/






/*'use client'; perfecto para una sola octaca desde C3
import { useState, useRef, useEffect } from 'react';

const AudioScaleGenerator = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const buffersRef = useRef([]);
  const sourceNodesRef = useRef([]);

  // Escala de Do mayor con frecuencias precisas
  const musicalScale = [
    { name: 'Do', frequency: 261.63, detune: 0 },     // C4
    { name: 'Re', frequency: 293.66, detune: 200 },   // D4 (+2 semitonos)
    { name: 'Mi', frequency: 329.63, detune: 400 },   // E4 (+4 semitonos)
    { name: 'Fa', frequency: 349.23, detune: 500 },   // F4 (+5 semitonos)
    { name: 'Sol', frequency: 392.00, detune: 700 },  // G4 (+7 semitonos)
    { name: 'La', frequency: 440.00, detune: 900 },   // A4 (+9 semitonos)
    { name: 'Si', frequency: 493.88, detune: 1100 },  // B4 (+11 semitonos)
    { name: 'Do (octava)', frequency: 523.25, detune: 1200 } // C5 (+12 semitonos)
  ];

  // Inicializar AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Cargar y procesar archivo de audio
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReady(false);
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Precargar buffers para cada nota
      buffersRef.current = musicalScale.map(note => {
        const buffer = audioContextRef.current.createBuffer(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        
        // Copiar datos originales
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          buffer.getChannelData(channel).set(audioBuffer.getChannelData(channel));
        }
        
        return { buffer, detune: note.detune };
      });

      setIsReady(true);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error al procesar el archivo de audio');
    }
  };

  // Reproducir una nota individual
  const playNote = (index) => {
    if (!isReady || isPlaying) return;

    stopAllNotes();
    
    const { buffer, detune } = buffersRef.current[index];
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.detune.value = detune;
    source.connect(audioContextRef.current.destination);
    source.start();
    
    sourceNodesRef.current.push(source);
  };

  // Reproducir escala completa
  const playScale = async () => {
    if (!isReady || isPlaying) return;

    setIsPlaying(true);
    stopAllNotes();

    const scheduleNote = (index, time) => {
      if (index >= musicalScale.length) {
        setIsPlaying(false);
        return;
      }

      const { buffer, detune } = buffersRef.current[index];
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.detune.value = detune;
      source.connect(audioContextRef.current.destination);
      source.start(time);
      source.stop(time + 0.5); // Duración de 500ms por nota
      
      source.onended = () => scheduleNote(index + 1, time + 0.6); // 600ms entre notas
      sourceNodesRef.current.push(source);
    };

    // Programar primera nota
    scheduleNote(0, audioContextRef.current.currentTime);
  };

  // Detener todas las notas
  const stopAllNotes = () => {
    sourceNodesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourceNodesRef.current = [];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Generador de Escala (Web Audio API)</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sube un sample de Do (261.63Hz):
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {isReady ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {musicalScale.map((note, index) => (
                <button
                  key={index}
                  onClick={() => playNote(index)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300
                    transition-all hover:shadow-md flex flex-col items-center
                    bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-lg font-bold text-gray-800">{note.name}</span>
                  <span className="text-sm text-gray-600">{note.frequency.toFixed(2)} Hz</span>
                </button>
              ))}
            </div>

            <button
              onClick={playScale}
              disabled={isPlaying}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isPlaying ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? 'Reproduciendo...' : 'Reproducir escala completa'}
            </button>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            {audioFile ? (
              <p className="text-gray-500">Procesando audio...</p>
            ) : (
              <p className="text-gray-500">Sube un archivo de audio para comenzar</p>
            )}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p><strong>Técnica:</strong> Web Audio API con buffers precargados y detune preciso</p>
          <p><strong>Latencia:</strong> ~5ms (óptimo para reproducción inmediata)</p>
        </div>
      </div>
    </div>
  );
};

export default AudioScaleGenerator;*/
