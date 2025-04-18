/*import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';
import RangeInput from '@/components/complex/rangeInput';
import TogglePlayPause from '@/components/complex/TogglePlayPause';
import CustomNumberInput from '@/components/complex/customNumberInput';
import CheckBox from '@/components/complex/checkBox';
import MenuIcon from '@/components/complex/menuIcon';
'../../../estilos/general/general.css'
import PropTypes from 'prop-types';


// subdivisionGrid.js
const samplesContext = require.context('/public/samples', true, /\.(mp3|wav)$/i);

const generateSampleGroups = () => {
  const groups = {
    global: {},
    public: {}
  };
  
  samplesContext.keys().forEach((filePath) => {
    // Ejemplo de filePath: "./global/percussion/kick.wav" o "./public/samples/drums/kick.wav"
    const parts = filePath.split('/').filter(part => part !== '.' && part !== '');
    
    if (parts.length < 3) {
      console.warn(`Invalid file path structure: ${filePath}`);
      return;
    }
    
    const type = parts[0]; // 'global' o 'public'
    const category = parts[1]; // 'percussion', 'voice', etc.
    const fileNameWithExt = parts[2];
    const fileName = fileNameWithExt.replace(/\.[^/.]+$/, ''); // Remueve extensión
    
    if (!groups[type]) {
      groups[type] = {};
    }
    
    if (!groups[type][category]) {
      groups[type][category] = [];
    }
    
    if (!groups[type][category].includes(fileName)) {
      groups[type][category].push(fileName);
    }
  });
  
  return groups;
};

const sampleGroups = generateSampleGroups();
const sampleFolderNames = {
  global: Object.keys(sampleGroups.global),
  public: Object.keys(sampleGroups.public)
};

const getInitialSamples = () => {
  const percussionSamples = sampleGroups.global?.percussion || [];
  return percussionSamples.slice(0, DEFAULT_ROWS);
};


const BPM = 120;
const DEFAULT_ROWS = 4;
const PIANO_KEYS = 88;

const globalBuffersRef = { current: new Map() };
const globalSelectedPianoSampleRef = { current: 'piano', duration: 0, durationToUse: 1 };
const globalAudioContextRef = { current: null };


const PREDEFINED_PIANO_SAMPLES = [
  { id: 'piano', name: 'Piano (A4)', path: '/samples/keyboards/C3-1s.wav', baseFreq: 440 },
  { id: 'voz', name: 'Voz (A4)', path: '/samples/voice/vos.wav', baseFreq: 440 },
  { id: 'uno', name: 'Uno (A4)', path: '/samples/percussion/uno.mp3', baseFreq: 440 },
  { id: 'C', name: 'C (A4)', path: '/samples/keyboards/C3.wav', baseFreq: 440 },
  { id: 'hu', name: 'hu', path: '/samples/voice/hu.wav', baseFreq: 440 },
];

const getNoteName = (midiNote) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  return `${noteNames[midiNote % 12]}${octave}`;
};

const PIANO_NOTES = Array.from({ length: 88 }, (_, i) => getNoteName(21 + i)).reverse();

//const DEFAULT_SAMPLES = ['kick', 'snare', 'hihat', 'clap'];
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
    return globalAudioContextRef.current; // Retornar la instancia global
  }, []);

  return { 
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
  isPlayingRef,
  selectedCellsRef,
  numeratorRef,
  subdivisionsPerPulseRef,
  measuresRef,
  measureWidthRef,
  rowSamplesRef,
  rowsRef,
  isPianoModeRef,
  pianoNotes,
  setCurrentStep
}) => {
  // Usar globalAudioContextRef en lugar de audioContextRef
  const scheduledSourcesRef = useRef(new Set());


  const { initAudioContext } = useAudioContext();
  const { samplesLoaded, loadSamples } = useSamples();

  const stableLoadSamples = useCallback(() => {
    return loadSamples();
  }, [loadSamples]); // Ahora loadSamples es estable

  useEffect(() => {
    const loadAndInit = async () => {
      await initAudioContext();
      await stableLoadSamples();
    };
    
    loadAndInit().catch(console.error);
  
    return () => {
      if (globalAudioContextRef.current) {
        globalAudioContextRef.current.close();
      }
    };
  }, [stableLoadSamples, initAudioContext]);
  
  const playSound = useCallback((sound, time) => {
    if (!globalAudioContextRef.current) return;
    
    const buffer = globalBuffersRef.current.get(sound);
    if (!buffer) return;

    const source = globalAudioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(globalAudioContextRef.current.destination);
    source.start(time);
    
    source.onended = () => scheduledSourcesRef.current.delete(source);
    scheduledSourcesRef.current.add(source);
  }, []);
};



// 5. Modificar la inicialización en el useEffect principal


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


const useSamples = () => {
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const { initAudioContext } = useAudioContext();

  const safeDecodeAudioData = useCallback(async (arrayBuffer) => {
    try {
      if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
        await initAudioContext();
      }
      return await globalAudioContextRef.current.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error decodificando audio:', error);
      throw error;
    }
  }, [initAudioContext]);

  const loadGroup = useCallback(async (groupName, categories) => {
    const EXTENSIONS = ['.wav', '.mp3', '.ogg'];
    
    for (const [category, samples] of Object.entries(categories)) {
      for (const sample of samples) {
        let audioBuffer;
        let foundExtension;
        
        // Intentar diferentes extensiones
        for (const ext of EXTENSIONS) {
          const path = `/samples/${groupName}/${category}/${sample}${ext}`;
          try {
            const response = await fetch(path);
            if (!response.ok) continue;
            
            const arrayBuffer = await response.arrayBuffer();
            audioBuffer = await safeDecodeAudioData(arrayBuffer);
            foundExtension = ext;
            break;
          } catch (error) {
            continue;
          }
        }

        if (!audioBuffer) {
          console.warn(`Sample no encontrado: ${sample} en ${groupName}/${category}`);
          continue;
        }

        globalBuffersRef.current.set(sample, audioBuffer);
        console.log(`✅ ${sample}${foundExtension} cargado`);
      }
    }
  }, [safeDecodeAudioData]);

  const loadSamples = useCallback(async () => {
    try {
      setSamplesLoaded(false);
      setLoadingError(null);
      
      // 1. Inicializar AudioContext primero
      await initAudioContext();

      // 2. Cargar samples predefinidos del piano
      await Promise.all(PREDEFINED_PIANO_SAMPLES.map(async (sample) => {
        try {
          const response = await fetch(sample.path);
          if (!response.ok) {
            if (sample.fallback) return;
            throw new Error(`HTTP ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await safeDecodeAudioData(arrayBuffer);
          globalBuffersRef.current.set(sample.id, audioBuffer);
        } catch (error) {
          if (!sample.fallback) throw error;
        }
      }));

      // 3. Cargar samples globales
      await loadGroup('global', sampleGroups.global);

      // 4. Cargar samples públicos (opcional)
      if (sampleGroups.public) {
        await loadGroup('public', sampleGroups.public);
      }

      setSamplesLoaded(true);
    } catch (error) {
      console.error('Error crítico cargando samples:', error);
      setLoadingError(error.message);
      setSamplesLoaded(false);
    }
  }, [initAudioContext, loadGroup, safeDecodeAudioData]);

  useEffect(() => {
    const loadAndInit = async () => {
      await initAudioContext(); // Inicializar primero el contexto
      await loadSamples();
    };
    
    loadAndInit().catch(error => {
      console.error("Error de inicialización:", error);
    });
  
    return () => {
      if (globalAudioContextRef.current) {
        globalAudioContextRef.current.close();
      }
    };
  }, [loadSamples, initAudioContext]);

  return {
    samplesLoaded,
    loadSamples,
    loadingError
  };
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
                min={40}
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
  measureWidth,
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
  openModal,
  showLeftPanel = true,
  currentStep = 0
}) => {
  // Estados para las filas ocultas y para gestionar efectos de hover en el panel izquierdo
  const [hiddenRows, setHiddenRows] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const timelineContainerRef = useRef(null);

  // Calculamos el ancho del panel izquierdo y el área visible del timeline.
  const leftPanelWidth = showLeftPanel ? 60 : 0;
  const timelineVisibleWidth = measureWidth - leftPanelWidth;
  
  // ORIGINAL: Se agregaba timelineVisibleWidth para permitir scroll.
  // CORRECCIÓN: Se usa el ancho del contenedor padre (measureWidth) en lugar de timelineVisibleWidth.
  const timelineTotalWidth = totalSteps * cellWidth + measureWidth;

  // Auto-scroll para centrar el currentStep en el timeline.
  useLayoutEffect(() => {
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollLeft = currentStep * cellWidth;
    }
  }, [currentStep, cellWidth]);

  // Definimos el alto mínimo para filas o contenedores colapsados (ahora 16px, el doble de 8px)
  const MIN_ROW_HEIGHT = 16;

  // En el modo no 88, si la fila está oculta se le asigna MIN_ROW_HEIGHT, sino, rowHeight.
  const getEffectiveRowHeight = (rowIndex) =>
    hiddenRows.has(rowIndex) ? MIN_ROW_HEIGHT : rowHeight;

  // Cálculo de posiciones verticales acumuladas de cada fila en modo no 88.
  const rowPositions = useMemo(() => {
    const positions = [];
    let accum = 0;
    for (let i = 0; i < rows; i++) {
      positions.push(accum);
      accum += getEffectiveRowHeight(i);
    }
    return positions;
  }, [rows, hiddenRows, rowHeight]);

  // Altura total del timeline (modo no 88)
  const totalHeight =
    rowPositions[rows - 1] + getEffectiveRowHeight(rows - 1);

  // En modo 88 teclas agrupamos las filas en octavas.
  // Usamos un criterio: cada octava termina cuando la nota es "B" sin sostenido.
  const is88KeyMode = isPianoMode && rows === 88;
  const octaveGroups = useMemo(() => {
    if (!is88KeyMode) return [];
    const groups = [];
    let groupStart = 0;
    for (let i = 0; i < rows; i++) {
      const note = pianoNotes[i];
      if (i > 0 && note.startsWith('B') && note[1] !== '#') {
        groups.push({
          start: groupStart,
          end: i - 1,
          span: i - groupStart,
          label: pianoNotes[groupStart]
        });
        groupStart = i;
      }
    }
    groups.push({
      start: groupStart,
      end: rows - 1,
      span: rows - groupStart,
      label: pianoNotes[groupStart]
    });
    return groups;
  }, [is88KeyMode, rows, pianoNotes]);

  // Para cada octava, si todas las filas están ocultas se usa MIN_ROW_HEIGHT o,
  // si está expandida, se usa la suma de rowHeight de cada nota del grupo.
  const octaveGroupEffectiveHeights = useMemo(() => {
    if (!is88KeyMode) return [];
    return octaveGroups.map((group) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const isGroupCollapsed = groupRows.every(r => hiddenRows.has(r));
      return isGroupCollapsed ? MIN_ROW_HEIGHT : group.span * rowHeight;
    });
  }, [is88KeyMode, octaveGroups, hiddenRows, rowHeight, MIN_ROW_HEIGHT]);

  // Calculamos las posiciones verticales de cada grupo (para alinear el timeline y el panel izquierdo).
  const octaveGroupPositions = useMemo(() => {
    if (!is88KeyMode) return [];
    let accum = 0;
    return octaveGroupEffectiveHeights.map((height) => {
      const pos = accum;
      accum += height;
      return pos;
    });
  }, [is88KeyMode, octaveGroupEffectiveHeights]);

  // Función para alternar la visibilidad de una fila o de un grupo (octava).
  // Si se le pasa un número, se alterna esa fila. Si se le pasa un grupo, se alterna la visibilidad de todas sus filas.
  const toggleRowVisibility = (rowIndexOrGroup) => {
    const newHiddenRows = new Set(hiddenRows);
    if (typeof rowIndexOrGroup === 'number') {
      newHiddenRows.has(rowIndexOrGroup)
        ? newHiddenRows.delete(rowIndexOrGroup)
        : newHiddenRows.add(rowIndexOrGroup);
    } else {
      const group = rowIndexOrGroup;
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const allHidden = groupRows.every(r => newHiddenRows.has(r));
      if (allHidden) {
        groupRows.forEach(r => newHiddenRows.delete(r));
      } else {
        groupRows.forEach(r => newHiddenRows.add(r));
      }
    }
    setHiddenRows(newHiddenRows);
  };

  // ————— Panel Izquierdo (Left Panel) —————

  // Modo no 88 (Secuenciador simple): Se renderiza cada fila individualmente.
  const renderNon88LeftPanel = () => {
    return Array.from({ length: rows }).map((_, rowIndex) =>
      hiddenRows.has(rowIndex) ? (
        <div
          key={`left-${rowIndex}`}
          style={{
            height: `${getEffectiveRowHeight(rowIndex)}px`,
            border: '1px solid #ddd',
            position: 'relative',
            transition: 'height 0.2s',
            backgroundColor: '#f0f0f0',
            boxSizing: 'border-box'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRowVisibility(rowIndex);
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '4px',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              border: '1px solid #666',
              background: '#fff',
              cursor: 'pointer',
              opacity: 0.8,
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
            title="Mostrar fila"
          >
            +
          </button>
          <div
            style={{
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: '#666'
            }}
          >
            {isPianoMode ? pianoNotes[rowIndex] : `Row ${rowIndex + 1}`}
          </div>
        </div>
      ) : (
        <div
          key={`left-${rowIndex}`}
          onMouseEnter={() => setHoveredRow(rowIndex)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() =>
            !isPianoMode &&
            openModal('rowControls', {
              getSampleColor: getSampleColor(rowSamples[rowIndex]),
              rowIndex,
              rowSamples: rowSamples[rowIndex]
            })
          }
          style={{
            height: `${getEffectiveRowHeight(rowIndex)}px`,
            border: '1px solid #ddd',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#000',
            cursor: !isPianoMode ? 'pointer' : 'default',
            userSelect: 'none',
            boxSizing: 'border-box'
          }}
        >
          {isPianoMode ? (
            pianoNotes[rowIndex]
          ) : (
            <>
              <span style={{ fontSize: '15px' }}>Row {rowIndex + 1}</span>
              <div
                style={{
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
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
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRowVisibility(rowIndex);
            }}
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              lineHeight: '10px',
              border: '1px solid #666',
              background: '#fff',
              borderRadius: '3px',
              cursor: 'pointer',
              opacity: hoveredRow === rowIndex ? 0.9 : 0.6,
              zIndex: 3
            }}
            title="Ocultar fila"
          >
            {hiddenRows.has(rowIndex) ? '+' : '−'}
          </button>
        </div>
      )
    );
  };

  // Modo 88 (Teclado de 88 teclas): Se renderiza un ÚNICO contenedor por octava,
  // sin bordes entre octavas para que aparente ser un solo bloque. Cuando colapsado, la altura es MIN_ROW_HEIGHT.
  const render88LeftPanel = () => {
    return octaveGroups.map((group, groupIndex) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const isGroupCollapsed = groupRows.every(r => hiddenRows.has(r));
      const containerHeight = octaveGroupEffectiveHeights[groupIndex];

      return (
        <div
          key={`octave-group-${groupIndex}`}
          style={{
            height: `${containerHeight}px`,
            border: 'none',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRowVisibility(group);
            }}
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              border: '1px solid #666',
              background: '#fff',
              borderRadius: '3px',
              cursor: 'pointer',
              zIndex: 3
            }}
            title={isGroupCollapsed ? "Expandir octava" : "Colapsar octava"}
          >
            {isGroupCollapsed ? '+' : '−'}
          </button>
          <div style={{ padding: '2px 4px', fontSize: '10px', fontWeight: 'bold', color: '#333' }}>
            {group.label}
          </div>
          
          {!isGroupCollapsed && (
            <div style={{ marginTop: '2px' }}>
              {groupRows.map((rowIndex) => (
                <div
                  key={`octave-note-${rowIndex}`}
                  style={{
                    height: `${rowHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '4px',
                    borderBottom: 'none',
                    fontSize: '10px'
                  }}
                >
                  {pianoNotes[rowIndex]}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Selección del render del panel izquierdo según el modo.
  const renderLeftPanel = () => (is88KeyMode ? render88LeftPanel() : renderNon88LeftPanel());

  // ————— Timeline (secuenciador) —————

  // Modo no 88: renderizamos las celdas en base a rowPositions.
  const renderTimelineCellsNon88 = () => {
    return Array.from({ length: rows }).map((_, rowIndex) => {
      const rowTop = rowPositions[rowIndex];
      if (hiddenRows.has(rowIndex)) {
        return (
          <div
            key={`hidden-marker-${rowIndex}`}
            style={{
              position: 'absolute',
              top: `${rowTop}px`,
              left: 0,
              right: 0,
              height: `${MIN_ROW_HEIGHT}px`,
              backgroundColor: 'rgba(0,0,0,0.05)',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              boxSizing: 'border-box'
            }}
            onClick={() => toggleRowVisibility(rowIndex)}
          >
            <div
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                color: '#666'
              }}
            >
              ▶ {isPianoMode ? pianoNotes[rowIndex] : `Row ${rowIndex + 1}`}
            </div>
          </div>
        );
      } else {
        return Array.from({ length: totalSteps }).map((_, stepIndex) => {
          const cellId = `${rowIndex}-${stepIndex}`;
          const isActive = selectedCells.has(cellId);
          const cellBgColor = isActive
            ? (isPianoMode && is88KeyMode
                ? 'rgba(76, 175, 80, 0.8)'
                : getSampleColor(rowSamples[rowIndex]))
            : (isPianoMode &&
                is88KeyMode &&
                isBlackKey(pianoNotes[rowIndex])
                  ? 'rgba(34, 34, 34, 0.7)'
                  : '#f9f9f9');
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
                top: `${rowTop}px`,
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
        });
      }
    });
  };

  // Modo 88: renderizamos las celdas iterando grupo por grupo, usando las posiciones calculadas a nivel de octava.
  const renderTimelineCells88 = () => {
    const cells = [];
    octaveGroups.forEach((group, groupIndex) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const isGroupCollapsed = groupRows.every(r => hiddenRows.has(r));
      const groupTop = octaveGroupPositions[groupIndex];
      if (isGroupCollapsed) {
        cells.push(
          <div
            key={`hidden-marker-octave-${groupIndex}`}
            style={{
              position: 'absolute',
              top: `${groupTop}px`,
              left: 0,
              right: 0,
              height: `${MIN_ROW_HEIGHT}px`,
              backgroundColor: 'rgba(0,0,0,0.05)',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              boxSizing: 'border-box'
            }}
            onClick={() => toggleRowVisibility(group)}
          >
            <div
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                color: '#666'
              }}
            >
              ▶ {group.label}
            </div>
          </div>
        );
      } else {
        groupRows.forEach((rowIndex, i) => {
          const rowTop = groupTop + i * rowHeight;
          for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
            const cellId = `${rowIndex}-${stepIndex}`;
            const isActive = selectedCells.has(cellId);
            const cellBgColor = isActive
              ? (isPianoMode && is88KeyMode
                  ? 'rgba(76, 175, 80, 0.8)'
                  : getSampleColor(rowSamples[rowIndex]))
              : (isPianoMode &&
                  is88KeyMode &&
                  isBlackKey(pianoNotes[rowIndex])
                    ? 'rgba(34, 34, 34, 0.7)'
                    : '#f9f9f9');
            const borderRadiusValue = isActive ? '8px' : '2px';
            let cellBorderLeft = '1px solid #eee';
            if (stepIndex % totalStepsPerMeasure === 0) {
              cellBorderLeft = '3px solid black';
            } else if (stepIndex % subdivisionsPerPulse === 0) {
              cellBorderLeft = '2px solid gray';
            }
            cells.push(
              <div
                key={`cell-${rowIndex}-${stepIndex}`}
                onClick={() => handleCellClick(rowIndex, stepIndex)}
                style={{
                  position: 'absolute',
                  left: `${stepIndex * cellWidth}px`,
                  top: `${rowTop}px`,
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
          }
        });
      }
    });
    return cells;
  };

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
      
      {showLeftPanel && (
        <div style={{ width: `${leftPanelWidth}px`, flexShrink: 0, boxSizing: 'border-box' }}>
          <div style={{ height: '45px', boxSizing: 'border-box' }}></div>
          {renderLeftPanel()}
        </div>
      )}

      
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
              const localStep = stepIndex % totalStepsPerMeasure;
              const measureLabel =
                localStep === 0 ? Math.floor(stepIndex / totalStepsPerMeasure) + 1 : "";
              const pulseLabel =
                localStep % subdivisionsPerPulse === 0
                  ? Math.floor(localStep / subdivisionsPerPulse) + 1
                  : "";
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

          
          <div
            style={{
              position: 'relative',
              height: is88KeyMode
                ? octaveGroupPositions.slice(-1)[0] + octaveGroupEffectiveHeights.slice(-1)[0]
                : totalHeight,
              boxSizing: 'border-box'
            }}
          >
            {is88KeyMode ? renderTimelineCells88() : renderTimelineCellsNon88()}
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
          backgroundColor: 'transparent',//showLeftPanel ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '25px',
          transition: 'all 0.3s ease'
        }}
      >
        {showLeftPanel ? '<' : '>'}
      </button>

      <TogglePlayPause 
        size={20}
        isPlaying={isPlaying}
        onToggle={togglePlayback}
      />
      <MenuIcon size={25} onClick={() => openModal('recordingControls')}/>
    </div>
  );
};


// Usar rutas absolutas con base en el entorno
const getSamplePath = (group, file) => {
  return process.env.NODE_ENV === 'production' 
    ? `/samples/${group}/${file}`
    : `/public/samples/${group}/${file}`;
};

const loadUserSamples = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}/samples`);
    const userSamples = await response.json();
    
    const loadingPromises = userSamples.map(async (sample) => {
      const response = await fetch(sample.url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await globalAudioContextRef.current.decodeAudioData(arrayBuffer);
      globalBuffersRef.current.set(sample.name, audioBuffer);
    });

    await Promise.all(loadingPromises);
  } catch (error) {
    console.error('Error loading user samples:', error);
  }
};

const loadAllSamples = async (userId) => {
  // Cargar samples globales
  await loadGlobalSamples(); 
  
  // Cargar samples del usuario
  if(userId) {
    await loadUserSamples(userId);
  }
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
    Array(DEFAULT_ROWS).fill().map((_, i) => getInitialSamples()[i] || 'kick')
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


  const getSampleColor = (sample) => {
    if (soundColors[sample]) return soundColors[sample];
    if (sample.startsWith("custom")) return "#9b59b6";
    return "#a5d6a7";
  };

 

  const RowControlsModal = ({
    rowIndex,
    currentSample,
    openModal,
    setRowSamples,
    modalData
  }) => {
    const [sampleType, setSampleType] = useState('global');
    const [selectedFolder, setSelectedFolder] = useState('');
    const [availableFolders, setAvailableFolders] = useState([]);
    const [availableSamples, setAvailableSamples] = useState([]);
    const [localSample, setLocalSample] = useState(currentSample);
    const [isLoading, setIsLoading] = useState(false);
  
    // Determinar la carpeta inicial basada en el sample actual
    useEffect(() => {
      const determineInitialFolder = () => {
        if (sampleType === 'global') {
          setAvailableFolders(sampleFolderNames.global);
          
          // Buscar la carpeta que contiene el sample actual
          const initialFolder = sampleFolderNames.global.find(folder => 
            sampleGroups.global[folder]?.includes(currentSample)
          ) || sampleFolderNames.global[0];
          
          setSelectedFolder(initialFolder || '');
        } else {
          setAvailableFolders(sampleFolderNames.public);
          
          // Buscar la carpeta que contiene el sample actual
          const initialFolder = sampleFolderNames.public.find(folder => 
            sampleGroups.public[folder]?.includes(currentSample)
          ) || sampleFolderNames.public[0];
          
          setSelectedFolder(initialFolder || '');
        }
      };
  
      determineInitialFolder();
    }, [sampleType, currentSample]);
  
    // Actualizar los samples disponibles cuando cambia la carpeta seleccionada
    useEffect(() => {
      const updateAvailableSamples = () => {
        if (!selectedFolder) return;
  
        if (sampleType === 'global') {
          setAvailableSamples(sampleGroups.global[selectedFolder] || []);
        } else {
          setAvailableSamples(sampleGroups.public[selectedFolder] || []);
        }
      };
  
      updateAvailableSamples();
    }, [selectedFolder, sampleType]);
  
    // Resetear el sample seleccionado si no está en la carpeta actual
    useEffect(() => {
      if (availableSamples.length > 0 && !availableSamples.includes(localSample)) {
        const newSample = availableSamples[0] || '';
        setLocalSample(newSample);
        updateRowSample(newSample);
      }
    }, [availableSamples]);
  
    const updateRowSample = (newSample) => {
      setRowSamples(prev => {
        const newSamples = [...prev];
        newSamples[rowIndex] = newSample;
        return newSamples;
      });
    };
  
    const previewSample = async () => {
      if (!globalAudioContextRef.current || !localSample) return;
  
      setIsLoading(true);
      try {
        const buffer = globalBuffersRef.current.get(localSample);
        if (buffer) {
          const source = globalAudioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(globalAudioContextRef.current.destination);
          source.start(0);
          
          source.onended = () => setIsLoading(false);
        }
      } catch (error) {
        console.error("Error previewing sample:", error);
        setIsLoading(false);
      }
    };
  
    const formatName = (name) => {
      return name.replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
    };
  
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '500px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: '20px',
          color: '#333',
          borderBottom: '1px solid #eee',
          paddingBottom: '10px'
        }}>
          Row {rowIndex + 1} Controls
        </h3>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#f9f9f9',
          borderRadius: '6px'
        }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: modalData.getSampleColor,
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              border: '1px solid #ddd'
            }}
            onClick={() =>
              openModal('colorPicker', {
                color: modalData.getSampleColor,
                selectedKey: localSample,
                rowIndex,
              })
            }
          />
          <span style={{ 
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#444'
          }}>
            {formatName(localSample)}
          </span>
        </div>
  
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            color: '#555'
          }}>
            Sample Type:
          </label>
          <select
            value={sampleType}
            onChange={(e) => setSampleType(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="global">Global Samples</option>
            <option value="public">Public Samples</option>
          </select>
        </div>
  
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            color: '#555'
          }}>
            Sample Category:
          </label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            disabled={availableFolders.length === 0}
          >
            {availableFolders.map((folder) => (
              <option key={folder} value={folder}>
                {formatName(folder)}
              </option>
            ))}
          </select>
        </div>
  
        <div style={{ marginBottom: '25px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontWeight: '500',
            color: '#555'
          }}>
            Select Sample:
          </label>
          <select
            value={localSample}
            onChange={(e) => {
              const newSample = e.target.value;
              setLocalSample(newSample);
              updateRowSample(newSample);
            }}
            style={{ 
              width: '100%', 
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            disabled={availableSamples.length === 0}
          >
            {availableSamples.map((sample) => (
              <option key={sample} value={sample}>
                {formatName(sample)}
              </option>
            ))}
          </select>
        </div>
  
        <button
          onClick={previewSample}
          disabled={isLoading || !localSample}
          style={{
            padding: '10px 16px',
            backgroundColor: isLoading ? '#aaa' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? (
            <>
              <span>Loading...</span>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTopColor: 'white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Preview Sample</span>
            </>
          )}
        </button>
  
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  };
  

const RenderModalContent = () => {
  const { type, data } = modalState; // modalState debe estar definido en tu contexto o importado
  
  
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

      case 'rowControls': {
        return (
          <RowControlsModal
            rowIndex={data.rowIndex}
            currentSample={rowSamples[data.rowIndex]}  // Obtener el sample actual del array
            //currentSample={data.rowSamples}
            getSampleColor={data.getSampleColor}
            openModal={openModal}
            setRowSamples={setRowSamples}
            modalData={data}
          />
        );
      }

    case 'samplePicker':
      return (
        <div style={{ padding: '20px' }}>
          <h3>Seleccionar Sample</h3>
          
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
          togglePlayback={() =>
            playback.togglePlayback(isPlaying, setIsPlaying, autoScroll, samplesLoaded)
          }
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
  const { samplesLoaded, loadSamples } = useSamples();
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
  
  
  
  // En el componente principal
useEffect(() => {
  const verifySampleFiles = async () => {
    try {
      const response = await fetch('/samples-manifest.json');
      const manifest = await response.json();
      
      // Verificar que todos los archivos existen
      for (const [group, files] of Object.entries(manifest)) {
        for (const file of files) {
          const res = await fetch(`/samples/${group}/${file}`);
          if (!res.ok) console.warn(`Archivo faltante: /samples/${group}/${file}`);
        }
      }
    } catch (error) {
      console.error('Error verificando samples:', error);
    }
  };

  verifySampleFiles();
}, []);





  const isBlackKey = (note) => note.includes('#');

  const handleRowsChange = (newRows) => {
    const maxRows = isPianoMode ? PIANO_KEYS : 88;
    const numRows = Math.max(1, Math.min(maxRows, newRows));
    setRows(numRows);
    
    setRowSamples(prev => {
      const globalSamples = sampleGroups.global?.percussion || [];
      return Array(numRows).fill().map((_, i) => 
        i < prev.length ? prev[i] : globalSamples[i % globalSamples.length] || 'kick'
      );
    });
  };

  const togglePianoMode = () => {
    const newPianoMode = !isPianoMode;
    setIsPianoMode(newPianoMode);
    handleRowsChange(newPianoMode ? PIANO_KEYS : DEFAULT_ROWS);
    
    playback.stopPlayback();
    setIsPlaying(false);
  };

  

  const changeObjectColor = (key, newColor) => {
    setSoundColors(prev => ({ ...prev, [key]: newColor }));
  };

  const handleSelectorColor = (color, key) => {
    setColor(color);
    setSelectedKey(key);
    setOpenColorSelector(true);
  };

  const handleCellClick = async (rowIndex, stepIndex) => {
    const cellId = `${rowIndex}-${stepIndex}`;
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      newSet.has(cellId) ? newSet.delete(cellId) : newSet.add(cellId);
      return newSet;
    });
    
    try {
      await initAudioContext();
      
      if (globalAudioContextRef.current.state === 'suspended') {
        await globalAudioContextRef.current.resume();
      }
      
      const sound = isPianoMode ? PIANO_NOTES[rowIndex] : rowSamples[rowIndex];
      playback.playSound(sound, globalAudioContextRef.current.currentTime + 0.05);
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
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
        {RenderModalContent()}
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

export default SubdivisionGrid;*/
















