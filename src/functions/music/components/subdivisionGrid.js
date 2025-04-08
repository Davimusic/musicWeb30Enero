import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';
import PropTypes from 'prop-types';

const BPM = 120;
const DEFAULT_ROWS = 4;
const PIANO_KEYS = 88;

const globalBuffersRef = { current: new Map() };
const globalSelectedPianoSampleRef = { current: 'piano', duration: 0, durationToUse: 1 };
const globalAudioContextRef = { current: null };


const PREDEFINED_PIANO_SAMPLES = [
  { id: 'piano', name: 'Piano (A4)', path: '/samples/C3-1s.wav', baseFreq: 440 },
  { id: 'voz', name: 'Voz (A4)', path: '/samples/vos.wav', baseFreq: 440 },
  { id: 'uno', name: 'Uno (A4)', path: '/samples/uno.mp3', baseFreq: 440 },
  { id: 'C', name: 'C (A4)', path: '/samples/C3.wav', baseFreq: 440 },
  { id: 'hu', name: 'hu', path: '/samples/hu.wav', baseFreq: 440 },
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
  const [audioContextState, setAudioContextState] = useState('suspended');

  const initAudioContext = useCallback(() => {
    if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
      globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContextState(globalAudioContextRef.current.state);
      
      globalAudioContextRef.current.onstatechange = () => {
        setAudioContextState(globalAudioContextRef.current.state);
      };
    }
  }, []);

  return { 
    audioContextRef: globalAudioContextRef, // Retornamos la referencia global
    audioContextState, 
    initAudioContext 
  };
};

const usePianoSynth = () => {
  const getNoteFrequency = (note) => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = parseInt(note.slice(-1));
    const key = note.slice(0, -1).replace("#", "#");
    const index = notes.indexOf(key);
    return 440 * Math.pow(2, (octave - 4) + (index - 9) / 12);
  };

  const playNote = useCallback((note, time, duration = 0.5, velocity = 0.8) => {
    if (!globalAudioContextRef.current) return;

    const freq = getNoteFrequency(note);
    const osc = globalAudioContextRef.current.createOscillator();
    const gain = globalAudioContextRef.current.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(velocity * 0.6, time + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(globalAudioContextRef.current.destination);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }, []);

  return { playNote };
};

