import React, { useState, useEffect, useRef, useCallback } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';

const SubdivisionGrid = () => {
  // Parámetros fijos
  const BPM = 120;
  const rows = 4;

  // Estados para la firma de tiempo y subdivisiones
  const [numerator, setNumerator] = useState(4);
  const [denominator, setDenominator] = useState(4);
  const [subdivisionsPerPulse, setSubdivisionsPerPulse] = useState(4);
  const [measures, setMeasures] = useState(1);

  // Estados para el tamaño de la grilla
  const [measureWidth, setMeasureWidth] = useState(800);
  const [componentHeight, setComponentHeight] = useState(300);

  // Estado para la asignación de sample por fila
  const [rowSamples, setRowSamples] = useState(() => {
    const defaults = ['kick', 'snare', 'hihat', 'clap'];
    return Array(rows).fill().map((_, i) => defaults[i] || 'kick');
  });

  // Nuevo estado para los colores de los samples (reemplaza el objeto soundColors original)
  const [soundColors, setSoundColors] = useState({
    kick: '#FF6B6B',
    snare: '#4ECDC4',
    hihat: '#45B7D1',
    clap: '#FFBE0B'
  });

  // Estados y refs para la grabación
  const [recordingRow, setRecordingRow] = useState(null);
  const [isGlobalRecording, setIsGlobalRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Estados de reproducción y selección de celdas
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [audioContextState, setAudioContextState] = useState('suspended');
  const [autoScroll, setAutoScroll] = useState(true);

  // Estados para muestras personalizadas
  const [customSamples, setCustomSamples] = useState([]);
  const [newSampleName, setNewSampleName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  // Estados para el selector de color
  const [color, setColor] = useState('');
  const [openColorSelector, setOpenColorSelector] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');

  // Refs para audio, buffers y animación
  const audioContextRef = useRef(null);
  const buffersRef = useRef(new Map());
  const scheduledSourcesRef = useRef(new Set());
  const animationRef = useRef(null);
  const currentStepRef = useRef(0);
  const indicatorRef = useRef(null);
  const gridContainerRef = useRef(null);
  const nextStepTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  // Refs para parámetros dinámicos
  const selectedCellsRef = useRef(selectedCells);
  const numeratorRef = useRef(numerator);
  const subdivisionsPerPulseRef = useRef(subdivisionsPerPulse);
  const measuresRef = useRef(measures);
  const measureWidthRef = useRef(measureWidth);
  const rowSamplesRef = useRef(rowSamples);

  useEffect(() => { selectedCellsRef.current = selectedCells; }, [selectedCells]);
  useEffect(() => { numeratorRef.current = numerator; }, [numerator]);
  useEffect(() => { subdivisionsPerPulseRef.current = subdivisionsPerPulse; }, [subdivisionsPerPulse]);
  useEffect(() => { measuresRef.current = measures; }, [measures]);
  useEffect(() => { measureWidthRef.current = measureWidth; }, [measureWidth]);
  useEffect(() => { rowSamplesRef.current = rowSamples; }, [rowSamples]);

  // Cálculos derivados para la grilla
  const totalStepsPerMeasure = numerator * subdivisionsPerPulse;
  const totalSteps = measures * totalStepsPerMeasure;
  const cellWidth = measureWidth / totalStepsPerMeasure;
  const totalGridWidth = measureWidth * measures;
  const rowHeight = componentHeight / rows;
  const computedPixelsPerSecond = (measureWidth * BPM) / (numerator * 60);
  const stepDuration = (60 / BPM) / subdivisionsPerPulse;

  // Función para obtener el color del sample (actualizada para usar el estado soundColors)
  const getSampleColor = (sample) => {
    if (soundColors[sample]) return soundColors[sample];
    if (sample.startsWith("custom")) return "#9b59b6";
    return "#a5d6a7";
  };

  // Función para actualizar colores
  const changeObjectColor = (key, newColor) => {
    setSoundColors(prev => ({
      ...prev,
      [key]: newColor
    }));
  };

  const handleSelectorColor = useCallback((color, key) => {
    setColor(color);
    setSelectedKey(key);
    setOpenColorSelector(true);
  }, []);

  // Carga de samples integrados desde URLs
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
        setAudioContextState(audioContextRef.current.state);
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
        if (buffer) {
          buffersRef.current.set(Object.keys(samples)[index], buffer);
        }
      });
      setSamplesLoaded(true);
      console.log('Todos los samples cargados correctamente');
    } catch (error) {
      console.error('Error cargando samples:', error);
      setSamplesLoaded(false);
    }
  }, []);

  // Inicialización del AudioContext
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContextState(audioContextRef.current.state);
      audioContextRef.current.onstatechange = () => {
        setAudioContextState(audioContextRef.current.state);
        console.log('AudioContext state:', audioContextRef.current.state);
      };
    }
  }, []);

  // Maneja el clic en una celda
  const handleCellClick = (rowIndex, stepIndex) => {
    const cellId = `${rowIndex}-${stepIndex}`;
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      newSet.has(cellId) ? newSet.delete(cellId) : newSet.add(cellId);
      return newSet;
    });
    initAudioContext();
    playSound('snare', audioContextRef.current.currentTime + 0.05);
  };

  // Genera el patrón actual
  const getCurrentPatternSteps = () => {
    const currentTotalSteps = measuresRef.current * numeratorRef.current * subdivisionsPerPulseRef.current;
    const steps = Array.from({ length: currentTotalSteps }, () => ({ activeSounds: [] }));
    selectedCellsRef.current.forEach(cellId => {
      const [rowIndex, stepIndex] = cellId.split('-').map(Number);
      if (stepIndex < currentTotalSteps && rowIndex < rows) {
        steps[stepIndex].activeSounds.push(rowSamplesRef.current[rowIndex]);
      }
    });
    return steps;
  };

  // Función para reproducir un sonido
  const playSound = useCallback((sound, time) => {
    if (!buffersRef.current.has(sound)) {
      console.error('Sample no cargado:', sound);
      return;
    }
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      initAudioContext();
    }
    const buffer = buffersRef.current.get(sound);
    if (!buffer || !audioContextRef.current) return;
    try {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      const now = audioContextRef.current.currentTime;
      const adjustedTime = Math.max(now, time);
      source.start(adjustedTime);
      scheduledSourcesRef.current.add(source);
      source.onended = () => {
        scheduledSourcesRef.current.delete(source);
      };
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }, [initAudioContext]);

  // Funciones para controlar la reproducción general
  const stopPlayback = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    scheduledSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        console.warn('Error al detener fuente:', e);
      }
    });
    scheduledSourcesRef.current.clear();
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = 'translateX(0)';
    }
    currentStepRef.current = 0;
    nextStepTimeRef.current = 0;
    isPlayingRef.current = false;
    setIsPlaying(false);
    lastFrameTimeRef.current = 0;
  }, []);

  const startPlayback = useCallback(async () => {
    if (!samplesLoaded) {
      console.warn('Samples no cargados');
      return;
    }
    try {
      initAudioContext();
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      stopPlayback();
      
      if (gridContainerRef.current && autoScroll) {
        gridContainerRef.current.scrollTo({
          left: 0,
          behavior: 'auto'
        });
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
        const posX = (elapsedTime * computedPixelsPerSecond) % currentGridWidth;
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = `translate3d(${posX}px, 0, 0)`;
          
          if (autoScroll && gridContainerRef.current) {
            const container = gridContainerRef.current;
            const containerWidth = container.clientWidth;
            const scrollLeft = posX - containerWidth / 2;
            
            container.scrollTo({
              left: scrollLeft,
              behavior: 'smooth'
            });
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
    }
  }, [samplesLoaded, initAudioContext, stopPlayback, playSound, computedPixelsPerSecond, autoScroll]);

  const togglePlayback = useCallback(async () => {
    if (isPlayingRef.current) {
      stopPlayback();
    } else {
      await startPlayback();
    }
  }, [startPlayback, stopPlayback]);

  // Funciones para grabar un sample externo
  const startGlobalRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setIsGlobalRecording(true);
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
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

  const saveCustomSample = () => {
    if (newSampleName.trim()) {
      const tempName = `custom-${Date.now()}`;
      const buffer = buffersRef.current.get(tempName);
      if (buffer) {
        buffersRef.current.delete(tempName);
        buffersRef.current.set(newSampleName.trim(), buffer);
      }
      setCustomSamples(prev => [...prev, {
        name: newSampleName.trim(),
        buffer: buffer
      }]);
      setShowNameInput(false);
      setNewSampleName('');
    }
  };

  const startRecording = (rowIndex) => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setRecordingRow(rowIndex);
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          audioContextRef.current.decodeAudioData(arrayBuffer, (audioBuffer) => {
            const customKey = `custom${rowIndex}`;
            buffersRef.current.set(customKey, audioBuffer);
            setRowSamples(prev => {
              const newArr = [...prev];
              newArr[rowIndex] = customKey;
              return newArr;
            });
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

  // Se carga los samples al montar el componente
  useEffect(() => {
    loadSamples();
    return () => {
      stopPlayback();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [loadSamples, stopPlayback]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      {openColorSelector && (
        <Modal 
          isOpen={openColorSelector}
          onClose={() => setOpenColorSelector(false)}
        >
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

      {/* Contenedor para grabación */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <h3>Grabar nuevo sample:</h3>
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
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
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

      {/* Controles de firma y subdivisiones */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Numerador (pulsos por compás):{' '}
          <input
            type="number"
            min="1"
            max="10"
            value={numerator}
            onChange={e => setNumerator(Number(e.target.value))}
          />
        </label>
        <label style={{ marginLeft: '20px' }}>
          Denominador:{' '}
          <select value={denominator} onChange={e => setDenominator(Number(e.target.value))}>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={32}>32</option>
          </select>
        </label>
        <label style={{ marginLeft: '20px' }}>
          Subdivisiones por pulso:{' '}
          <input
            type="number"
            min="1"
            max="16"
            value={subdivisionsPerPulse}
            onChange={e => setSubdivisionsPerPulse(Number(e.target.value))}
          />
        </label>
        <label style={{ marginLeft: '20px' }}>
          Compases:{' '}
          <input
            type="number"
            min="1"
            max="10"
            value={measures}
            onChange={e => setMeasures(Number(e.target.value))}
          />
        </label>
      </div>
      
      {/* Control para scroll dinámico */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          Scroll dinámico durante la reproducción
        </label>
      </div>
      
      {/* Controles de tamaño de la grilla */}
      <div style={{ marginBottom: '20px' }}>
        <label>
          Ancho del compás:{' '}
          <input
            type="range"
            min="300"
            max="1200"
            value={measureWidth}
            onChange={e => setMeasureWidth(Number(e.target.value))}
          />
          {measureWidth}px
        </label>
        <label style={{ marginLeft: '20px' }}>
          Alto de la grilla:{' '}
          <input
            type="range"
            min="150"
            max="600"
            value={componentHeight}
            onChange={e => setComponentHeight(Number(e.target.value))}
          />
          {componentHeight}px
        </label>
      </div>
      
      {/* Controles de reproducción */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
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
            minWidth: '120px'
          }}
        >
          {!samplesLoaded ? 'Cargando...' : isPlaying ? '⏹ Detener' : '▶ Reproducir'}
        </button>
        <div style={{ fontSize: '14px' }}>BPM: {BPM}</div>
        <div style={{ fontSize: '14px' }}>Estado Audio: {audioContextState}</div>
      </div>
      
      {/* Visualización de la grilla */}
      <div
        style={{
          position: 'relative',
          width: `${measureWidth}px`,
          height: `${componentHeight}px`,
          overflowX: 'auto',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          padding: '2px',
          scrollBehavior: 'smooth'
        }}
        ref={gridContainerRef}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${totalSteps}, ${cellWidth}px)`,
            gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
            gap: '2px',
            position: 'relative',
            width: `${totalGridWidth}px`,
            minWidth: '100%'
          }}
        >
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              {Array.from({ length: totalSteps }).map((_, stepIndex) => {
                const cellId = `${rowIndex}-${stepIndex}`;
                const isActive = selectedCells.has(cellId);
                const sampleForRow = rowSamples[rowIndex];
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
                      backgroundColor: isActive ? getSampleColor(sampleForRow) : '#fff',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      borderTop: '1px solid #eee',
                      borderBottom: '1px solid #eee',
                      borderRight: '1px solid #eee',
                      borderLeft: cellBorderLeft
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
        <div
          ref={indicatorRef}
          style={{
            position: 'absolute',
            left: 0,
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

      {/* Leyenda */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginTop: '20px', 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        width: '100vw' 
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubdivisionGrid;