import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';
import RangeInput from '@/components/complex/rangeInput';
import TogglePlayPause from '@/components/complex/TogglePlayPause';
import CustomNumberInput from '@/components/complex/customNumberInput';
import CheckBox from '@/components/complex/checkBox';
import UploadAudiosFromDAW from './uploadAudiosFromUsers';
'../../../estilos/general/general.css'
import PropTypes from 'prop-types';

const BPM = 120;
const DEFAULT_ROWS = 4;
const PIANO_KEYS = 88;

const globalBuffersRef = { current: new Map() };
const globalSelectedPianoSampleRef = { current: 'piano', duration: 0, durationToUse: 1 };
const globalAudioContextRef = { current: null };






const PREDEFINED_PIANO_SAMPLES = [
  { id: 'piano', name: 'Piano (A4)', path: '/samples/public/keyboards/C3-1s.wav', baseFreq: 440 },
  { id: 'voz', name: 'Voz (A4)', path: '/samples/public/voice/vos.wav', baseFreq: 440 },
  { id: 'uno', name: 'Uno (A4)', path: '/samples/public/percussion/uno.mp3', baseFreq: 440 },
  { id: 'C', name: 'C (A4)', path: '/samples/public/keyboards/C3.wav', baseFreq: 440 },
  { id: 'hu', name: 'hu', path: '/samples/public/voice/hu.wav', baseFreq: 440 },
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

const useSamples = ({ isPianoMode }) => {
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  const loadSamples = useCallback(async () => {
    const samples = {
      kick: '/samples/public/percussion/uno.mp3', 
      snare: '/samples/public/percussion/dos.mp3', 
      hihat: '/samples/public/percussion/tres.mp3', 
      clap: '/samples/public/percussion/cuatro.mp3' // Corregido: añadido / al inicio
    };
    
    try {
      if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
        globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      console.log("Loading samples:", samples);
      
      const responses = await Promise.all(
        Object.values(samples).map(url => 
          fetch(url).then(res => {
            if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
            return res;
          })
        )
      );
      
      console.log("AudioContext state:", globalAudioContextRef.current);
      
      const arrayBuffers = await Promise.all(
        responses.map(res => res.arrayBuffer())
      );
      
      const audioBuffers = await Promise.all(
        arrayBuffers.map((buffer, index) => {
          const sampleName = Object.keys(samples)[index];
          try {
            return globalAudioContextRef.current.decodeAudioData(buffer);
          } catch (error) {
            console.error(`Error decoding ${sampleName}:`, error);
            return null;
          }
        })
      );
      
      audioBuffers.forEach((buffer, index) => {
        if (buffer) {
          const sampleName = Object.keys(samples)[index];
          globalBuffersRef.current.set(sampleName, buffer);
          console.log(`Sample loaded: ${sampleName}`);
        }
      });
      
      setSamplesLoaded(true);
      console.log("All samples loaded successfully");
    } catch (error) {
      console.error('Error loading samples:', error);
      setSamplesLoaded(false);
    }
  }, [isPianoMode]);

  return { samplesLoaded, loadSamples };
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
  measureWidth,
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
  openModal,
  showLeftPanel = true,
  currentStep = 0
}) => {
  // Estados para las filas ocultas y para gestionar efectos de hover en el panel izquierdo
  const [hiddenRows, setHiddenRows] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const timelineContainerRef = useRef(null);

  // Calculamos el ancho del panel izquierdo y el área visible del timeline.
  const leftPanelWidth = showLeftPanel ? 60 : 0;
  const timelineVisibleWidth = measureWidth - leftPanelWidth;
  
  // ORIGINAL: Se agregaba timelineVisibleWidth para permitir scroll.
  // CORRECCIÓN: Se usa el ancho del contenedor padre (measureWidth) en lugar de timelineVisibleWidth.
  const timelineTotalWidth = totalSteps * cellWidth + measureWidth;

  // Auto-scroll para centrar el currentStep en el timeline.
  useLayoutEffect(() => {
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollLeft = currentStep * cellWidth;
    }
  }, [currentStep, cellWidth]);

  // Definimos el alto mínimo para filas o contenedores colapsados (ahora 16px, el doble de 8px)
  const MIN_ROW_HEIGHT = 16;

  // En el modo no 88, si la fila está oculta se le asigna MIN_ROW_HEIGHT, sino, rowHeight.
  const getEffectiveRowHeight = (rowIndex) =>
    hiddenRows.has(rowIndex) ? MIN_ROW_HEIGHT : rowHeight;

  // Cálculo de posiciones verticales acumuladas de cada fila en modo no 88.
  const rowPositions = useMemo(() => {
    const positions = [];
    let accum = 0;
    for (let i = 0; i < rows; i++) {
      positions.push(accum);
      accum += getEffectiveRowHeight(i);
    }
    return positions;
  }, [rows, hiddenRows, rowHeight]);

  // Altura total del timeline (modo no 88)
  const totalHeight =
    rowPositions[rows - 1] + getEffectiveRowHeight(rows - 1);

  // En modo 88 teclas agrupamos las filas en octavas.
  // Usamos un criterio: cada octava termina cuando la nota es "B" sin sostenido.
  const is88KeyMode = isPianoMode && rows === 88;
  const octaveGroups = useMemo(() => {
    if (!is88KeyMode) return [];
    const groups = [];
    let groupStart = 0;
    for (let i = 0; i < rows; i++) {
      const note = pianoNotes[i];
      if (i > 0 && note.startsWith('B') && note[1] !== '#') {
        groups.push({
          start: groupStart,
          end: i - 1,
          span: i - groupStart,
          label: pianoNotes[groupStart]
        });
        groupStart = i;
      }
    }
    groups.push({
      start: groupStart,
      end: rows - 1,
      span: rows - groupStart,
      label: pianoNotes[groupStart]
    });
    return groups;
  }, [is88KeyMode, rows, pianoNotes]);

  // Para cada octava, si todas las filas están ocultas se usa MIN_ROW_HEIGHT o,
  // si está expandida, se usa la suma de rowHeight de cada nota del grupo.
  const octaveGroupEffectiveHeights = useMemo(() => {
    if (!is88KeyMode) return [];
    return octaveGroups.map((group) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const isGroupCollapsed = groupRows.every(r => hiddenRows.has(r));
      return isGroupCollapsed ? MIN_ROW_HEIGHT : group.span * rowHeight;
    });
  }, [is88KeyMode, octaveGroups, hiddenRows, rowHeight, MIN_ROW_HEIGHT]);

  // Calculamos las posiciones verticales de cada grupo (para alinear el timeline y el panel izquierdo).
  const octaveGroupPositions = useMemo(() => {
    if (!is88KeyMode) return [];
    let accum = 0;
    return octaveGroupEffectiveHeights.map((height) => {
      const pos = accum;
      accum += height;
      return pos;
    });
  }, [is88KeyMode, octaveGroupEffectiveHeights]);

  // Función para alternar la visibilidad de una fila o de un grupo (octava).
  // Si se le pasa un número, se alterna esa fila. Si se le pasa un grupo, se alterna la visibilidad de todas sus filas.
  const toggleRowVisibility = (rowIndexOrGroup) => {
    const newHiddenRows = new Set(hiddenRows);
    if (typeof rowIndexOrGroup === 'number') {
      newHiddenRows.has(rowIndexOrGroup)
        ? newHiddenRows.delete(rowIndexOrGroup)
        : newHiddenRows.add(rowIndexOrGroup);
    } else {
      const group = rowIndexOrGroup;
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const allHidden = groupRows.every(r => newHiddenRows.has(r));
      if (allHidden) {
        groupRows.forEach(r => newHiddenRows.delete(r));
      } else {
        groupRows.forEach(r => newHiddenRows.add(r));
      }
    }
    setHiddenRows(newHiddenRows);
  };

  // ————— Panel Izquierdo (Left Panel) —————

  // Modo no 88 (Secuenciador simple): Se renderiza cada fila individualmente.
  const renderNon88LeftPanel = () => {
    return Array.from({ length: rows }).map((_, rowIndex) =>
      hiddenRows.has(rowIndex) ? (
        <div
          key={`left-${rowIndex}`}
          style={{
            height: `${getEffectiveRowHeight(rowIndex)}px`,
            border: '1px solid #ddd',
            position: 'relative',
            transition: 'height 0.2s',
            backgroundColor: '#f0f0f0',
            boxSizing: 'border-box'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRowVisibility(rowIndex);
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '4px',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              border: '1px solid #666',
              background: '#fff',
              cursor: 'pointer',
              opacity: 0.8,
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
            title="Mostrar fila"
          >
            +
          </button>
          <div
            style={{
              position: 'absolute',
              left: '24px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '10px',
              color: '#666'
            }}
          >
            {isPianoMode ? pianoNotes[rowIndex] : `Row ${rowIndex + 1}`}
          </div>
        </div>
      ) : (
        <div
          key={`left-${rowIndex}`}
          onMouseEnter={() => setHoveredRow(rowIndex)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() =>
            !isPianoMode &&
            openModal('rowControls', {
              getSampleColor: getSampleColor(rowSamples[rowIndex]),
              rowIndex,
              rowSamples: rowSamples[rowIndex]
            })
          }
          style={{
            height: `${getEffectiveRowHeight(rowIndex)}px`,
            border: '1px solid #ddd',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#000',
            cursor: !isPianoMode ? 'pointer' : 'default',
            userSelect: 'none',
            boxSizing: 'border-box'
          }}
        >
          {isPianoMode ? (
            pianoNotes[rowIndex]
          ) : (
            <>
              <span style={{ fontSize: '15px' }}>Row {rowIndex + 1}</span>
              <div
                style={{
                  marginTop: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
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
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRowVisibility(rowIndex);
            }}
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              lineHeight: '10px',
              border: '1px solid #666',
              background: '#fff',
              borderRadius: '3px',
              cursor: 'pointer',
              opacity: hoveredRow === rowIndex ? 0.9 : 0.6,
              zIndex: 3
            }}
            title="Ocultar fila"
          >
            {hiddenRows.has(rowIndex) ? '+' : '−'}
          </button>
        </div>
      )
    );
  };

  // Modo 88 (Teclado de 88 teclas): Se renderiza un ÚNICO contenedor por octava,
  // sin bordes entre octavas para que aparente ser un solo bloque. Cuando colapsado, la altura es MIN_ROW_HEIGHT.
  const render88LeftPanel = () => {
    return octaveGroups.map((group, groupIndex) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const isGroupCollapsed = groupRows.every(r => hiddenRows.has(r));
      const containerHeight = octaveGroupEffectiveHeights[groupIndex];

      return (
        <div
          key={`octave-group-${groupIndex}`}
          style={{
            height: `${containerHeight}px`,
            border: 'none',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRowVisibility(group);
            }}
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              border: '1px solid #666',
              background: '#fff',
              borderRadius: '3px',
              cursor: 'pointer',
              zIndex: 3
            }}
            title={isGroupCollapsed ? "Expandir octava" : "Colapsar octava"}
          >
            {isGroupCollapsed ? '+' : '−'}
          </button>
          <div style={{ padding: '2px 4px', fontSize: '10px', fontWeight: 'bold', color: '#333' }}>
            {group.label}
          </div>
          {/* Si la octava está expandida, se listan internamente las notas */}
          {!isGroupCollapsed && (
            <div style={{ marginTop: '2px' }}>
              {groupRows.map((rowIndex) => (
                <div
                  key={`octave-note-${rowIndex}`}
                  style={{
                    height: `${rowHeight}px`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '4px',
                    borderBottom: 'none',
                    fontSize: '10px'
                  }}
                >
                  {pianoNotes[rowIndex]}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  // Selección del render del panel izquierdo según el modo.
  const renderLeftPanel = () => (is88KeyMode ? render88LeftPanel() : renderNon88LeftPanel());

  // ————— Timeline (secuenciador) —————

  // Modo no 88: renderizamos las celdas en base a rowPositions.
  const renderTimelineCellsNon88 = () => {
    return Array.from({ length: rows }).map((_, rowIndex) => {
      const rowTop = rowPositions[rowIndex];
      if (hiddenRows.has(rowIndex)) {
        return (
          <div
            key={`hidden-marker-${rowIndex}`}
            style={{
              position: 'absolute',
              top: `${rowTop}px`,
              left: 0,
              right: 0,
              height: `${MIN_ROW_HEIGHT}px`,
              backgroundColor: 'rgba(0,0,0,0.05)',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              boxSizing: 'border-box'
            }}
            onClick={() => toggleRowVisibility(rowIndex)}
          >
            <div
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                color: '#666'
              }}
            >
              ▶ {isPianoMode ? pianoNotes[rowIndex] : `Row ${rowIndex + 1}`}
            </div>
          </div>
        );
      } else {
        return Array.from({ length: totalSteps }).map((_, stepIndex) => {
          const cellId = `${rowIndex}-${stepIndex}`;
          const isActive = selectedCells.has(cellId);
          const cellBgColor = isActive
            ? (isPianoMode && is88KeyMode
                ? 'rgba(76, 175, 80, 0.8)'
                : getSampleColor(rowSamples[rowIndex]))
            : (isPianoMode &&
                is88KeyMode &&
                isBlackKey(pianoNotes[rowIndex])
                  ? 'rgba(34, 34, 34, 0.7)'
                  : '#f9f9f9');
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
                top: `${rowTop}px`,
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
        });
      }
    });
  };

  // Modo 88: renderizamos las celdas iterando grupo por grupo, usando las posiciones calculadas a nivel de octava.
  const renderTimelineCells88 = () => {
    const cells = [];
    octaveGroups.forEach((group, groupIndex) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const isGroupCollapsed = groupRows.every(r => hiddenRows.has(r));
      const groupTop = octaveGroupPositions[groupIndex];
      if (isGroupCollapsed) {
        cells.push(
          <div
            key={`hidden-marker-octave-${groupIndex}`}
            style={{
              position: 'absolute',
              top: `${groupTop}px`,
              left: 0,
              right: 0,
              height: `${MIN_ROW_HEIGHT}px`,
              backgroundColor: 'rgba(0,0,0,0.05)',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
              boxSizing: 'border-box'
            }}
            onClick={() => toggleRowVisibility(group)}
          >
            <div
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                color: '#666'
              }}
            >
              ▶ {group.label}
            </div>
          </div>
        );
      } else {
        groupRows.forEach((rowIndex, i) => {
          const rowTop = groupTop + i * rowHeight;
          for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
            const cellId = `${rowIndex}-${stepIndex}`;
            const isActive = selectedCells.has(cellId);
            const cellBgColor = isActive
              ? (isPianoMode && is88KeyMode
                  ? 'rgba(76, 175, 80, 0.8)'
                  : getSampleColor(rowSamples[rowIndex]))
              : (isPianoMode &&
                  is88KeyMode &&
                  isBlackKey(pianoNotes[rowIndex])
                    ? 'rgba(34, 34, 34, 0.7)'
                    : '#f9f9f9');
            const borderRadiusValue = isActive ? '8px' : '2px';
            let cellBorderLeft = '1px solid #eee';
            if (stepIndex % totalStepsPerMeasure === 0) {
              cellBorderLeft = '3px solid black';
            } else if (stepIndex % subdivisionsPerPulse === 0) {
              cellBorderLeft = '2px solid gray';
            }
            cells.push(
              <div
                key={`cell-${rowIndex}-${stepIndex}`}
                onClick={() => handleCellClick(rowIndex, stepIndex)}
                style={{
                  position: 'absolute',
                  left: `${stepIndex * cellWidth}px`,
                  top: `${rowTop}px`,
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
          }
        });
      }
    });
    return cells;
  };

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
          <div style={{ height: '45px', boxSizing: 'border-box' }}></div>
          {renderLeftPanel()}
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
          {/* HEADER */}
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
              const localStep = stepIndex % totalStepsPerMeasure;
              const measureLabel =
                localStep === 0 ? Math.floor(stepIndex / totalStepsPerMeasure) + 1 : "";
              const pulseLabel =
                localStep % subdivisionsPerPulse === 0
                  ? Math.floor(localStep / subdivisionsPerPulse) + 1
                  : "";
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

          {/* CONTAINER DE CELDAS */}
          <div
            style={{
              position: 'relative',
              height: is88KeyMode
                ? octaveGroupPositions.slice(-1)[0] + octaveGroupEffectiveHeights.slice(-1)[0]
                : totalHeight,
              boxSizing: 'border-box'
            }}
          >
            {is88KeyMode ? renderTimelineCells88() : renderTimelineCellsNon88()}
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

      
      <UploadAudiosFromDAW/>

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