const usePlayback = ({
  //audioContextRef,
  isPlayingRef,
  selectedCellsRef,
  numeratorRef,
  subdivisionsPerPulseRef,
  measuresRef,
  measureWidthRef,
  rowSamplesRef,
  rowsRef,
  isPianoModeRef,
  //buffersRef,
  pianoNotes,
  setCurrentStep
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
    if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') return;
  
    if (isPianoModeRef.current) {
      const pianoSample = globalBuffersRef.current.get('pianoSample');
      if (pianoSample) {
        const source = globalAudioContextRef.current.createBufferSource();
        source.buffer = pianoSample.buffer;
        
        const noteFreq = getNoteFrequency(sound);
        const playbackRate = noteFreq / pianoSample.baseFreq;
        source.playbackRate.value = playbackRate;
  
        const gainNode = globalAudioContextRef.current.createGain();
        gainNode.gain.setValueAtTime(0.8, time);
  
        // Obtener la duración configurada por el usuario
        const userDuration = globalSelectedPianoSampleRef.durationToUse;
        
        // Calcular duración real considerando el playbackRate
        const effectiveDuration = Math.min(
          userDuration / playbackRate,
          pianoSample.buffer.duration / playbackRate
        );

        console.log(userDuration);
        
  
        // Configurar fade-out (10% de la duración o 0.1s, lo que sea menor)
        const fadeOutDuration = Math.min(0.1, effectiveDuration * 0.1);
        const fadeOutStartTime = time + effectiveDuration - fadeOutDuration;
  
        // Aplicar fade-out
        gainNode.gain.exponentialRampToValueAtTime(0.001, fadeOutStartTime + fadeOutDuration);
  
        source.connect(gainNode);
        gainNode.connect(globalAudioContextRef.current.destination);
        
        // Detener la fuente después de la duración efectiva
        source.start(time);
        source.stop(time + effectiveDuration + fadeOutDuration);
        
        scheduledSourcesRef.current.add(source);
      }
    } else {
      const buffer = globalBuffersRef.current.get(sound);
      if (buffer) {
        const source = globalAudioContextRef.current.createBufferSource();
        source.buffer = buffer;
        const gainNode = globalAudioContextRef.current.createGain();
        gainNode.gain.value = 0.8;
        source.connect(gainNode);
        gainNode.connect(globalAudioContextRef.current.destination);
        source.start(time);
        scheduledSourcesRef.current.add(source);
      }
    }
  }, [isPianoModeRef]);

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
      if (globalAudioContextRef.current.state === 'suspended') {
        await globalAudioContextRef.current.resume();
      }
      
      stopPlayback();
      
      if (gridContainerRef.current && autoScroll) {
        gridContainerRef.current.scrollTo({ left: 0, behavior: 'auto' });
      }
      
      startTimeRef.current = globalAudioContextRef.current.currentTime;
      nextStepTimeRef.current = startTimeRef.current;
      currentStepRef.current = 0;
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastFrameTimeRef.current = performance.now();
      
      const scheduler = () => {
        if (!isPlayingRef.current) return;
      
        const currentTime = globalAudioContextRef.current.currentTime;
        const elapsedTime = currentTime - startTimeRef.current;
        const stepsPerSecond = (BPM * subdivisionsPerPulseRef.current) / 60;
        const totalSteps = measuresRef.current * numeratorRef.current * subdivisionsPerPulseRef.current;
        const cellWidth = measureWidthRef.current / (numeratorRef.current * subdivisionsPerPulseRef.current);
        
        // 1. Calcular paso actual
        const newStep = Math.floor(elapsedTime * stepsPerSecond) % totalSteps;
        setCurrentStep(newStep);
        
        // 2. Actualizar indicador visual
        if (indicatorRef.current) {
          const posX = newStep * cellWidth;
          indicatorRef.current.style.transform = `translateX(${posX}px)`;
          
          // 3. Auto-scroll dinámico
          if (autoScroll && gridContainerRef.current) {
            const container = gridContainerRef.current;
            const containerWidth = container.clientWidth;
            const scrollLeft = posX - (containerWidth / 2) + (cellWidth / 2);
            const maxScroll = container.scrollWidth - containerWidth;
            const boundedScroll = Math.max(0, Math.min(scrollLeft, maxScroll));
            
            container.scrollTo({ 
              left: boundedScroll,
              behavior: 'smooth' 
            });
          }
        }
      
        // 4. Programación de sonidos (look-ahead scheduling)
        const currentStepDuration = (60 / BPM) / subdivisionsPerPulseRef.current;
        const steps = getCurrentPatternSteps();
        
        while (nextStepTimeRef.current < currentTime + 0.1) { // Buffer de 100ms
          const stepIndex = Math.floor(
            ((nextStepTimeRef.current - startTimeRef.current) * stepsPerSecond) % totalSteps
          );
          
          // Disparar sonidos para este paso
          if (steps[stepIndex]?.activeSounds?.length > 0) {
            steps[stepIndex].activeSounds.forEach(sound => {
              if (isPianoModeRef.current) {
                const pianoSample = globalBuffersRef.current.get('pianoSample');
                if (pianoSample) {
                  const source = globalAudioContextRef.current.createBufferSource();
                  source.buffer = pianoSample.buffer;
                  const noteFreq = getNoteFrequency(sound);
                  const playbackRate = noteFreq / pianoSample.baseFreq;
                  source.playbackRate.value = playbackRate;
                  
                  const gainNode = globalAudioContextRef.current.createGain();
                  gainNode.gain.setValueAtTime(0.8, nextStepTimeRef.current);
                  
                  // Usar la duración configurada por el usuario
                  const userDuration = globalSelectedPianoSampleRef.durationToUse;
                  const effectiveDuration = Math.min(
                    userDuration / playbackRate,
                    pianoSample.buffer.duration / playbackRate
                  );
                  
                  // Configurar fade-out
                  const fadeOutDuration = Math.min(0.1, effectiveDuration * 0.1);
                  const fadeOutStartTime = nextStepTimeRef.current + effectiveDuration - fadeOutDuration;
                  
                  gainNode.gain.exponentialRampToValueAtTime(0.001, fadeOutStartTime + fadeOutDuration);
                  
                  source.connect(gainNode);
                  gainNode.connect(globalAudioContextRef.current.destination);
                  
                  source.start(nextStepTimeRef.current);
                  source.stop(nextStepTimeRef.current + effectiveDuration + fadeOutDuration);
                  
                  scheduledSourcesRef.current.add(source);
                }
              } else {
                // Lógica para samples normales
                const buffer = globalBuffersRef.current.get(sound);
                if (buffer) {
                  const source = globalAudioContextRef.current.createBufferSource();
                  source.buffer = buffer;
                  const gainNode = globalAudioContextRef.current.createGain();
                  gainNode.gain.value = 0.8;
                  source.connect(gainNode);
                  gainNode.connect(globalAudioContextRef.current.destination);
                  source.start(nextStepTimeRef.current);
                  scheduledSourcesRef.current.add(source);
                }
              }
            });
          }
          
          nextStepTimeRef.current += currentStepDuration;
        }
        
        // 5. Continuar el bucle
        animationRef.current = requestAnimationFrame(scheduler);
      };
      
      animationRef.current = requestAnimationFrame(scheduler);
    } catch (error) {
      console.error('Error starting playback:', error);
      stopPlayback();
      setIsPlaying(false);
    }
  }, [
    //audioContextRef, 
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

const useRecording = ({  }) => {
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
          globalAudioContextRef.current.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const customKey = `custom${rowIndex}`;
            globalBuffersRef.current.set(customKey, audioBuffer);
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
          globalAudioContextRef.current.decodeAudioData(arrayBuffer, (audioBuffer) => {
            setShowNameInput(true);
            const tempName = `custom-${Date.now()}`;
            globalBuffersRef.current.set(tempName, audioBuffer);
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
      const buffer = globalBuffersRef.current.get(tempName);
      if (buffer) {
        globalBuffersRef.current.delete(tempName);
        globalBuffersRef.current.set(newSampleName.trim(), buffer);
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

const useSamples = ({ isPianoMode }) => { // Ya no necesitamos recibir audioContextRef
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  const loadSamples = useCallback(async () => {
    const samples = {
      kick: '/samples/uno.mp3', 
      snare: '/samples/dos.mp3', 
      hihat: '/samples/tres.mp3', 
      clap: 'samples/cuatro.mp3'
    };
    
    try {
      if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
        globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const responses = await Promise.all(
        Object.values(samples).map(url => fetch(url))
      );
      const arrayBuffers = await Promise.all(responses.map(res => res.arrayBuffer()));
      const audioBuffers = await Promise.all(
        arrayBuffers.map((buffer, index) =>
          globalAudioContextRef.current.decodeAudioData(buffer).catch(error => {
            console.error(`Error decoding ${Object.keys(samples)[index]}:`, error);
            return null;
          })
        )
      );
      
      audioBuffers.forEach((buffer, index) => {
        if (buffer) globalBuffersRef.current.set(Object.keys(samples)[index], buffer);
      });
      
      setSamplesLoaded(true);
    } catch (error) {
      console.error('Error loading samples:', error);
      setSamplesLoaded(false);
    }
  }, [isPianoMode]); // Eliminamos la dependencia de audioContextRef

  return {samplesLoaded, loadSamples };
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
  pianoSamples,
  //PREDEFINED_PIANO_SAMPLES,
  //globalSelectedPianoSampleRef,
  //globalAudioContextRef,
  //globalBuffersRef,
  BPM
}) => {
  const [currentSampleData, setCurrentSampleData] = useState({
    duration: 1,
    durationToUse: 1,
    isLoading: false
  });

  // Load and update sample when selected or context changes
  useEffect(() => {
    const loadAndUpdateSample = async () => {
      const sample = PREDEFINED_PIANO_SAMPLES.find(s => s.id === selectedPianoSample);
      if (!sample || !globalAudioContextRef.current) return;

      setCurrentSampleData(prev => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch(sample.path);
        if (!response.ok) throw new Error('Failed to fetch sample');
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await globalAudioContextRef.current.decodeAudioData(arrayBuffer);
        
        const calculatedDuration = Math.max(0.1, audioBuffer.duration);
        const safeDuration = Math.min(calculatedDuration, 10); // Cap at 10 seconds max
        
        // Update global reference
        globalSelectedPianoSampleRef.current = selectedPianoSample;
        globalSelectedPianoSampleRef.duration = safeDuration;
        globalSelectedPianoSampleRef.durationToUse = safeDuration;
        
        // Update local state
        setCurrentSampleData({
          duration: safeDuration,
          durationToUse: safeDuration,
          isLoading: false
        });

        // Store buffer
        globalBuffersRef.current.set('pianoSample', {
          buffer: audioBuffer,
          baseFreq: sample.baseFreq,
          duration: safeDuration
        });

      } catch (error) {
        console.error('Error loading sample:', error);
        setCurrentSampleData({
          duration: 1,
          durationToUse: 1,
          isLoading: false
        });
      }
    };

    loadAndUpdateSample();
  }, [selectedPianoSample]);

  const handleDurationChange = (e) => {
    const newValue = parseFloat(e.target.value);
    const clampedValue = Math.max(0.1, Math.min(currentSampleData.duration, newValue));
    
    setCurrentSampleData(prev => ({
      ...prev,
      durationToUse: clampedValue
    }));
    
    console.log(clampedValue);
    
    globalSelectedPianoSampleRef.durationToUse = clampedValue;
  };

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: 'red',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Mode Selection */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isPianoMode}
            onChange={togglePianoMode}
            style={{ marginRight: '8px' }}
          />
          Modo Piano (88 teclas)
        </label>
        
        {!isPianoMode && (
          <label style={{ display: 'flex', alignItems: 'center' }}>
            Número de filas:
            <input
              type="number"
              min="1"
              max="88"
              value={rows}
              onChange={(e) => handleRowsChange(Number(e.target.value))}
              disabled={isPianoMode}
              style={{ marginLeft: '8px', width: '60px', padding: '4px' }}
            />
          </label>
        )}
      </div>

      {/* Piano Sample Controls */}
      {isPianoMode && (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '10px',
      gap: '10px'
    }}>
      <label style={{ marginRight: '10px' }}>Sample de Piano:</label>
      <select
        value={selectedPianoSample}
        onChange={(e) => setSelectedPianoSample(e.target.value)}
        disabled={currentSampleData.isLoading}
        style={{ padding: '6px', minWidth: '150px' }}
      >
        {pianoSamples.map(sample => (
          <option key={sample.id} value={sample.id}>
            {sample.name} {currentSampleData.isLoading && sample.id === selectedPianoSample ? '...' : ''}
          </option>
        ))}
      </select>
      
      <button
        onClick={() => {
          if (!currentSampleData.isLoading && globalAudioContextRef.current) {
            const source = globalAudioContextRef.current.createBufferSource();
            const pianoSample = globalBuffersRef.current.get('pianoSample');
            if (pianoSample) {
              source.buffer = pianoSample.buffer;
              
              // Usar la nota base del sample (normalmente A4)
              const playbackRate = pianoSample.baseFreq / pianoSample.baseFreq; // 1:1 para el sonido original
              source.playbackRate.value = playbackRate;

              const gainNode = globalAudioContextRef.current.createGain();
              gainNode.gain.value = 0.8;

              // Configurar la duración según el control deslizante
              const durationToUse = Math.min(
                globalSelectedPianoSampleRef.durationToUse,
                pianoSample.buffer.duration
              );

              // Configurar fade-out
              const fadeOutDuration = Math.min(0.1, durationToUse * 0.1);
              const fadeOutStartTime = globalAudioContextRef.current.currentTime + durationToUse - fadeOutDuration;
              
              gainNode.gain.exponentialRampToValueAtTime(0.001, fadeOutStartTime + fadeOutDuration);
              
              source.connect(gainNode);
              gainNode.connect(globalAudioContextRef.current.destination);
              
              source.start(0);
              source.stop(globalAudioContextRef.current.currentTime + durationToUse + fadeOutDuration);
            }
          }
        }}
        disabled={currentSampleData.isLoading}
        style={{
          padding: '6px 12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: currentSampleData.isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <span>▶</span>
      </button>
    </div>
    
    {!currentSampleData.isLoading && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="range"
          min="0.10"
          max={currentSampleData.duration.toFixed(2)}
          step="0.01"
          value={currentSampleData.durationToUse}
          onChange={handleDurationChange}
          style={{ flex: 1, maxWidth: '300px' }}
        />
        <div style={{ minWidth: '150px' }}>
          Duración: {currentSampleData.durationToUse.toFixed(2)}s / {currentSampleData.duration.toFixed(2)}s
        </div>
      </div>
    )}
  </div>
)}

      {/* Recording Controls */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Grabar nuevo sample:</h3>
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1 }}>
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

      {/* Time Signature Controls */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Numerador:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={numerator}
            onChange={e => setNumerator(Number(e.target.value))}
            style={{ padding: '6px', width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Denominador:</label>
          <select 
            value={denominator} 
            onChange={e => setDenominator(Number(e.target.value))}
            style={{ padding: '6px', width: '100%' }}
          >
            {[1, 2, 4, 8, 16, 32].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Subdivisiones:</label>
          <input
            type="number"
            min="1"
            max="16"
            value={subdivisionsPerPulse}
            onChange={e => setSubdivisionsPerPulse(Number(e.target.value))}
            style={{ padding: '6px', width: '100%' }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Compases:</label>
          <input
            type="number"
            min="1"
            max="10"
            value={measures}
            onChange={e => setMeasures(Number(e.target.value))}
            style={{ padding: '6px', width: '100%' }}
          />
        </div>
      </div>

      {/* Display Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Scroll dinámico durante la reproducción
        </label>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Ancho del compás: {measureWidth}px
            </label>
            <input
              type="range"
              min="300"
              max="1200"
              value={measureWidth}
              onChange={e => setMeasureWidth(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Alto de la grilla: {componentHeight}px
            </label>
            <input
              type="range"
              min="230"
              max="600"
              value={componentHeight}
              onChange={e => setComponentHeight(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px'
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
        
        <div style={{ display: 'flex', gap: '20px', color: '#666' }}>
          <div>BPM: {BPM}</div>
          <div>Estado Audio: {audioContextState}</div>
        </div>
      </div>
    </div>
  );
};









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
  setRowSamples,
  handleSelectorColor,
  customSamples,
  recordingRow,
  startRecording,
  stopRecording,
  showLeftPanel = true,
  autoScroll = false,
  currentStep = 0
}) => {
  const [modalRowIndex, setModalRowIndex] = useState(null);
  const is88KeyMode = isPianoMode && rows === 88;
  const mainContainerRef = useRef(null);

  const handleCloseModal = () => {
    setModalRowIndex(null);
  };

  // Calculate octave groups for piano mode
  const octaveGroups = useMemo(() => {
    if (!is88KeyMode) return [];
    
    const groups = [];
    let groupStart = 0;
    for (let i = 0; i < rows; i++) {
      const note = pianoNotes[i];
      if (i > 0 && note[0] === 'B' && note[1] !== '#') {
        groups.push({
          start: groupStart,
          span: i - groupStart,
          label: pianoNotes[groupStart]
        });
        groupStart = i;
      }
    }
    groups.push({
      start: groupStart,
      span: rows - groupStart,
      label: pianoNotes[groupStart]
    });
    return groups;
  }, [is88KeyMode, rows, pianoNotes]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && mainContainerRef.current) {
      const container = mainContainerRef.current;
      const stepPosition = currentStep * cellWidth;
      const containerWidth = container.clientWidth;
      const scrollLeft = stepPosition - (containerWidth / 2) + (cellWidth / 2);
      
      // Limit scroll values
      const maxScroll = container.scrollWidth - containerWidth;
      const finalPosition = Math.max(0, Math.min(scrollLeft, maxScroll));
      
      container.scrollTo({
        left: finalPosition,
        behavior: 'smooth'
      });
    }
  }, [currentStep, autoScroll, cellWidth]);

  return (
    <div
      ref={mainContainerRef}
      style={{
        position: 'relative',
        width: `${measureWidth}px`,
        height: isPianoMode ? `${rows * rowHeight + 30}px` : `${componentHeight + 30}px`,
        overflow: 'auto',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        border: '1px solid #ddd'
      }}
    >
      {/* Header row with measure numbers */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 3,
          background: '#f5f5f5',
          paddingBottom: '2px'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${showLeftPanel ? '60px ' : ''}repeat(${totalSteps}, ${cellWidth}px)`,
            gap: '2px',
            width: `${showLeftPanel ? 60 + totalGridWidth : totalGridWidth}px`
          }}
        >
          {showLeftPanel && <div style={{ height: '30px' }} />}
          
          {/* Measure markers */}
          {Array.from({ length: totalSteps }).map((_, stepIndex) => {
            const isMeasureStart = stepIndex % totalStepsPerMeasure === 0;
            const isPulseStart = stepIndex % subdivisionsPerPulse === 0;
            const measureNumber = Math.floor(stepIndex / totalStepsPerMeasure) + 1;
            
            return (
              <div
                key={`header-${stepIndex}`}
                style={{
                  height: '30px',
                  position: 'relative',
                  borderLeft: isMeasureStart 
                    ? '3px solid #333' 
                    : isPulseStart 
                    ? '2px solid #666' 
                    : '1px solid #999',
                  backgroundColor: isMeasureStart ? '#e0e0e0' : '#eee'
                }}
              >
                {isMeasureStart && (
                  <div style={{
                    position: 'absolute',
                    left: '2px',
                    top: '2px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: '#333'
                  }}>
                    {measureNumber}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main grid content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `${showLeftPanel ? '60px ' : ''}repeat(${totalSteps}, ${cellWidth}px)`,
          gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
          gap: '2px',
          width: `${showLeftPanel ? 60 + totalGridWidth : totalGridWidth}px`,
          position: 'relative'
        }}
      >
        {/* Left panel */}
        {showLeftPanel && (
          <>
            {is88KeyMode ? (
              octaveGroups.map((group, idx) => (
                <div
                  key={`octave-${idx}`}
                  style={{
                    gridColumn: '1 / 2',
                    gridRow: `${group.start + 1} / span ${group.span}`,
                    position: 'sticky',
                    left: 0,
                    zIndex: 2,
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
              ))
            ) : (
              Array.from({ length: rows }).map((_, rowIndex) => (
                <React.Fragment key={`row-${rowIndex}`}>
                  <div
                    onClick={() => !isPianoMode && setModalRowIndex(rowIndex)}
                    style={{
                      gridColumn: '1 / 2',
                      gridRow: rowIndex + 1,
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      backgroundColor: isPianoMode && isBlackKey(pianoNotes[rowIndex]) 
                        ? '#333' 
                        : '#fff',
                      border: '1px solid #ddd',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: isPianoMode && isBlackKey(pianoNotes[rowIndex]) 
                        ? 'bold' 
                        : 'normal',
                      color: isPianoMode && isBlackKey(pianoNotes[rowIndex]) 
                        ? '#fff' 
                        : '#333',
                      cursor: !isPianoMode ? 'pointer' : 'default',
                      userSelect: 'none'
                    }}
                  >
                    {isPianoMode ? pianoNotes[rowIndex] : <span style={{fontSize: '15px'}}>Fila {rowIndex + 1}</span>}
                    
                    {!isPianoMode && (
                      <div style={{
                        display: 'block',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px'
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: getSampleColor(rowSamples[rowIndex]),
                          borderRadius: '2px'
                        }}/>
                        <span style={{
                          fontSize: '20px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '70px'
                        }}>
                          {rowSamples[rowIndex]}
                        </span>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              ))
            )}
          </>
        )}

        {/* Grid cells */}
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
                  gridColumn: `${showLeftPanel ? stepIndex + 2 : stepIndex + 1}`,
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
      </div>

      {/* Playback indicator */}
      <div
        style={{
          position: 'absolute',
          left: `${showLeftPanel ? '60px' : '0'}`,
          top: '30px',
          height: `calc(100% - 30px)`,
          width: '2px',
          backgroundColor: 'red',
          zIndex: 10,
          transform: `translateX(${currentStep * cellWidth}px)`,
          transition: autoScroll ? 'transform 0.1s linear' : 'none',
          willChange: 'transform'
        }}
      />

      {/* Row controls modal */}
      {!isPianoMode && (
        <Modal
          isOpen={modalRowIndex !== null}
          onClose={handleCloseModal}
          style={{
            width: 'auto',
            minWidth: '320px',
            maxWidth: '90vw'
          }}
        >
          {modalRowIndex !== null && (
            <div style={{ padding: '20px' }}>
              <h3 style={{ 
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: getSampleColor(rowSamples[modalRowIndex]),
                  borderRadius: '4px'
                }}/>
                Controles de Fila {modalRowIndex + 1}
              </h3>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                width: '100%'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  width: '100%'
                }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: getSampleColor(rowSamples[modalRowIndex]),
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    onClick={() => handleSelectorColor(
                      getSampleColor(rowSamples[modalRowIndex]), 
                      rowSamples[modalRowIndex]
                    )}
                  />
                  
                  <select
                    value={rowSamples[modalRowIndex]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRowSamples(prev => {
                        const newArr = [...prev];
                        newArr[modalRowIndex] = value;
                        return newArr;
                      });
                    }}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      width: '100%',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
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
                    onClick={recordingRow === modalRowIndex ? stopRecording : () => startRecording(modalRowIndex)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: recordingRow === modalRowIndex ? '#ff4444' : '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {recordingRow === modalRowIndex ? '⏹ Detener' : '🎤 Grabar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

Grid.defaultProps = {
  selectedCells: new Set(),
  showLeftPanel: true,
  autoScroll: false,
  currentStep: 0
};


// Componente de toggle externo
const SequencerToggle = ({ showLeftPanel, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '8px 16px',
        backgroundColor: showLeftPanel ? '#ff4444' : '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '10px',
        fontSize: '14px',
        transition: 'all 0.3s ease'
      }}
    >
      {showLeftPanel ? '◄ Ocultar Panel Izquierdo' : '► Mostrar Panel Izquierdo'}
    </button>
  );
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
    flexDirection: 'column',
    gap: '15px',
    width: '100%'
  }}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={`legend-${rowIndex}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: getSampleColor(rowSamples[rowIndex]),
            borderRadius: '4px',
            cursor: 'pointer',
            flexShrink: 0
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
          style={{ 
            padding: '8px', 
            borderRadius: '6px', 
            width: '100%',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
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
            padding: '8px 12px',
            backgroundColor: recordingRow === rowIndex ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {recordingRow === rowIndex ? (
            <>
              <span>⏹</span>
              <span>Detener</span>
            </>
          ) : (
            <>
              <span>🎤</span>
              <span>Grabar</span>
            </>
          )}
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



  const [activeModal, setActiveModal] = useState(null); // 'colorPicker' | 'rowControls' | null
  // Reemplaza tus estados individuales por este
  const [modalData, setModalData] = useState({
    color: '',
    selectedKey: '',
    rowIndex: null
  });

  // Funciones para manejar modales
const openColorPicker = (color, key) => {
  setActiveModal('colorPicker');
  setModalData({ color, selectedKey: key, rowIndex: null });
};

const openRowControls = (rowIndex) => {
  setActiveModal('rowControls');
  setModalData({ color: '', selectedKey: '', rowIndex });
};

const closeModal = () => {
  setActiveModal(null);
  setModalData({ color: '', selectedKey: '', rowIndex: null });
};


  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

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
  const { samplesLoaded, loadSamples } = useSamples({ isPianoMode, audioContextRef });
  const pianoSynth = usePianoSynth({ audioContextRef });
  const playback = usePlayback({
    //audioContextRef,
    isPlayingRef: useRef(isPlaying),
    selectedCellsRef,
    numeratorRef,
    subdivisionsPerPulseRef,
    measuresRef,
    measureWidthRef,
    rowSamplesRef,
    rowsRef,
    isPianoModeRef,
    //buffersRef,
    pianoNotes: PIANO_NOTES,
    setCurrentStep
  });
  const recording = useRecording({ });

  

  useEffect(() => {
    const loadPianoSample = async () => {
      if (!isPianoMode) return;
      
      const sample = PREDEFINED_PIANO_SAMPLES.find(s => s.id === selectedPianoSample);
      if (!sample) return;

      try {
        const response = await fetch(sample.path);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await globalAudioContextRef.current.decodeAudioData(arrayBuffer);

        globalSelectedPianoSampleRef.current = selectedPianoSample;
        globalSelectedPianoSampleRef.duration = audioBuffer.duration
        globalSelectedPianoSampleRef.durationToUse = audioBuffer.duration
        
        globalBuffersRef.current.set('pianoSample', {
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
    playback.playSound(sound, globalAudioContextRef.current.currentTime + 0.05);
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


<SequencerToggle 
        showLeftPanel={showLeftPanel} 
        onToggle={() => setShowLeftPanel(!showLeftPanel)}
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
        //rows={rows}
          //rowSamples={rowSamples}
          setRowSamples={setRowSamples}
          //getSampleColor={getSampleColor}
          handleSelectorColor={handleSelectorColor}
          customSamples={recording.customSamples}
          recordingRow={recording.recordingRow}
          startRecording={recording.startRecording}
          stopRecording={recording.stopRecording}
          showLeftPanel={showLeftPanel}
          setShowLeftPanel={setShowLeftPanel}
          autoScroll={autoScroll}
          currentStep={currentStep}
      />

      
    </div>
  );
};

export default SubdivisionGrid;