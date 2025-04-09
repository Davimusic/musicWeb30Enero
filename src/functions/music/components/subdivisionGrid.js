import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';
import RangeInput from '@/components/complex/rangeInput';
import TogglePlayPause from '@/components/complex/TogglePlayPause';
import CustomNumberInput from '@/components/complex/customNumberInput';
import CheckBox from '@/components/complex/checkBox';
'../../../estilos/general/general.css'
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
  const tempSampleNameRef = useRef(''); 

  const playCountdownBeep = useCallback((count, onFinish) => {
    if (!globalAudioContextRef.current) {
      globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const beepDuration = 0.1;
    const interval = 0.5; // medio segundo entre beeps
    const startTime = globalAudioContextRef.current.currentTime;

    for (let i = 0; i < count; i++) {
      const time = startTime + i * interval;
      
      const osc = globalAudioContextRef.current.createOscillator();
      const gain = globalAudioContextRef.current.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(i === count - 1 ? 880 : 440, time); // último beep más agudo
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + beepDuration);
      
      osc.connect(gain);
      gain.connect(globalAudioContextRef.current.destination);
      
      osc.start(time);
      osc.stop(time + beepDuration);
    }

    if (onFinish) {
      setTimeout(onFinish, count * interval * 1000);
    }
  }, []);

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
            const tempName = `custom-${Date.now()}`;
            tempSampleNameRef.current = tempName; // Guardamos el nombre temporal
            globalBuffersRef.current.set(tempName, audioBuffer);
            setNewSampleName(tempName);
            setShowNameInput(true);
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

  const saveCustomSample = () => {
    if (newSampleName.trim()) {
      const tempName = tempSampleNameRef.current; // Usamos el nombre temporal guardado
      const buffer = globalBuffersRef.current.get(tempName);
      
      if (buffer) {
        // Eliminar el nombre temporal
        globalBuffersRef.current.delete(tempName);
        
        // Guardar con el nuevo nombre
        globalBuffersRef.current.set(newSampleName.trim(), buffer);
        
        // Actualizar la lista de custom samples
        setCustomSamples(prev => [...prev, { 
          name: newSampleName.trim(), 
          buffer 
        }]);
        
        // Resetear el estado
        setShowNameInput(false);
        setNewSampleName('');
        tempSampleNameRef.current = ''; // Limpiar el nombre temporal
      }
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
    saveCustomSample,
    playCountdownBeep
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
  playCountdownBeep,
  BPM
}) => {
  const [countdown, setCountdown] = useState(null);
  const [currentSampleData, setCurrentSampleData] = useState({
    duration: 1,
    durationToUse: 1,
    isLoading: false
  });

  const handleStartRecording = async () => {
    try {
      if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
        globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      setCountdown(4);
      
      playCountdownBeep(4, () => {
        setCountdown(null);
        startGlobalRecording();
      });
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 500);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setCountdown(null);
    }
  };

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
        const safeDuration = Math.min(calculatedDuration, 10);
        
        globalSelectedPianoSampleRef.current = selectedPianoSample;
        globalSelectedPianoSampleRef.duration = safeDuration;
        globalSelectedPianoSampleRef.durationToUse = safeDuration;
        
        setCurrentSampleData({
          duration: safeDuration,
          durationToUse: safeDuration,
          isLoading: false
        });

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

  const handleDurationChange = (value) => {
    const newValue = parseFloat(value);
    const clampedValue = Math.max(0.1, Math.min(currentSampleData.duration, newValue));
    
    setCurrentSampleData(prev => ({
      ...prev,
      durationToUse: clampedValue
    }));
    
    globalSelectedPianoSampleRef.durationToUse = clampedValue;
  };

  const handleSamplePreview = () => {
    if (!currentSampleData.isLoading && globalAudioContextRef.current) {
      const source = globalAudioContextRef.current.createBufferSource();
      const pianoSample = globalBuffersRef.current.get('pianoSample');
      if (pianoSample) {
        source.buffer = pianoSample.buffer;
        const playbackRate = pianoSample.baseFreq / pianoSample.baseFreq;
        source.playbackRate.value = playbackRate;

        const gainNode = globalAudioContextRef.current.createGain();
        gainNode.gain.value = 0.8;

        const durationToUse = Math.min(
          currentSampleData.durationToUse,
          pianoSample.buffer.duration
        );

        const fadeOutDuration = Math.min(0.1, durationToUse * 0.1);
        const fadeOutStartTime = globalAudioContextRef.current.currentTime + durationToUse - fadeOutDuration;
        
        gainNode.gain.exponentialRampToValueAtTime(0.001, fadeOutStartTime + fadeOutDuration);
        
        source.connect(gainNode);
        gainNode.connect(globalAudioContextRef.current.destination);
        
        source.start(0);
        source.stop(globalAudioContextRef.current.currentTime + durationToUse + fadeOutDuration);
      }
    }
  };

  return (
    <div className='backgroundColor2' style={{ 
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      width: '70vw'
    }}>
      {/* Recording Controls */}
      <div className='backgroundColor4'
      style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Record new sample:</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={isGlobalRecording ? stopGlobalRecording : handleStartRecording}
            style={{ 
              padding: '8px 16px',
              backgroundColor: isGlobalRecording ? '#ff4444' : '#4CAF50', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isGlobalRecording ? '⏹ Stop recording' : '🎤 Record new sample'}
          </button>

          {showNameInput && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={newSampleName}
                onChange={(e) => setNewSampleName(e.target.value)}
                placeholder="Sample name"
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
                Save
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Mode Selection */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center' }}>
          <CheckBox
            checked={isPianoMode}
            onChange={togglePianoMode}
          />
          Piano Roll
        </label>
        
        {!isPianoMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px', flexWrap: 'wrap' }}>
            <label style={{ marginRight: '10px' }}>Number of rows:</label>
            <div style={{display: 'flex'}}>
            <RangeInput
              min={1}
              max={30}
              value={rows}
              onChange={handleRowsChange}
              colorClass="color3"
              backgroundColorClass="backgroundColor1"
              showLabel={false}
            />
            
            <CustomNumberInput 
              min={1}
              max={30}
              step={1}
              value={rows}
              onChange={(e) => handleRowsChange(Number(e.target.value))} />
            </div>

          </div>
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
            <label style={{ marginRight: '10px' }}>Piano Sample:</label>
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
            
            <div 
              onClick={handleSamplePreview}
              style={{
                padding: '6px',
                cursor: currentSampleData.isLoading ? 'not-allowed' : 'pointer',
                opacity: currentSampleData.isLoading ? 0.5 : 1
              }}
            >
              <TogglePlayPause 
                size={24}
                isPlaying={false}
                onToggle={handleSamplePreview}
              />
            </div>
          </div>
          
          {!currentSampleData.isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '150px' }}>
                  Duration: {currentSampleData.durationToUse.toFixed(2)}s / {currentSampleData.duration.toFixed(2)}s
              </div>
              <div style={{display: 'flex'}}>
                <RangeInput
                  min={0.10}
                  max={currentSampleData.duration.toFixed(2)}
                  step={0.01}
                  value={currentSampleData.durationToUse}
                  onChange={handleDurationChange}
                  colorClass="color3"
                  backgroundColorClass="backgroundColor1"
                  showLabel={false}
                >
                </RangeInput>
                <CustomNumberInput
                  min={0.10}
                  max={Number(currentSampleData.duration.toFixed(2))} // Convertir a número
                  step={0.01}
                  value={Number(currentSampleData.durationToUse.toFixed(2))} // Convertir a número
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {countdown !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '120px',
            fontWeight: 'bold',
            color: '#fff',
            textShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}>
            {countdown}
          </div>
        </div>
      )}

      

      {/* Time Signature Controls */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{marginRight: '10px'}}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Numerator:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RangeInput
              min={1}
              max={12}
              value={numerator}
              onChange={setNumerator}
              colorClass="color3"
              backgroundColorClass="backgroundColor1"
              showLabel={false}
            />
            <CustomNumberInput
              min={1}
              max={12}
              value={numerator}
              onChange={(e) => setNumerator(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Denominator:</label>
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
        
        <div >
          <label style={{ display: 'block', marginBottom: '5px' }}>Subdivisions:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
            <RangeInput
              min={1}
              max={12}
              value={subdivisionsPerPulse}
              onChange={setSubdivisionsPerPulse}
              colorClass="color3"
              backgroundColorClass="backgroundColor1"
              showLabel={false}
            />
            <CustomNumberInput
              min={1}
              max={12}
              value={subdivisionsPerPulse}
              onChange={(e) => setSubdivisionsPerPulse(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Measures:</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
            <RangeInput
              min={1}
              max={12}
              value={measures}
              onChange={setMeasures}
              colorClass="color3"
              backgroundColorClass="backgroundColor1"
              showLabel={false}
            />
            <CustomNumberInput
              min={1}
              max={12}
              value={measures}
              onChange={(e) => setMeasures(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Display Controls */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <CheckBox
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll during playback
        </label>
        
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Measure width:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
              <RangeInput
                min={300}
                max={1200}
                value={measureWidth}
                onChange={setMeasureWidth}
                colorClass="color3"
                backgroundColorClass="backgroundColor1"
                showLabel={false}
              />
              <CustomNumberInput
                min={300}
                max={1200}
                value={measureWidth}
                onChange={(e) => setMeasureWidth(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Grid height:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
              <RangeInput
                min={230}
                max={600}
                value={componentHeight}
                onChange={setComponentHeight}
                colorClass="color3"
                backgroundColorClass="backgroundColor1"
                showLabel={false}
              />
              <CustomNumberInput
                min={230}
                max={600}
                value={componentHeight}
                onChange={(e) => setComponentHeight(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}









































const Grid = ({
  isPianoMode,
  rows,
  totalSteps,
  totalStepsPerMeasure,
  subdivisionsPerPulse,
  measureWidth,      // ancho total del secuenciador
  componentHeight,
  rowHeight,
  totalGridWidth,    // (no se usa en esta versión)
  cellWidth,
  selectedCells,
  rowSamples,
  pianoNotes,
  isBlackKey,
  getSampleColor,
  handleCellClick,
  openModal,
  showLeftPanel = true,
  currentStep = 0
}) => {
  // Panel izquierdo de ancho fijo
  const leftPanelWidth = showLeftPanel ? 60 : 0;
  // Área visible del timeline (excluyendo el panel izquierdo)
  const timelineVisibleWidth = measureWidth - leftPanelWidth;
  // Ancho interno extendido para permitir scroll completo
  const timelineTotalWidth = totalSteps * cellWidth + timelineVisibleWidth;

  // Referencia para el contenedor scrollable
  const timelineContainerRef = useRef(null);

  // Actualizamos el scroll inmediatamente al cambiar currentStep
  useLayoutEffect(() => {
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollLeft = currentStep * cellWidth;
    }
  }, [currentStep, cellWidth]);

  // Modo piano 88 teclas: agrupar octavas sin espacios adicionales
  const is88KeyMode = isPianoMode && rows === 88;
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

  return (
    <div
      style={{
        display: 'flex',
        width: `${measureWidth}px`,
        border: '1px solid #ddd',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        boxSizing: 'border-box'
      }}
    >
      {/* PANEL IZQUIERDO */}
      {showLeftPanel && (
        <div style={{ width: `${leftPanelWidth}px`, flexShrink: 0, boxSizing: 'border-box' }}>
          {/* Se reserva el espacio del header para alinear verticalmente */}
          <div style={{ height: '45px', boxSizing: 'border-box' }}></div>
          {is88KeyMode ? (
            octaveGroups.map((group, idx) => (
              <div
                key={`octave-${idx}`}
                style={{
                  height: `${group.span * rowHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#000',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box'
                }}
              >
                {group.label}
              </div>
            ))
          ) : (
            Array.from({ length: rows }).map((_, rowIndex) => (
              <div
                key={`row-${rowIndex}`}
                onClick={() =>
                  !isPianoMode &&
                  openModal('rowControls', {
                    getSampleColor: getSampleColor(rowSamples[rowIndex]),
                    rowIndex,
                    rowSamples: rowSamples[rowIndex]
                  })
                }
                style={{
                  height: `${rowHeight}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  color: '#000',
                  border: '1px solid #ddd',
                  cursor: !isPianoMode ? 'pointer' : 'default',
                  userSelect: 'none',
                  boxSizing: 'border-box',
                  flexWrap: 'wrap',
                  overflowX: 'auto'
                }}
              >
                {isPianoMode ? (
                  pianoNotes[rowIndex]
                ) : (
                  <span style={{ fontSize: '15px' }}>Row {rowIndex + 1}</span>
                )}
                {!isPianoMode && (
                  <div
                    style={{
                      marginTop: '2px',
                      display: 'block',
                      alignItems: 'center',
                      gap: '4px',
                      
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: getSampleColor(rowSamples[rowIndex]),
                        borderRadius: '2px'
                      }}
                    />
                    <span
                      style={{
                        fontSize: '20px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '70px'
                      }}
                    >
                      {rowSamples[rowIndex]}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* SECCIÓN DEL TIMELINE */}
      <div
        style={{
          width: `${timelineVisibleWidth}px`,
          overflowX: 'auto',
          position: 'relative',
          scrollBehavior: 'auto',
          boxSizing: 'border-box'
        }}
        ref={timelineContainerRef}
      >
        <div style={{ width: `${timelineTotalWidth}px`, boxSizing: 'border-box' }}>
          {/* HEADER: Regla con tres niveles sin padding extra */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${totalSteps}, ${cellWidth}px)`,
              gridTemplateRows: '15px 15px 15px',
              height: '45px',
              boxSizing: 'border-box'
            }}
          >
            {Array.from({ length: totalSteps }).map((_, stepIndex) => {
              // Índice local dentro de cada compás
              const localStep = stepIndex % totalStepsPerMeasure;
              const measureLabel = localStep === 0
                ? Math.floor(stepIndex / totalStepsPerMeasure) + 1
                : "";
              // Mostrar el número de pulso SOLO al inicio del pulso
              const pulseLabel = localStep % subdivisionsPerPulse === 0
                ? Math.floor(localStep / subdivisionsPerPulse) + 1
                : "";
              // La subdivisión se muestra siempre (sumandole 1 para que inicie en 1)
              const subdivisionLabel = (localStep % subdivisionsPerPulse) + 1;

              let borderLeft = '1px solid #999';
              if (localStep === 0) {
                borderLeft = '3px solid #333';
              } else if (localStep % subdivisionsPerPulse === 0) {
                borderLeft = '2px solid #666';
              }
              const bgColor = localStep === 0 ? '#e0e0e0' : '#eee';

              return (
                <div
                  key={`header-${stepIndex}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    width: `${cellWidth}px`,
                    height: '45px',
                    borderLeft,
                    backgroundColor: bgColor
                  }}
                >
                  <div style={{ fontSize: '14px', height: '15px', lineHeight: '15px', color: '#000' }}>
                    {measureLabel}
                  </div>
                  <div style={{ fontSize: '12px', height: '15px', lineHeight: '15px', color: '#000' }}>
                    {pulseLabel}
                  </div>
                  <div style={{ fontSize: '10px', height: '15px', lineHeight: '15px', color: '#000' }}>
                    {subdivisionLabel}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CONTENEDOR DE CELDAS Y LÍNEAS DE OCTAVA (solo en modo 88) */}
          <div
            style={{
              position: 'relative',
              height: `${rows * rowHeight}px`,
              boxSizing: 'border-box'
            }}
          >
            {/* Líneas horizontales para separar octavas */}
            {is88KeyMode &&
              octaveGroups.map((group, idx) => {
                const startY = group.start * rowHeight;
                const endY = (group.start + group.span) * rowHeight;
                return (
                  <React.Fragment key={`oct-boundaries-${idx}`}>
                    <div
                      style={{
                        position: 'absolute',
                        top: `${startY}px`,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        backgroundColor: '#333',
                        zIndex: 2
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: `${endY - 2}px`,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        backgroundColor: '#333',
                        zIndex: 2
                      }}
                    />
                  </React.Fragment>
                );
              })
            }

            {/* CUADRÍCULA DE CELDAS */}
            {Array.from({ length: rows }).map((_, rowIndex) =>
              Array.from({ length: totalSteps }).map((_, stepIndex) => {
                const cellId = `${rowIndex}-${stepIndex}`;
                const isActive = selectedCells.has(cellId);
                
                // Calcular el color de fondo:
                // Si está activa, en modo 88 se usa un color fijo para la selección.
                // Si no, en modo 88 para teclas negras se aplica transparencia.
                const cellBgColor = isActive
                  ? (isPianoMode && is88KeyMode
                      ? 'rgba(76, 175, 80, 0.8)'  // color de selección en 88-key mode
                      : getSampleColor(rowSamples[rowIndex]))
                  : (isPianoMode && is88KeyMode && isBlackKey(pianoNotes[rowIndex])
                      ? 'rgba(34, 34, 34, 0.7)'
                      : '#f9f9f9');
                
                // Si la celda está activa, se aplican bordes más redondeados.
                const borderRadiusValue = isActive ? '8px' : '2px';

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
                      position: 'absolute',
                      left: `${stepIndex * cellWidth}px`,
                      top: `${rowIndex * rowHeight}px`,
                      width: `${cellWidth}px`,
                      height: `${rowHeight}px`,
                      backgroundColor: cellBgColor,
                      border: 'none',
                      borderLeft: cellBorderLeft,
                      borderTop: '1px solid #eee',
                      borderBottom: '1px solid #eee',
                      borderRight: '1px solid #eee',
                      borderRadius: borderRadiusValue,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* En modo piano, si la celda está activa se muestra el nombre de la nota (con octava) */}
                    {isActive && isPianoMode && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '10px',
                          color: '#fff',
                          pointerEvents: 'none'
                        }}
                      >
                        {pianoNotes[rowIndex]}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Grid.defaultProps = {
  selectedCells: new Set(),
  showLeftPanel: true,
  currentStep: 0,
};



















































const SequencerToggle = ({ 
  showLeftPanel, 
  onToggle, 
  isPlaying, 
  togglePlayback,
  openModal,
  isGlobalRecording,
  handleStartRecording,
  stopGlobalRecording,
  showNameInput,
  newSampleName,
  setNewSampleName,
  saveCustomSample
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      alignItems: 'center',
      marginBottom: '10px'
    }}>
      <button
        onClick={onToggle}
        style={{
          padding: '8px 16px',
          backgroundColor: showLeftPanel ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
      >
        {showLeftPanel ? '◄ Ocultar Panel Izquierdo' : '► Mostrar Panel Izquierdo'}
      </button>

      <TogglePlayPause 
        size={20}
        isPlaying={isPlaying}
        onToggle={togglePlayback}
      />

      <button
        onClick={() => openModal('recordingControls')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.3s ease'
        }}
      >
        Controls
      </button>
    </div>
  );
};





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



  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,       // 'colorPicker' | 'rowControls' | 'samplePicker' | etc.
    data: {           // Datos específicos para cada tipo de modal
      color: '',
      selectedKey: '',
      rowIndex: null,
      sample: null
    }
  });

  const openModal = (type, data = {}) => {
    setModalState({
      isOpen: true,
      type,
      data: {
        ...data,
        // Valores por defecto
        color: data.color || '',
        selectedKey: data.selectedKey || '',
        rowIndex: data.rowIndex !== undefined ? data.rowIndex : null,
        sample: data.sample || null
      }
    });
  };
  
  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const renderModalContent = () => {
    const { type, data } = modalState;
  
    switch (type) {
      case 'colorPicker':
        return (
          <SingleColorPickerModalContent 
            initialColor={data.color}
            onColorUpdate={(newColor) => {
              changeObjectColor(data.selectedKey, newColor);
              closeModal();
            }}
            onClose={closeModal}
          />
        );
  
      case 'rowControls':
          const { rowIndex, rowSamples: currentSample, getSampleColor: sampleColor } = modalState.data;
          return (
            <div style={{ padding: '20px' }}>
              <h3 style={{ 
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                
                Row {rowIndex + 1}
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
                      backgroundColor: getSampleColor(currentSample),//sampleColor,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    onClick={() => openModal('colorPicker', { 
                      color: sampleColor, 
                      selectedKey: currentSample,
                      rowIndex 
                    })}
                  />
                  
                  <select
                    value={currentSample}
                    onChange={(e) => {
                      const value = e.target.value;
                      setRowSamples(prev => {
                        const newArr = [...prev];
                        newArr[rowIndex] = value;
                        modalState.data['rowSamples'] = value
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
                    {recording.customSamples.map((sample, idx) => (
                      <option key={idx} value={sample.name}>
                        {sample.name}
                      </option>
                    ))}
                  </select>
                  
                  
                </div>
              </div>
            </div>
          );
  
      case 'samplePicker':
        return (
          <div style={{ padding: '20px' }}>
            <h3>Seleccionar Sample</h3>
            {/* Implementación del selector de samples */}
          </div>
        );
  
      case 'recordingControls':
        return (
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
            playCountdownBeep={playCountdownBeep}
            BPM={BPM}
          />
        );

      default:
        return null;
    }
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
    setCurrentStep,
  });
  const recording = useRecording({ });
  const { playCountdownBeep } = recording;
  

  

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
      paddingLeft: '5px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={closeModal}
        style={{
          width: 'auto',
          minWidth: '320px',
          maxWidth: '90vw'
        }}
      >
        {renderModalContent()}
      </Modal>

      


      <SequencerToggle 
        showLeftPanel={showLeftPanel} 
        onToggle={() => setShowLeftPanel(!showLeftPanel)}
        isPlaying={isPlaying}
        togglePlayback={() => playback.togglePlayback(isPlaying, setIsPlaying, autoScroll, samplesLoaded)}
        openModal={openModal}
        isGlobalRecording={recording.isGlobalRecording}
        handleStartRecording={recording.handleStartRecording}
        stopGlobalRecording={recording.stopGlobalRecording}
        showNameInput={recording.showNameInput}
        newSampleName={recording.newSampleName}
        setNewSampleName={recording.setNewSampleName}
        saveCustomSample={recording.saveCustomSample}
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
          openModal={openModal}
      />

      
    </div>
  );
};

export default SubdivisionGrid;