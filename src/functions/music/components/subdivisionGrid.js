import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect, useReducer } from 'react';
import SingleColorPickerModalContent from '@/components/complex/singleColorPickerModalContent';
import Modal from '@/components/complex/modal';
import RangeInput from '@/components/complex/rangeInput';
import TogglePlayPause from '@/components/complex/TogglePlayPause';
import CustomNumberInput from '@/components/complex/customNumberInput';
import CheckBox from '@/components/complex/checkBox';
import ShowHide from '@/components/complex/showHide';
import ControlsIcon from '@/components/complex/controlsIcon';
import UploadAudiosFromDAW from './uploadAudiosFromUsers';
'../../../estilos/general/general.css'
'../../../estilos/music/subdivisionGrid.module.css'





const DEFAULT_SAMPLES = ['kick', 'snare', 'hihat', 'clap'];
const DEFAULT_COLORS = {
  kick: '#FF6B6B',
  snare: '#4ECDC4',
  hihat: '#45B7D1',
  clap: '#FFBE0B'
};



/* ----------------------------- Constantes Compartidas ----------------------------- */
//const BPM = 120;
const PIANO_KEYS = 88;

const globalBuffersRef = { current: new Map() };
const globalAudioContextRef = { current: null };
const DEFAULT_ROWS = 4

function bufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const sampleRate = buffer.sampleRate;
  const result = new ArrayBuffer(44 + length);
  const view = new DataView(result);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  
  // FMT sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 4, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true);
  
  // Data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);
  
  // Write PCM samples
  const offset = 44;
  const channelData = [];
  
  // Interleave channels
  for (let i = 0; i < numOfChan; i++) {
    channelData.push(buffer.getChannelData(i));
  }
  
  let dataIndex = offset;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numOfChan; ch++) {
      // Convert float to int16
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(dataIndex, int16, true);
      dataIndex += 2;
    }
  }
  
  return result;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
function RowControlsModal({
  rowIndex,
  rowSamples,
  customColors = {},
  setCustomColors,
  onSampleChange,
  onClose,
  customSamples = [],
  availableSamples = { public: {}, user: {} },
  onSampleLoadRequest,
  customDurations = {},
  setCustomDurations,
  getSampleDuration,
  customVolumes = {},
  setCustomVolumes,
  customMutes = {},
  setCustomMutes,
  customPitches = {},
  setCustomPitches,
  handleDurationChange,
  handleVolumeChange,
  handlePitchChange
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState({});

  // Obtener información del sample actual
  const currentSampleId = rowSamples[rowIndex];
  const fullDuration = getSampleDuration(currentSampleId);
  const currentDuration = customDurations[rowIndex] ?? 100;
  const currentTime = (currentDuration / 100) * fullDuration;

  // Cargar sample automáticamente si no está disponible
  useEffect(() => {
    if (fullDuration === 0 && !loadingSamples[currentSampleId]) {
      handleSampleSelect(currentSampleId);
    }
  }, [currentSampleId, fullDuration]);

  // Función para renderizar las categorías de samples
  const renderCategorySections = (type) => {
    const samplesData = type === 'public' ? availableSamples.public : availableSamples.user;
    if (!samplesData) return null;

    return Object.entries(samplesData).map(([category, subCategories]) => {
      const allSamples = Object.values(subCategories).flat();
      if (allSamples.length === 0) return null;

      return (
        <React.Fragment key={`${type}-${category}`}>
          <option disabled style={{ 
            fontWeight: 'bold', 
            backgroundColor: '#f0f0f0',
            color: '#333'
          }}>
            ─── {type === 'public' ? '🌐' : '👤'} {category.toUpperCase()} ───
          </option>
          {allSamples.map((sample, idx) => (
            <option
              key={`${type}-${category}-${idx}`}
              value={sample.id}
              style={{ paddingLeft: '20px' }}
              disabled={loadingSamples[sample.id]}
            >
              {sample.name} {loadingSamples[sample.id] ? ' (loading...)' : ''}
            </option>
          ))}
        </React.Fragment>
      );
    });
  };

  // Buscar un sample por ID
  const findSample = (sampleId) => {
    if (!sampleId) return null;
    
    const flattenSamples = (samples) => {
      try {
        return Object.values(samples)
          .flatMap(sub => Object.values(sub || {}))
          .flat();
      } catch (error) {
        console.error("Error flattening samples:", error);
        return [];
      }
    };
    
    const allSamples = [
      ...flattenSamples(availableSamples?.public || {}),
      ...flattenSamples(availableSamples?.user || {})
    ];
    
    return allSamples.find(s => s?.id === sampleId);
  };

  const handleSampleSelect = async (sampleId) => {
    const sampleToLoad = findSample(sampleId);
    
    if (sampleToLoad && onSampleLoadRequest) {
      setLoadingSamples(prev => ({ ...prev, [sampleId]: true }));
      try {
        await onSampleLoadRequest(sampleId);
        
        // Previsualización con duración limitada
        if (globalAudioContextRef.current && globalBuffersRef.current.has(sampleId)) {
          const now = globalAudioContextRef.current.currentTime;
          const buffer = globalBuffersRef.current.get(sampleId);
          const source = globalAudioContextRef.current.createBufferSource();
          source.buffer = buffer;
          
          const gainNode = globalAudioContextRef.current.createGain();
          gainNode.gain.value = 0.8;
          
          const previewDuration = Math.min(1.0, buffer.duration);
          const fadeOutDuration = Math.min(0.1, previewDuration * 0.5);
          const fadeOutStartTime = previewDuration - fadeOutDuration;
  
          if (fadeOutStartTime > 0) {
            gainNode.gain.setValueAtTime(0.8, now + fadeOutStartTime);
            gainNode.gain.linearRampToValueAtTime(0.001, now + previewDuration);
          }
  
          source.connect(gainNode);
          gainNode.connect(globalAudioContextRef.current.destination);
          
          source.start(now, 0, previewDuration);
          source.stop(now + previewDuration);
  
          // Limpiar recursos después de la reproducción
          source.onended = () => {
            gainNode.disconnect();
          };
        }
      } catch (error) {
        console.error("Error loading sample:", error);
      } finally {
        setLoadingSamples(prev => ({ ...prev, [sampleId]: false }));
      }
    }
    
    onSampleChange(sampleId);
    setCustomDurations(prev => ({ ...prev, [rowIndex]: 100 }));
    setCustomVolumes(prev => ({ ...prev, [rowIndex]: 100 }));
    setCustomPitches(prev => ({ ...prev, [rowIndex]: 0 }));
  };

  // Obtener color actual de la fila
  const getCurrentColor = () => {
    const currentSample = rowSamples[rowIndex];
    return customColors[currentSample] || DEFAULT_COLORS[currentSample] || '#a5d6a7';
  };

  // Verificar si hay samples públicos o de usuario
  const hasPublicSamples = Object.values(availableSamples.public || {}).some(
    sub => Object.values(sub || {}).flat().length > 0
  );
  const hasUserSamples = Object.values(availableSamples.user || {}).some(
    sub => Object.values(sub || {}).flat().length > 0
  );

  // Renderizar control de duración
  const renderDurationControl = () => (
    <div style={{ marginBottom: '25px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        fontSize: '14px'
      }}>
        Audio Duration
      </label>
      
      {loadingSamples[currentSampleId] ? (
        <div style={{ color: '#666', fontStyle: 'italic' }}>
          Loading audio...
        </div>
      ) : fullDuration > 0 ? (
        <>
          <input
            type="range"
            min="0"
            max="100"
            value={currentDuration}
            onChange={(e) => handleDurationChange(parseInt(e.target.value, 10), rowIndex)}
            style={{ 
              width: '100%',
              cursor: 'pointer',
              accentColor: getCurrentColor()
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666',
            marginTop: '5px'
          }}>
            <span>{currentTime.toFixed(2)}s</span>
            <span>{fullDuration.toFixed(2)}s</span>
          </div>
        </>
      ) : (
        <div style={{ color: '#ff4444' }}>
          Error loading duration
        </div>
      )}
    </div>
  );

  const renderVolumeControl = () => {
    const currentVolume = customVolumes[rowIndex] ?? 100;
    const isMuted = customMutes[rowIndex] ?? false;

    return (
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          Volume
          <button 
            onClick={() => setCustomMutes(prev => ({
              ...prev,
              [rowIndex]: !isMuted
            }))}
            style={{ 
              marginLeft: '10px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isMuted ? '#ff4444' : '#666',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
        </label>
        
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : currentVolume}
          onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10), rowIndex)}
          style={{ 
            width: '100%',
            cursor: 'pointer',
            accentColor: getCurrentColor()
          }}
        />
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666',
          marginTop: '5px'
        }}>
          <span>{isMuted ? 'Muted' : `${currentVolume}%`}</span>
        </div>
      </div>
    );
  };

  const renderPitchControl = () => {
    const currentPitch = customPitches[rowIndex] ?? 0;
    
    return (
      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>
          Selección de Nota
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
          {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((nota, index) => (
            <button
              key={nota}
              onClick={() => handlePitchChange(index, rowIndex)}
              style={{ 
                backgroundColor: currentPitch === index ? '#4CAF50' : 'transparent',
                border: `2px solid ${currentPitch === index ? '#4CAF50' : '#ddd'}`
              }}
            >
              {nota}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '20px', 
      width: '100%',
      maxWidth: '400px',
      minWidth: '0',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      color: 'white',
      boxSizing: 'border-box',
      overflow: 'hidden',
      margin: '0 auto',
      '@media (max-width: 480px)': {
        padding: '15px',
        maxWidth: 'calc(100vw - 40px)',
        minWidth: 'unset'
      }
    }}>
      {!showColorPicker ? (
        <>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '20px',
            borderBottom: '1px solid #ddd',
            paddingBottom: '10px',
            fontSize: 'clamp(16px, 4vw, 20px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Row {rowIndex + 1} Controls
          </h3>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Sound Sample:
            </label>
            
            <div style={{ position: 'relative', width: '100%' }}>
              <select
                value={rowSamples[rowIndex]}
                onChange={(e) => handleSampleSelect(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  maxHeight: '200px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  WebkitAppearance: 'none'
                }}
                disabled={loadingSamples[rowSamples[rowIndex]]}
                size="10"
              >
                <optgroup label="🔊 BASIC SAMPLES">
                  <option value="kick">Kick</option>
                  <option value="snare">Snare</option>
                  <option value="hihat">Hihat</option>
                  <option value="clap">Clap</option>
                </optgroup>
                
                {hasPublicSamples && (
                  <option disabled style={{ 
                    fontWeight: 'bold', 
                    backgroundColor: '#e0e0e0',
                    color: 'black',
                    fontSize: '12px'
                  }}>
                    ══════ 🌐 PUBLIC SAMPLES ══════
                  </option>
                )}
                
                {hasPublicSamples && renderCategorySections('public')}
                
                {hasUserSamples && (
                  <option disabled style={{ 
                    fontWeight: 'bold', 
                    backgroundColor: '#e0e0e0',
                    color: '#4CAF50',
                    fontSize: '12px'
                  }}>
                    ══════ 👤 USER SAMPLES ══════
                  </option>
                )}
                
                {hasUserSamples && renderCategorySections('user')}
                
                {customSamples.length > 0 && (
                  <optgroup label="🎛️ CUSTOM SAMPLES">
                    {customSamples.map((sample, idx) => (
                      <option key={`custom-${idx}`} value={sample.name}>
                        {sample.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              {loadingSamples[rowSamples[rowIndex]] && (
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '12px',
                  color: '#666',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}>
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* Control de duración del audio */}
          {renderDurationControl()}
          {renderVolumeControl()}
          {renderPitchControl()}

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Row Color:
            </label>
            
            <div 
              style={{
                width: '100%',
                height: '60px',
                backgroundColor: getCurrentColor(),
                borderRadius: '8px',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '@media (max-width: 480px)': {
                  height: '50px'
                }
              }}
              onClick={() => setShowColorPicker(true)}
            >
              <span style={{
                color: '#fff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {getCurrentColor().toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px'
          }}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                fontSize: '14px',
                minWidth: '80px'
              }}
            >
              Close
            </button>
          </div>
        </>
      ) : (
        <SingleColorPickerModalContent
          initialColor={getCurrentColor()}
          onColorUpdate={(newColor) => {
            const currentSample = rowSamples[rowIndex];
            setCustomColors(prev => ({
              ...prev,
              [currentSample]: newColor
            }));
            setShowColorPicker(false);
          }}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
}

RowControlsModal.defaultProps = {
  availableSamples: { public: {}, user: {} },
  customSamples: [],
  customColors: {},
  customDurations: {},
  setCustomDurations: () => {},
  getSampleDuration: () => 0
};

export const PercussionSequencer = ({handleLoadAudio}) => {
  // States
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [customPitches, setCustomPitches] = useState({});
  const [customDurations, setCustomDurations] = useState({});
  const [customVolumes, setCustomVolumes] = useState({});
  const [customMutes, setCustomMutes] = useState({});
  const [BPM, setBPM] = useState(120);
  const [rowModalOpen, setRowModalOpen] = useState(false); // Nuevo estado para modal de fila
  const [selectedRowIndex, setSelectedRowIndex] = useState(null); 
  const [controlsModalOpen, setControlsModalOpen] = useState(false);
  const [rowSamples, setRowSamples] = useState(
    Array(DEFAULT_ROWS).fill().map((_, i) => DEFAULT_SAMPLES[i] || 'kick')
  );
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [numerator, setNumerator] = useState(4);
  const [denominator, setDenominator] = useState(4);
  const [subdivisionsPerPulse, setSubdivisionsPerPulse] = useState(4);
  const [measures, setMeasures] = useState(1);
  const [measureWidth, setMeasureWidth] = useState(800);
  const [componentHeight, setComponentHeight] = useState(200);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeRows, setActiveRows] = useState(new Set());
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [audioContextState, setAudioContextState] = useState('suspended');
  const [isGlobalRecording, setIsGlobalRecording] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [newSampleName, setNewSampleName] = useState('');
  const [customSamples, setCustomSamples] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [collapsedRows, setCollapsedRows] = useState(() => {
    const initialCollapsed = new Set();
    Array.from({ length: DEFAULT_ROWS }).forEach((_, i) => initialCollapsed.add(i));
    return initialCollapsed;
  });
  const [customColors, setCustomColors] = useState(() => ({ ...DEFAULT_COLORS }));
  const [hoveredRow, setHoveredRow] = useState(null);

  // Refs
  const currentPitchesRef = useRef(customPitches);
  const currentVolumesRef = useRef(customVolumes);
  const currentDurationsRef = useRef(customDurations);
  const currentMutesRef = useRef(customMutes);

  useEffect(() => {
    currentPitchesRef.current = customPitches;
    currentVolumesRef.current = customVolumes;
    currentDurationsRef.current = customDurations;
    currentMutesRef.current = customMutes;
  }, [customPitches, customVolumes, customDurations, customMutes]);




  const scheduledSourcesRef = useRef(new Set());
  const animationRef = useRef(null);
  const currentStepRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const gridContainerRef = useRef(null);
  const headerContainerRef = useRef(null);
  const leftPanelRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const tempSampleNameRef = useRef('');
  const isPlayingRef = useRef(isPlaying);
  const numeratorRef = useRef(numerator);
  const subdivisionsPerPulseRef = useRef(subdivisionsPerPulse);
  const measuresRef = useRef(measures);
  const isScrollingProgrammatically = useRef(false);
  const isScrollingVertically = useRef(false);
  const bpmRef = useRef(BPM);

  useEffect(() => {
    bpmRef.current = BPM;
  }, [BPM]);

  useEffect(() => {
    numeratorRef.current = numerator;
  }, [numerator]);




  const [availableSamples, setAvailableSamples] = useState({ 
    public: {}, 
    user: {} 
  });

  useEffect(() => {
    const fetchAvailableSamples = async () => {
      try {
        const response = await fetch('/api/blackBlaze/listAllPublicSamples');
        const data = await response.json();
        
        const processCategory = (pathParts, files) => {
          const category = pathParts[2] || 'uncategorized';
          const subCategory = pathParts[3] || 'general';
          
          return {
            [category]: {
              [subCategory]: files.map(file => ({
                id: file.fileName.split('/').pop().split('.')[0],
                name: file.fileName.split('/').pop(),
                url: file.signedUrl,
                fullPath: file.fileName
              }))
            }
          };
        };
  
        const organizedSamples = { public: {}, user: {} };
  
        Object.entries(data.groups || {}).forEach(([folderPath, files]) => {
          const pathParts = folderPath.split('/');
          // Manejar paths vacíos o mal formados
          const type = pathParts[0] === 'publicSamples' ? 'public' : 'user';
          const categoryData = processCategory(pathParts, files);
          
          // Asegurar merge seguro de categorías
          organizedSamples[type] = {
            ...organizedSamples[type],
            ...Object.entries(categoryData).reduce((acc, [cat, subCats]) => {
              acc[cat] = {
                ...(organizedSamples[type][cat] || {}),
                ...subCats
              };
              return acc;
            }, {})
          };
        });
        
        setAvailableSamples(organizedSamples);
      } catch (error) {
        console.error("Error fetching samples:", error);
        // Mantener estructura válida en caso de error
        setAvailableSamples({ public: {}, user: {} });
      }
    };
  
    fetchAvailableSamples();
  }, []);

// Función para buscar samples en la estructura availableSamples
const findSample = (sampleId) => {
  if (!sampleId) return null;
  
  const flattenSamples = (samples) => {
    try {
      return Object.values(samples)
        .flatMap(sub => Object.values(sub || {}))
        .flat();
    } catch (error) {
      console.error("Error flattening samples:", error);
      return [];
    }
  };
  
  const allSamples = [
    ...flattenSamples(availableSamples?.public || {}),
    ...flattenSamples(availableSamples?.user || {})
  ];
  
  return allSamples.find(s => s?.id === sampleId);
};





  // Constants and derived values
  const MIN_EXPANDED_HEIGHT = 50;
  const totalStepsPerMeasure = numerator * subdivisionsPerPulse;
  const totalSteps = measures * totalStepsPerMeasure;
  const cellWidth = measureWidth / totalStepsPerMeasure;
  const totalGridWidth = measures * numerator * subdivisionsPerPulse * cellWidth + 2;
  const collapsedRowCount = collapsedRows.size;
  const totalExpandedRows = rows - collapsedRowCount;
  const availableHeightForExpanded = Math.max(
    componentHeight - (collapsedRowCount * 20),
    totalExpandedRows * MIN_EXPANDED_HEIGHT
  );
  const expandedRowHeight = totalExpandedRows > 0 ? 
    Math.max(MIN_EXPANDED_HEIGHT, availableHeightForExpanded / totalExpandedRows) : 0;

  const rowHeights = Array.from({ length: rows }, (_, rowIndex) => 
    collapsedRows.has(rowIndex) ? 20 : expandedRowHeight
  );

  const cumulativeHeights = [];
  let currentHeight = 0;
  for (let i = 0; i < rows; i++) {
    cumulativeHeights[i] = currentHeight;
    currentHeight += rowHeights[i];
  }

  // Helper functions
  const getRowColor = (sampleName) => {
    return customColors[sampleName] || DEFAULT_COLORS[sampleName] || '#a5d6a7';
  };

  const getBorderStyle = (stepIndex) => {
    const localStep = stepIndex % totalStepsPerMeasure;
    if (localStep === 0) return '3px solid black';
    if (localStep % subdivisionsPerPulse === 0) return '2px solid gray';
    return '1px solid #eee';
  };

  // Audio functions
  const initAudioContext = useCallback(() => {
    if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
      globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContextState(globalAudioContextRef.current.state);
      globalAudioContextRef.current.onstatechange = () => {
        setAudioContextState(globalAudioContextRef.current.state);
      };
    }
  }, []);

  const loadSamples = useCallback(async () => {
    if (globalAudioContextRef.current) {
      // Check if the context is not already closed before closing it
      if (globalAudioContextRef.current.state !== "closed") {
        await globalAudioContextRef.current.close();
      }
    }
    
    // Initialize a new AudioContext
    globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  
    const samples = {
      kick: '/samples/public/percussion/uno.mp3',
      snare: '/samples/public/percussion/dos.mp3',
      hihat: '/samples/public/percussion/tres.mp3',
      clap: '/samples/public/percussion/cuatro.mp3'
    };
  
    try {
      initAudioContext();
      const responses = await Promise.all(Object.values(samples).map(url => fetch(url)));
      const arrayBuffers = await Promise.all(responses.map(res => res.arrayBuffer()));
      const audioBuffers = await Promise.all(
        arrayBuffers.map(buffer =>
          globalAudioContextRef.current.decodeAudioData(buffer)
        )
      );
  
      audioBuffers.forEach((buffer, index) => {
        const sampleName = Object.keys(samples)[index];
        globalBuffersRef.current.set(sampleName, buffer);
      });
  
      setSamplesLoaded(true);
    } catch (error) {
      console.error('Error loading samples:', error);
      setSamplesLoaded(false);
    }
  }, [initAudioContext]);
  



  const previewWithCurrentParams = useCallback(async (rowIndex, semitoneOffset = undefined) => {
    if (!globalAudioContextRef.current) {
      globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (globalAudioContextRef.current.state === 'suspended') {
      await globalAudioContextRef.current.resume();
    }
  
    const sampleId = rowSamples[rowIndex];
    const buffer = globalBuffersRef.current.get(sampleId);
    if (!buffer) return;
  
    const now = globalAudioContextRef.current.currentTime;
    const source = globalAudioContextRef.current.createBufferSource();
    source.buffer = buffer;
  
    // Usar semitoneOffset si está definido, de lo contrario usar el valor del estado
    const pitch = semitoneOffset !== undefined ? semitoneOffset : (customPitches[rowIndex] || 0);
    const playbackRate = Math.pow(2, pitch / 12);
    source.playbackRate.value = playbackRate;
  
    const gainNode = globalAudioContextRef.current.createGain();
    const volume = customMutes[rowIndex] ? 0 : (customVolumes[rowIndex] ?? 100) / 100;
    gainNode.gain.value = volume;
  
    const durationPercentage = customDurations[rowIndex] ?? 100;
    const maxPreviewDuration = 1.0;
    const bufferDuration = buffer.duration / playbackRate;
    const userDuration = (durationPercentage / 100) * bufferDuration;
    const previewDuration = Math.min(maxPreviewDuration, userDuration);
  
    const fadeOutDuration = Math.min(0.1, previewDuration * 0.5);
    const fadeOutStartTime = previewDuration - fadeOutDuration;
  
    if (fadeOutStartTime > 0) {
      gainNode.gain.setValueAtTime(volume, now + fadeOutStartTime);
      gainNode.gain.linearRampToValueAtTime(0.001, now + previewDuration);
    }
  
    source.connect(gainNode);
    gainNode.connect(globalAudioContextRef.current.destination);
  
    source.start(now, 0, previewDuration);
    source.stop(now + previewDuration);
  
    source.onended = () => {
      gainNode.disconnect();
    };
  }, [rowSamples, customPitches, customVolumes, customMutes, customDurations]);

  
  const handleDurationChange = (newValue, rowIndex) => {
    setCustomDurations(prev => ({
      ...prev,
      [rowIndex]: newValue
    }));
    previewWithCurrentParams(rowIndex);
  };
  
  // En PercussionSequencer
  const handlePitchChange = (semitone, rowIndex) => {
    setCustomPitches(prev => ({ 
      ...prev, 
      [rowIndex]: semitone 
    }));
    // Llama a previewWithCurrentParams con el semitone explícito
    previewWithCurrentParams(rowIndex, semitone);
  };
  
  const handleVolumeChange = (newValue, rowIndex) => {
    setCustomVolumes(prev => ({ 
      ...prev, 
      [rowIndex]: newValue 
    }));
    if (newValue > 0) {
      setCustomMutes(prev => ({
        ...prev,
        [rowIndex]: false
      }));
    }
    previewWithCurrentParams(rowIndex);
  };
  





const playSound = useCallback((
  sampleId, 
  time, 
  rowIndex,
  pitch = customPitches[rowIndex] || 0,
  volume = customMutes[rowIndex] ? 0 : (customVolumes[rowIndex] ?? 100) / 100,
  duration = customDurations[rowIndex] ?? 100
) => {
  if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') return;

  const buffer = globalBuffersRef.current.get(sampleId);
  if (!buffer) return;

  // Usar valores DIRECTAMENTE del estado actual usando function updater
  const currentPitch = customPitches[rowIndex] || 0;
  const currentVolume = customMutes[rowIndex] ? 0 : (customVolumes[rowIndex] ?? 100) / 100;
  const currentDuration = customDurations[rowIndex] ?? 100;

  const source = globalAudioContextRef.current.createBufferSource();
  source.buffer = buffer;
  
  // Aplicar parámetros
  const playbackRate = Math.pow(2, currentPitch / 12);
  source.playbackRate.value = playbackRate;

  const gainNode = globalAudioContextRef.current.createGain();
  gainNode.gain.setValueAtTime(currentVolume, time);

  // Calcular duración
  const bufferDuration = buffer.duration / playbackRate;
  const userDuration = (currentDuration / 100) * bufferDuration;
  const effectiveDuration = Math.min(userDuration, bufferDuration);

  // Configurar fade out
  const fadeOutDuration = Math.min(0.1, effectiveDuration * 0.5);
  const fadeOutStartTime = time + effectiveDuration - fadeOutDuration;

  if (fadeOutStartTime > time) {
    gainNode.gain.setValueAtTime(currentVolume, fadeOutStartTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + effectiveDuration);
  }

  source.connect(gainNode);
  gainNode.connect(globalAudioContextRef.current.destination);

  source.start(time, 0, effectiveDuration);
  source.stop(time + effectiveDuration);

  // Limpieza
  source.onended = () => {
    gainNode.disconnect();
    scheduledSourcesRef.current.delete(source);
    scheduledSourcesRef.current.delete(gainNode);
  };

  scheduledSourcesRef.current.add(source);
  scheduledSourcesRef.current.add(gainNode);
}, [customPitches, customVolumes, customMutes, customDurations]); // Eliminar dependencias, usar valores frescos del estado








const stopPlayback = useCallback(() => {
  cancelAnimationFrame(animationRef.current);
  scheduledSourcesRef.current.forEach(node => {
    try {
      if (node.stop && typeof node.stop === 'function') {
        node.stop();
      }
      if (node.disconnect && typeof node.disconnect === 'function') {
        node.disconnect();
      }
    } catch(e) { 
      console.warn('Error stopping audio node:', e); 
    }
  });
  scheduledSourcesRef.current.clear();
  setIsPlaying(false);
}, []);

const startPlayback = useCallback(async (autoScroll) => {
  try {
    initAudioContext();
    if (globalAudioContextRef.current.state === 'suspended') {
      await globalAudioContextRef.current.resume();
    }

    stopPlayback();
    
    if (gridContainerRef.current && headerContainerRef.current && autoScroll) {
      isScrollingProgrammatically.current = true;
      gridContainerRef.current.scrollLeft = 0;
      headerContainerRef.current.scrollLeft = 0;
      isScrollingProgrammatically.current = false;
    }
    
    startTimeRef.current = globalAudioContextRef.current.currentTime;
    nextStepTimeRef.current = startTimeRef.current;
    setIsPlaying(true);

    // Referencias actualizadas para los parámetros en tiempo real
    const currentPitchesRef = customPitches;
    const currentVolumesRef = customVolumes;
    const currentDurationsRef = customDurations;
    const currentMutesRef = customMutes;

    const scheduler = () => {
      if (!isPlayingRef.current) return;
      
      const currentTime = globalAudioContextRef.current.currentTime;
      const stepsPerSecond = (bpmRef.current * subdivisionsPerPulseRef.current) / 60;
      const totalSteps = measuresRef.current * numeratorRef.current * subdivisionsPerPulseRef.current;
      const newStep = Math.floor((currentTime - startTimeRef.current) * stepsPerSecond) % totalSteps;
      
      if (newStep !== currentStepRef.current) {
        Array.from({ length: rows }).forEach((_, rowIndex) => {
          const cellId = `${rowIndex}-${newStep}`;
          if (selectedCells.has(cellId)) {
            // Usar los valores más recientes de los parámetros
            const pitch = currentPitchesRef[rowIndex] || 0;
            const volume = currentMutesRef[rowIndex] ? 0 : (currentVolumesRef[rowIndex] ?? 100) / 100;
            const duration = currentDurationsRef[rowIndex] ?? 100;
            
            playSound(
              rowSamples[rowIndex],
              currentTime,
              rowIndex,
              pitch,
              volume,
              duration
            );
          }
        });
        
        currentStepRef.current = newStep;
        setCurrentStep(newStep);

        // Auto-scroll si está habilitado
        if (autoScroll && gridContainerRef.current) {
          const scrollPos = newStep * cellWidth - gridContainerRef.current.clientWidth / 2;
          isScrollingProgrammatically.current = true;
          gridContainerRef.current.scrollTo({
            left: scrollPos,
            behavior: 'smooth'
          });
          isScrollingProgrammatically.current = false;
        }
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
  initAudioContext, 
  stopPlayback, 
  rows, 
  rowSamples, 
  selectedCells, 
  customPitches,
  customVolumes,
  customDurations,
  customMutes,
  cellWidth
]);

  const togglePlayback = useCallback(async () => {
    if (!samplesLoaded) return;
    isPlaying ? stopPlayback() : await startPlayback(autoScroll);
  }, [isPlaying, samplesLoaded, startPlayback, stopPlayback, autoScroll]);

  // UI handlers
  const handleCellClick = (rowIndex, stepIndex) => {
    const cellId = `${rowIndex}-${stepIndex}`;
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      newSet.has(cellId) ? newSet.delete(cellId) : newSet.add(cellId);
      return newSet;
    });
    
    initAudioContext();
    playSound(rowSamples[rowIndex], globalAudioContextRef.current.currentTime + 0.05, rowIndex);
  };

  const handleRowsChange = (newRows) => {
    const numRows = Math.max(1, Math.min(300, newRows));
    setRows(numRows);
    
    setRowSamples(prev => Array(numRows).fill().map((_, i) => 
      i < prev.length ? prev[i] : DEFAULT_SAMPLES[i % DEFAULT_SAMPLES.length] || 'kick'
    ));

    setCollapsedRows(prev => {
      const newCollapsed = new Set(prev);
      for (let i = 0; i < numRows; i++) {
        if (!newCollapsed.has(i)) newCollapsed.add(i);
      }
      Array.from(newCollapsed).forEach(row => {
        if (row >= numRows) newCollapsed.delete(row);
      });
      return newCollapsed;
    });
  };

  // Scroll handlers
  const handleSyncScroll = (source, target) => {
    if (!isScrollingProgrammatically.current && target) {
      isScrollingProgrammatically.current = true;
      target.scrollLeft = source.scrollLeft;
      isScrollingProgrammatically.current = false;
    }
  };

  const handleGridScroll = (e) => handleSyncScroll(e.target, headerContainerRef.current);
  const handleHeaderScroll = (e) => handleSyncScroll(e.target, gridContainerRef.current);
  const handleVerticalSyncScroll = (source, target) => {
    if (!isScrollingVertically.current && target) {
      isScrollingVertically.current = true;
      target.scrollTop = source.scrollTop;
      isScrollingVertically.current = false;
    }
  };
  const handleGridVerticalScroll = (e) => handleVerticalSyncScroll(e.target, leftPanelRef.current);
  const handleLeftPanelScroll = (e) => handleVerticalSyncScroll(e.target, gridContainerRef.current);

  // Recording functions
  const playCountdownBeep = useCallback((count, onFinish) => {
    if (!globalAudioContextRef.current) {
      globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const beepDuration = 0.1;
    const interval = 60 / BPM;
    const startTime = globalAudioContextRef.current.currentTime;

    for (let i = 0; i < count; i++) {
      const time = startTime + i * interval;
      const osc = globalAudioContextRef.current.createOscillator();
      const gain = globalAudioContextRef.current.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(i === count - 1 ? 880 : 440, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.5, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, time + beepDuration);
      osc.connect(gain);
      gain.connect(globalAudioContextRef.current.destination);
      osc.start(time);
      osc.stop(time + beepDuration);
    }

    if (onFinish) setTimeout(onFinish, count * interval * 1000);
  }, [BPM]);

  const startRecording = useCallback(() => {
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
            tempSampleNameRef.current = tempName;
            globalBuffersRef.current.set(tempName, audioBuffer);
            setNewSampleName(tempName);
            setShowNameInput(true);
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
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const saveCustomSample = useCallback(() => {
    if (newSampleName.trim()) {
      const tempName = tempSampleNameRef.current;
      const buffer = globalBuffersRef.current.get(tempName);
      
      if (buffer) {
        globalBuffersRef.current.delete(tempName);
        globalBuffersRef.current.set(newSampleName.trim(), buffer);
        setCustomSamples(prev => [...prev, { name: newSampleName.trim(), buffer }]);
        setShowNameInput(false);
        setNewSampleName('');
        tempSampleNameRef.current = '';
      }
    }
  }, [newSampleName]);

  const handleStartRecording = useCallback(async () => {
    try {
      initAudioContext();
      playCountdownBeep(numeratorRef.current, startRecording);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  }, [initAudioContext, playCountdownBeep, startRecording]);

  // Modal functions
  const openRowControls = (rowIndex) => {
    setSelectedRowIndex(rowIndex);
    setRowModalOpen(true);
  };
  
  
  
  const openControlsModal = () => {
    setControlsModalOpen(true);
  };

  // Render functions
  const renderLeftPanel = () => {
    return Array.from({ length: rows }).map((_, rowIndex) => {
      const isCollapsed = collapsedRows.has(rowIndex);
      const sampleName = rowSamples[rowIndex];
      const rowColor = getRowColor(sampleName);
      const isHovered = hoveredRow === rowIndex;
      const isActive = activeRows.has(rowIndex);
  
      return (
        <div
          key={`left-${rowIndex}`}
          style={{
            height: `${rowHeights[rowIndex]}px`,
            border: '1px solid #ddd',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'center',
            fontSize: '10px',
            color: '#000',
            cursor: 'pointer',
            userSelect: 'none',
            boxSizing: 'border-box',
            backgroundColor: isActive 
              ? `${rowColor}80` 
              : isHovered 
                ? `${rowColor}40` 
                : 'transparent',
            transition: 'all 0.2s ease-out',
            overflow: 'hidden'
          }}
          onMouseEnter={() => setHoveredRow(rowIndex)}
          onMouseLeave={() => setHoveredRow(null)}
          onClick={() => !isCollapsed && openRowControls(rowIndex)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsedRows(prev => {
                const newSet = new Set(prev);
                newSet.has(rowIndex) ? newSet.delete(rowIndex) : newSet.add(rowIndex);
                return newSet;
              });
            }}
            style={{
              position: 'absolute',
              left: '2px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              fontSize: '20px',
              color: '#666',
              zIndex: 1
            }}
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
  
          {!isCollapsed ? (
            <>
              <span style={{ fontSize: '15px' }}>Row {rowIndex + 1}</span>
              <div style={{ 
                marginTop: '2px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px' 
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: rowColor, 
                  borderRadius: '2px' 
                }} />
                <span style={{ 
                  fontSize: '20px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap', 
                  maxWidth: '70px' 
                }}>
                  {sampleName}
                </span>
              </div>
            </>
          ) : (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '100%', 
                paddingLeft: '20px'
              }}
              onClick={() => openRowControls(rowIndex)}
            >
              <div style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: rowColor, 
                borderRadius: '2px', 
                marginRight: '5px' 
              }} />
              <span style={{ 
                fontSize: '12px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap', 
                maxWidth: '40px' 
              }}>
                {sampleName}
              </span>
            </div>
          )}
        </div>
      );
    });
  };

  const renderTimelineHeaders = () => {
    return Array.from({ length: totalSteps }).map((_, stepIndex) => {
      const localStep = stepIndex % totalStepsPerMeasure;
      const measureLabel = localStep === 0 ? Math.floor(stepIndex / totalStepsPerMeasure) + 1 : "";
      const pulseLabel = localStep % subdivisionsPerPulse === 0 ? Math.floor(localStep / subdivisionsPerPulse) + 1 : "";
      const subdivisionLabel = (localStep % subdivisionsPerPulse) + 1;
      const borderLeft = getBorderStyle(stepIndex);
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
    });
  };

  const renderGridCells = () => {
    return Array.from({ length: rows }).map((_, rowIndex) => {
      const isCollapsed = collapsedRows.has(rowIndex);
      
      return Array.from({ length: totalSteps }).map((_, stepIndex) => {
        const cellId = `${rowIndex}-${stepIndex}`;
        const isActive = selectedCells.has(cellId);
        const cellBgColor = isActive ? getRowColor(rowSamples[rowIndex]) : '#f9f9f9';
        const borderRadiusValue = isActive ? '8px' : '2px';
        const cellBorderLeft = getBorderStyle(stepIndex);
        
        return (
          <div
            key={`cell-${rowIndex}-${stepIndex}`}
            onClick={() => handleCellClick(rowIndex, stepIndex)}
            style={{
              position: 'absolute',
              left: `${stepIndex * cellWidth}px`,
              top: `${cumulativeHeights[rowIndex]}px`,
              width: `${cellWidth}px`,
              height: `${rowHeights[rowIndex]}px`,
              backgroundColor: cellBgColor,
              border: 'none',
              borderLeft: cellBorderLeft,
              borderTop: '1px solid #eee',
              borderBottom: '1px solid #eee',
              borderRight: '1px solid #eee',
              borderRadius: borderRadiusValue,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
              opacity: isCollapsed ? 0.7 : 1
            }}
          />
        );
      });
    }).flat();
  };

  // Effects
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    numeratorRef.current = numerator;
    subdivisionsPerPulseRef.current = subdivisionsPerPulse;
    measuresRef.current = measures;
  }, [isPlaying, numerator, subdivisionsPerPulse, measures]);

  useEffect(() => {
    if (modalOpen) {
      setModalContent(prev => 
        React.isValidElement(prev) ? 
        React.cloneElement(prev, { 
          rowSamples: [...rowSamples],
          customColors: {...customColors}
        }) : 
        prev
      );
    }
  }, [rowSamples, customColors, modalOpen]);

  useEffect(() => {
    loadSamples();
    return () => {
      stopPlayback();
      if (globalAudioContextRef.current) globalAudioContextRef.current.close();
    };
  }, [loadSamples, stopPlayback]);

  useEffect(() => {
    const gridContainer = gridContainerRef.current;
    const leftPanel = leftPanelRef.current;

    if (gridContainer && leftPanel) {
      gridContainer.addEventListener('scroll', handleGridVerticalScroll);
      leftPanel.addEventListener('scroll', handleLeftPanelScroll);
    }

    return () => {
      if (gridContainer && leftPanel) {
        gridContainer.removeEventListener('scroll', handleGridVerticalScroll);
        leftPanel.removeEventListener('scroll', handleLeftPanelScroll);
      }
    };
  }, [showLeftPanel]);

  const exportPatternToBuffer = async () => {
    if (!globalAudioContextRef.current) return null;
    
    try {
      // Calcular la duración total del patrón en segundos
      const totalSteps = measures * numerator * subdivisionsPerPulse;
      const stepDuration = 60 / BPM / subdivisionsPerPulse;
      const totalDuration = totalSteps * stepDuration;
      
      // Crear un buffer vacío
      const sampleRate = globalAudioContextRef.current.sampleRate;
      const buffer = globalAudioContextRef.current.createBuffer(
        2, // 2 canales (estéreo)
        Math.ceil(totalDuration * sampleRate),
        sampleRate
      );
      
      // Renderizar cada paso activo en el buffer
      for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
        const stepTime = stepIndex * stepDuration;
        
        Array.from({ length: rows }).forEach((_, rowIndex) => {
          const cellId = `${rowIndex}-${stepIndex}`;
          if (selectedCells.has(cellId)) {
            const sampleId = rowSamples[rowIndex];
            const sourceBuffer = globalBuffersRef.current.get(sampleId);
            
            if (sourceBuffer) {
              const startSample = Math.floor(stepTime * sampleRate);
              const sourceDuration = (customDurations[rowIndex] ?? 100) / 100 * sourceBuffer.duration;
              
              // Copiar los datos del sample al buffer principal
              for (let channel = 0; channel < 2; channel++) {
                const outputData = buffer.getChannelData(channel);
                const inputData = sourceBuffer.getChannelData(channel % sourceBuffer.numberOfChannels);
                
                const volume = customMutes[rowIndex] ? 0 : (customVolumes[rowIndex] ?? 100) / 100;
                const copyLength = Math.min(
                  Math.floor(sourceDuration * sampleRate),
                  outputData.length - startSample
                );
                
                for (let i = 0; i < copyLength; i++) {
                  outputData[startSample + i] += inputData[i] * volume;
                }
              }
            }
          }
        });
      }
      
      return buffer;
    } catch (error) {
      console.error("Error exporting pattern:", error);
      return null;
    }
  };

  // Main render
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      paddingLeft: '5px',
      maxWidth: '1200px',
      margin: '0 auto',
      overflow: 'hidden'
    }}>
      {/* Modal para controles de fila */}
      <Modal isOpen={rowModalOpen} onClose={() => {
        setRowModalOpen(false);
        setSelectedRowIndex(null);
      }}>
        {selectedRowIndex !== null && (
          <RowControlsModal
            key={selectedRowIndex}
            rowIndex={selectedRowIndex}
            rowSamples={rowSamples}
            customColors={customColors}
            setCustomColors={setCustomColors}
            customSamples={customSamples}
            availableSamples={availableSamples}
            onSampleLoadRequest={async (sampleId) => {
              try {
                const sample = findSample(sampleId);
                if (!sample) throw new Error(`Sample not found`);
                if (!globalBuffersRef.current.has(sampleId)) {
                  const response = await fetch(sample.url);
                  const buffer = await response.arrayBuffer();
                  const audioBuffer = await globalAudioContextRef.current.decodeAudioData(buffer);
                  globalBuffersRef.current.set(sampleId, audioBuffer);
                }
              } catch (error) {
                console.error("Error loading sample:", error);
                throw error;
              }
            }}
            onSampleChange={(newSample) => {
              const newRowSamples = [...rowSamples];
              newRowSamples[selectedRowIndex] = newSample;
              setRowSamples(newRowSamples);
              if (globalAudioContextRef.current) {
                const buffer = globalBuffersRef.current.get(newSample);
                if (buffer) {
                  const source = globalAudioContextRef.current.createBufferSource();
                  source.buffer = buffer;
                  source.connect(globalAudioContextRef.current.destination);
                  source.start(globalAudioContextRef.current.currentTime + 0.05);
                }
              }
            }}
            onClose={() => {
              setRowModalOpen(false);
              setSelectedRowIndex(null);
            }}
            customDurations={customDurations}
            setCustomDurations={setCustomDurations}
            getSampleDuration={(sampleId) => {
              const buffer = globalBuffersRef.current.get(sampleId);
              return buffer ? buffer.duration : 0;
            }}
            customVolumes={customVolumes}
            setCustomVolumes={setCustomVolumes}
            customMutes={customMutes}
            setCustomMutes={setCustomMutes}
            customPitches={customPitches}
            setCustomPitches={setCustomPitches}
            handleDurationChange={handleDurationChange}
            handleVolumeChange={handleVolumeChange}
            handlePitchChange={handlePitchChange}
          />
        )}
      </Modal>
  
      {/* Modal para controles generales COMPLETO */}
      <Modal isOpen={controlsModalOpen} onClose={() => setControlsModalOpen(false)}>
        <div style={{ 
          padding: '20px', 
          width: '70vw', 
          maxHeight: '80vh', 
          overflowY: 'auto',
          borderRadius: '8px',
          backgroundColor: '#000',
          color: '#fff',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}>
          {/* Sección de grabación */}
          <div style={{ 
            marginBottom: '25px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>Recording Studio</h3>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={isGlobalRecording ? stopRecording : handleStartRecording}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: isGlobalRecording ? '#dc3545' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {isGlobalRecording ? (
                  <>
                    <i className="fas fa-stop"></i> Stop Recording
                  </>
                ) : (
                  <>
                    <i className="fas fa-microphone"></i> Record Sample
                  </>
                )}
              </button>
  
              {showNameInput && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center', 
                  flex: 1,
                  minWidth: '300px'
                }}>
                  <input
                    type="text"
                    value={newSampleName}
                    onChange={(e) => setNewSampleName(e.target.value)}
                    placeholder="My Awesome Sample"
                    style={{ 
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #444',
                      backgroundColor: '#333',
                      color: '#fff',
                      flex: 1,
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                  />
                  <button 
                    onClick={saveCustomSample}
                    disabled={!newSampleName.trim()}
                    style={{ 
                      padding: '12px 24px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '500',
                      opacity: !newSampleName.trim() ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <i className="fas fa-save"></i> Save
                  </button>
                </div>
              )}
            </div>
          </div>
  
          {/* Sección de configuración del grid */}
          <div style={{ 
            marginBottom: '25px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>Grid Configuration</h3>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              {/* Control de filas */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#fff'
                }}>
                  <i className="fas fa-grip-lines"></i> Rows
                </label>
                <RangeInput
                  min={1}
                  max={300}
                  value={rows}
                  onChange={handleRowsChange}
                  progressColor="backgroundColor1"
                  trackColor="backgroundColor2"
                />
              </div>
  
              {/* Control de tiempo */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#fff'
                }}>
                  <i className="fas fa-time-signature"></i> Time Signature
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    value={numerator}
                    onChange={(e) => setNumerator(Number(e.target.value))}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #444',
                      backgroundColor: '#333',
                      color: '#fff',
                      flex: 1,
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                      <option key={num} value={num} style={{ backgroundColor: '#333', color: '#fff' }}>{num}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '20px', color: '#fff' }}>/</span>
                  <select
                    value={denominator}
                    onChange={(e) => setDenominator(Number(e.target.value))}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #444',
                      backgroundColor: '#333',
                      color: '#fff',
                      flex: 1,
                      fontSize: '16px',
                      cursor: 'pointer'
                    }}
                  >
                    {[1, 2, 4, 8, 16, 32].map(den => (
                      <option key={den} value={den} style={{ backgroundColor: '#333', color: '#fff' }}>{den}</option>
                    ))}
                  </select>
                </div>
              </div>
  
              {/* Subdivisiones */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#fff'
                }}>
                  <i className="fas fa-divide"></i> Subdivisions
                </label>
                <RangeInput
                  min={1}
                  max={12}
                  value={subdivisionsPerPulse}
                  onChange={setSubdivisionsPerPulse}
                  progressColor="backgroundColor1"
                  trackColor="backgroundColor2"
                />
              </div>
  
              {/* Medidas */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#fff'
                }}>
                  <i className="fas fa-ruler-combined"></i> Measures
                </label>
                <RangeInput
                  min={1}
                  max={12}
                  value={measures}
                  onChange={setMeasures}
                  progressColor="backgroundColor1"
                  trackColor="backgroundColor2"
                />
              </div>
            </div>
  
            {/* Configuración de visualización */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {/* Ancho de medida */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#fff'
                }}>
                  <i className="fas fa-arrows-alt-h"></i> Measure Width
                </label>
                <RangeInput
                  min={300}
                  max={1200}
                  step={10}
                  value={measureWidth}
                  onChange={setMeasureWidth}
                  progressColor="backgroundColor1"
                  trackColor="backgroundColor2"
                />
              </div>
  
              {/* Altura del componente */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#fff'
                }}>
                  <i className="fas fa-arrows-alt-v"></i> Grid Height
                </label>
                <RangeInput
                  min={Math.max(230, rows * 20)}
                  max={400}
                  step={10}
                  value={componentHeight}
                  onChange={setComponentHeight}
                  progressColor="backgroundColor1"
                  trackColor="backgroundColor2"
                />
              </div>
  
              {/* BPM */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px',
                  fontWeight: '500',
                  color: '#fff'
                }}>
                  <i className="fas fa-tachometer-alt"></i> BPM
                </label>
                <RangeInput
                  min={30}
                  max={240}
                  value={BPM}
                  onChange={setBPM}
                  progressColor="backgroundColor1"
                  trackColor="backgroundColor2"
                />
              </div>
            </div>
  
            {/* Opciones adicionales */}
            <div style={{ 
              marginTop: '25px',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff' }}>Display Options</h4>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: '#333',
                  border: '1px solid #444',
                  flex: '1 1 200px'
                }}>
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    style={{ 
                      width: '18px', 
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: '#fff' }}>Auto-scroll</div>
                    <div style={{ fontSize: '14px', color: '#aaa' }}>Follow playback position</div>
                  </div>
                </label>
  
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: '#333',
                  border: '1px solid #444',
                  flex: '1 1 200px'
                }}>
                  <input
                    type="checkbox"
                    checked={showLeftPanel}
                    onChange={(e) => setShowLeftPanel(e.target.checked)}
                    style={{ 
                      width: '18px', 
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#007bff'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: '#fff' }}>Left Panel</div>
                    <div style={{ fontSize: '14px', color: '#aaa' }}>Show row controls</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
  
          {/* Sección de samples personalizados */}
          {customSamples.length > 0 && (
            <div style={{ 
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #333'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>
                <i className="fas fa-folder-open"></i> Custom Samples ({customSamples.length})
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '12px'
              }}>
                {customSamples.map((sample, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: '#333',
                      borderRadius: '6px',
                      border: '1px solid #444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        backgroundColor: '#444'
                      }
                    }}
                    onClick={() => {
                      if (selectedRow !== null) {
                        const updatedRows = [...rowsData];
                        updatedRows[selectedRow] = {
                          ...updatedRows[selectedRow],
                          sample: sample.audioBuffer,
                          sampleName: sample.name
                        };
                        setRowsData(updatedRows);
                        setControlsModalOpen(false);
                        toast.success(`Sample "${sample.name}" asignado a la fila ${selectedRow + 1}`);
                      } else {
                        playSamplePreview(sample.audioBuffer);
                        toast.info(`Reproduciendo preview de "${sample.name}"`);
                      }
                    }}
                    onDoubleClick={() => {
                      if (window.confirm(`¿Eliminar el sample "${sample.name}"?`)) {
                        deleteCustomSample(index);
                      }
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#555',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#fff'
                    }}>
                      <i className="fas fa-music"></i>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        color: '#fff'
                      }}>
                        {sample.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#aaa'
                      }}>
                        {sample.duration ? `${sample.duration.toFixed(2)}s` : 'Custom Sample'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
      
      {/* Controles principales de la interfaz */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        alignItems: 'center', 
        marginBottom: '15px',
        flexWrap: 'wrap',
        padding: '10px',
        borderRadius: '8px'
      }}>
        <ShowHide 
          isVisible={showLeftPanel}
          onClick={() => setShowLeftPanel(!showLeftPanel)}
        />


<button
  onClick={async () => {
    // Obtener el buffer de audio
    const buffer = await exportPatternToBuffer();
    if (!buffer) return;
    
    // Convertir el AudioBuffer a WAV
    const wavData = bufferToWav(buffer); // Necesitarás una función como esta
    
    // Crear un blob y luego un archivo
    const audioBlob = new Blob([wavData], { type: 'audio/wav' });
    const fileName = `ritmo-${new Date().toISOString()}.wav`;
    const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
    
    // Crear un evento que handleLoadAudio pueda procesar
    const mockEvent = {
      target: {
        files: [audioFile],
        value: ''
      }
    };
    
    // Llamar a handleLoadAudio con este evento simulado
    handleLoadAudio(mockEvent);
  }}
  style={{
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }}
>
  Exportar a Track
</button>
  
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #dee2e6'
        }}>
          <label htmlFor="bpmSelect" style={{ 
            fontWeight: '500',
            whiteSpace: 'nowrap'
          }}>
            <i className="fas fa-tachometer-alt"></i> BPM:
          </label>
          <select
            id="bpmSelect"
            value={BPM}
            onChange={(e) => setBPM(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              fontSize: '16px',
              cursor: 'pointer',
              minWidth: '80px'
            }}
          >
            {Array.from({ length: 211 }, (_, i) => i + 30).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
  
        <TogglePlayPause 
          isPlaying={isPlaying}
          onToggle={togglePlayback}
          size={24}
          playIcon={<i className="fas fa-play"></i>}
          pauseIcon={<i className="fas fa-pause"></i>}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            minWidth: '120px'
          }}
        />
  
          <ControlsIcon 
            onToggle={openControlsModal}
            colorIcon={'white'}
          />
      </div>
      
      {/* Grid principal */}
      <div style={{
        display: 'flex',
        border: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        width: '90vw',
        height: componentHeight + 45,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '180px',
          flexShrink: 0,
          borderRight: '1px solid #dee2e6',
          backgroundColor: '#fff',
          transition: 'all 0.5s ease',
          transform: showLeftPanel ? 'translateX(0)' : 'translateX(-180px)',
          position: showLeftPanel ? 'relative' : 'absolute',
          zIndex: 2,
          left: showLeftPanel ? '0' : '-180px',
          opacity: showLeftPanel ? 1 : 0
        }}>
          <div style={{ 
            height: '45px',
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '500'
          }}>
            Rows
          </div>
          
          <div 
            ref={leftPanelRef}
            style={{ 
              overflowY: 'auto',
              height: componentHeight,
              backgroundColor: '#fff',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
            onScroll={handleLeftPanelScroll}
          >
            <div style={{
              height: cumulativeHeights[rows - 1] + rowHeights[rows - 1],
              position: 'relative'
            }}>
              {renderLeftPanel()}
            </div>
          </div>
        </div>
  
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div
            ref={headerContainerRef}
            style={{
              height: '45px',
              overflowX: 'auto',
              overflowY: 'hidden',
              borderBottom: '1px solid #dee2e6',
              backgroundColor: '#f8f9fa',
              zIndex: 2,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
            onScroll={handleHeaderScroll}
          >
            <div style={{
              width: `${totalGridWidth}px`,
              height: '100%',
              display: 'flex',
              position: 'relative'
            }}>
              {renderTimelineHeaders()}
            </div>
          </div>
  
          <div
            ref={gridContainerRef}
            onScroll={handleGridScroll}  
            style={{
              height: componentHeight,
              overflow: 'auto',
              position: 'relative',
              backgroundColor: '#fff',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            <div
              style={{
                width: `${totalGridWidth}px`,
                height: cumulativeHeights[rows - 1] + rowHeights[rows - 1],
                position: 'relative'
              }}
            >
              {renderGridCells()}
              
              {isPlaying && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${currentStep * cellWidth}px`,
                    top: 0,
                    width: '3px',
                    height: '100%',
                    backgroundColor: '#dc3545',
                    zIndex: 3,
                    pointerEvents: 'none',
                    boxShadow: '0 0 8px rgba(220,53,69,0.5)'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
  
      {/* Estilos globales */}
      <style jsx global>{`
        /* Ocultar scrollbars pero mantener funcionalidad */
        ::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
  
        /* Fuentes de iconos */
        .fas {
          font-size: inherit;
        }
  
        /* Transiciones suaves */
        * {
          transition: background-color 0.2s, opacity 0.2s, transform 0.2s;
        }
  
        /* Mejor selección de texto */
        ::selection {
          background: rgba(0,123,255,0.2);
          color: inherit;
        }
      `}</style>
    </div>
  );
};














const globalSelectedPianoSampleRef = { current: 'piano', duration: 0, durationToUse: 1 };

const getNoteName = (midiNote) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  return `${noteNames[midiNote % 12]}${octave}`;
};

const PIANO_NOTES = Array.from({ length: 88 }, (_, i) => getNoteName(21 + i)).reverse();

export const PianoSequencer = () => {
  // State for sequencer configuration
  const [rows, setRows] = useState(PIANO_KEYS);
  const [selectedCells, setSelectedCells] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [numerator, setNumerator] = useState(4);
  const [denominator, setDenominator] = useState(4);
  const [subdivisionsPerPulse, setSubdivisionsPerPulse] = useState(4);
  const [measures, setMeasures] = useState(1);
  const [measureWidth, setMeasureWidth] = useState(800);
  const [componentHeight, setComponentHeight] = useState(300);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeRows, setActiveRows] = useState(new Set());
  const [selectedPianoSample, setSelectedPianoSample] = useState('piano');
  const [pianoSamples, setPianoSamples] = useState([]);
  const [currentSampleData, setCurrentSampleData] = useState({
    duration: 1,
    durationToUse: 1,
    isLoading: false
  });
  const [audioContextState, setAudioContextState] = useState('suspended');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Refs
  const scheduledSourcesRef = useRef(new Set());
  const animationRef = useRef(null);
  const currentStepRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const gridContainerRef = useRef(null);
  const indicatorRef = useRef(null);

  // Derived values
  const totalStepsPerMeasure = numerator * subdivisionsPerPulse;
  const totalSteps = measures * totalStepsPerMeasure;
  const cellWidth = measureWidth / totalStepsPerMeasure;
  const rowHeight = componentHeight / rows;
  const is88KeyMode = rows === 88;

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
      globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContextState(globalAudioContextRef.current.state);
      
      globalAudioContextRef.current.onstatechange = () => {
        setAudioContextState(globalAudioContextRef.current.state);
      };
    }
  }, []);

  // Load piano samples
  const loadPianoSamples = useCallback(async () => {
    if (pianoSamples.length === 0) return;

    try {
      const sample = pianoSamples.find(s => s.id === selectedPianoSample) || pianoSamples[0];
      if (!sample) return;

      if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') {
        globalAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const response = await fetch(sample.path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await globalAudioContextRef.current.decodeAudioData(arrayBuffer);
      
      globalBuffersRef.current.set('pianoSample', {
        buffer: audioBuffer,
        baseFreq: sample.baseFreq
      });

      const calculatedDuration = Math.max(0.1, audioBuffer.duration);
      const safeDuration = Math.min(calculatedDuration, 10);
      
      setCurrentSampleData({
        duration: safeDuration,
        durationToUse: Math.min(globalSelectedPianoSampleRef.durationToUse || safeDuration, safeDuration),
        isLoading: false
      });
      
      globalSelectedPianoSampleRef.current = selectedPianoSample;
      globalSelectedPianoSampleRef.duration = safeDuration;
      globalSelectedPianoSampleRef.durationToUse = Math.min(globalSelectedPianoSampleRef.durationToUse || safeDuration, safeDuration);
    } catch (error) {
      console.error('Error loading piano sample:', error);
      setCurrentSampleData({
        duration: 1,
        durationToUse: 1,
        isLoading: false
      });
    }
  }, [selectedPianoSample, pianoSamples]);

  // Play sound
  const playSound = useCallback((note, time, rowIndex) => {
    if (!globalAudioContextRef.current || globalAudioContextRef.current.state === 'closed') return;

    setActiveRows(prev => {
      const newSet = new Set(prev);
      newSet.add(rowIndex);
      return newSet;
    });
    
    setTimeout(() => {
      setActiveRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(rowIndex);
        return newSet;
      });
    }, 200);

    const pianoSample = globalBuffersRef.current.get('pianoSample');
    if (pianoSample) {
      const source = globalAudioContextRef.current.createBufferSource();
      source.buffer = pianoSample.buffer;
      const noteFreq = getNoteFrequency(note);
      const playbackRate = noteFreq / pianoSample.baseFreq;
      source.playbackRate.value = playbackRate;

      const gainNode = globalAudioContextRef.current.createGain();
      gainNode.gain.setValueAtTime(0.8, time);

      const userDuration = globalSelectedPianoSampleRef.durationToUse;
      const effectiveDuration = Math.min(
        userDuration / playbackRate,
        pianoSample.buffer.duration / playbackRate
      );

      const fadeOutDuration = Math.min(0.1, effectiveDuration * 0.1);
      const fadeOutStartTime = time + effectiveDuration - fadeOutDuration;

      gainNode.gain.exponentialRampToValueAtTime(0.001, fadeOutStartTime + fadeOutDuration);

      source.connect(gainNode);
      gainNode.connect(globalAudioContextRef.current.destination);
      
      source.start(time);
      source.stop(time + effectiveDuration + fadeOutDuration);
      
      scheduledSourcesRef.current.add(source);
    }
  }, []);

  const getNoteFrequency = (note) => {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = parseInt(note.slice(-1));
    const key = note.slice(0, -1).replace("#", "#");
    const index = notes.indexOf(key);
    return 440 * Math.pow(2, (octave - 4) + (index - 9) / 12);
  };

  // Stop playback
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
    setIsPlaying(false);
    lastFrameTimeRef.current = 0;
  }, []);

  // Start playback
  const startPlayback = useCallback(async (autoScroll) => {
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
      setIsPlaying(true);
      lastFrameTimeRef.current = performance.now();

      const scheduler = () => {
        if (!isPlaying) return;
      
        const currentTime = globalAudioContextRef.current.currentTime;
        const elapsedTime = currentTime - startTimeRef.current;
        const stepsPerSecond = (bpmRef.current * subdivisionsPerPulse) / 60;
        const totalSteps = measures * numerator * subdivisionsPerPulse;
        const cellWidth = measureWidth / (numerator * subdivisionsPerPulse);
        
        const newStep = Math.floor(elapsedTime * stepsPerSecond) % totalSteps;
        setCurrentStep(newStep);
        
        if (indicatorRef.current) {
          const posX = newStep * cellWidth;
          indicatorRef.current.style.transform = `translateX(${posX}px)`;
          
          if (autoScroll && gridContainerRef.current) {
            const container = gridContainerRef.current;
            const containerWidth = container.clientWidth;
            const scrollLeft = posX - (containerWidth / 2) + (cellWidth / 2);
            //const maxScroll = container.scrollWidth - containerWidth;
            const maxScroll = totalGridWidth - gridContainerRef.current.clientWidth + 1000; // +10px de margen
            const boundedScroll = Math.max(0, Math.min(scrollLeft, maxScroll));
            
            container.scrollTo({ 
              left: boundedScroll,
              behavior: 'smooth' 
            });
          }
        }
      
        const currentStepDuration = (60 / BPM) / subdivisionsPerPulse;
        
        while (nextStepTimeRef.current < currentTime + 0.1) {
          const stepIndex = Math.floor(
            ((nextStepTimeRef.current - startTimeRef.current) * stepsPerSecond) % totalSteps
          );
          
          const activeNotes = [];
          selectedCells.forEach(cellId => {
            const [rowIndex, cellStep] = cellId.split('-').map(Number);
            if (cellStep === stepIndex && rowIndex < rows) {
              activeNotes.push(PIANO_NOTES[rowIndex]);
            }
          });
          
          if (activeNotes.length > 0) {
            activeNotes.forEach(note => {
              playSound(note, nextStepTimeRef.current, PIANO_NOTES.indexOf(note));
            });
          }
          
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
  }, [stopPlayback, isPlaying, subdivisionsPerPulse, measures, numerator, selectedCells, rows, playSound]);

  // Toggle playback
  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      stopPlayback();
      setIsPlaying(false);
    } else {
      await startPlayback(autoScroll);
    }
  }, [startPlayback, stopPlayback, isPlaying, autoScroll]);

  // Handle cell click
  const handleCellClick = (rowIndex, stepIndex) => {
    const cellId = `${rowIndex}-${stepIndex}`;
    setSelectedCells(prev => {
      const newSet = new Set(prev);
      newSet.has(cellId) ? newSet.delete(cellId) : newSet.add(cellId);
      return newSet;
    });
    
    initAudioContext();
    const noteName = PIANO_NOTES[rowIndex];
    playSound(noteName, globalAudioContextRef.current.currentTime + 0.05, rowIndex);
  };

  // Handle duration change
  const handleDurationChange = (value) => {
    const newValue = parseFloat(value);
    const clampedValue = Math.max(0.1, Math.min(currentSampleData.duration, newValue));
    
    setCurrentSampleData(prev => ({
      ...prev,
      durationToUse: clampedValue
    }));
    
    globalSelectedPianoSampleRef.durationToUse = clampedValue;
  };

  // Handle sample preview
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

  // Check if key is black
  const isBlackKey = (note) => note.includes('#');

  // Get octave groups for 88-key piano
  const octaveGroups = useMemo(() => {
    if (!is88KeyMode) return [];
    const groups = [];
    let groupStart = 0;
    for (let i = 0; i < rows; i++) {
      const note = PIANO_NOTES[i];
      if (i > 0 && note.startsWith('B') && note[1] !== '#') {
        groups.push({
          start: groupStart,
          end: i - 1,
          span: i - groupStart,
          label: PIANO_NOTES[groupStart]
        });
        groupStart = i;
      }
    }
    groups.push({
      start: groupStart,
      end: rows - 1,
      span: rows - groupStart,
      label: PIANO_NOTES[groupStart]
    });
    return groups;
  }, [is88KeyMode, rows]);

  // Get effective heights for octave groups
  const octaveGroupEffectiveHeights = useMemo(() => {
    if (!is88KeyMode) return [];
    return octaveGroups.map((group) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      return group.span * rowHeight;
    });
  }, [is88KeyMode, octaveGroups, rowHeight]);

  // Get positions for octave groups
  const octaveGroupPositions = useMemo(() => {
    if (!is88KeyMode) return [];
    let accum = 0;
    return octaveGroupEffectiveHeights.map((height) => {
      const pos = accum;
      accum += height;
      return pos;
    });
  }, [is88KeyMode, octaveGroupEffectiveHeights]);

  // Render left panel for 88-key piano
  const render88LeftPanel = () => {
    return octaveGroups.map((group, groupIndex) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const containerHeight = octaveGroupEffectiveHeights[groupIndex];
      const isGroupActive = groupRows.some(r => activeRows.has(r));
      
      const octaveNum = parseInt(group.label.match(/\d+/)[0]);
      const isOctave0 = octaveNum === 0;
      const isOctave8 = octaveNum === 8;
  
      const whiteKeys = 
        isOctave0 ? ['A', 'B'] :
        isOctave8 ? ['C'] :
        ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  
      const whiteKeyHeight = containerHeight / whiteKeys.length;
  
      const blackKeysConfig = [
        isOctave0 && { 
          note: 'A#', 
          whiteRef: 'A', 
          offset: 0.9, 
          width: '35%' 
        },
        !isOctave0 && !isOctave8 && [
          { note: 'C#', whiteRef: 'C', offset: 0.9, width: '35%' },
          { note: 'D#', whiteRef: 'D', offset: 1.15, width: '35%' },
          { note: 'F#', whiteRef: 'F', offset: 0.9, width: '35%' },
          { note: 'G#', whiteRef: 'G', offset: 1.1, width: '35%' },
          { note: 'A#', whiteRef: 'A', offset: 1.1, width: '35%' }
        ]
      ].flat().filter(Boolean);
  
      return (
        <div
          key={`octave-group-${groupIndex}`}
          style={{
            height: `${containerHeight}px`,
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid #ddd',
            backgroundColor: isGroupActive ? 'rgba(76, 175, 80, 0.15)' : '#f5f5f5',
          }}
        >
          {whiteKeys.map((note, i) => {
            const fullNote = `${note}${octaveNum}`;
            const rowIndex = PIANO_NOTES.findIndex(n => n === fullNote);
            const isActive = activeRows.has(rowIndex);
  
            return (
              <div
                key={`white-${groupIndex}-${i}`}
                style={{
                  position: 'absolute',
                  bottom: `${i * whiteKeyHeight}px`,
                  left: 0,
                  width: '100%',
                  height: `${whiteKeyHeight}px`,
                  backgroundColor: isActive ? 'rgba(76, 175, 80, 0.7)' : '#fff',
                  borderTop: '1px solid black',
                  zIndex: 1,
                  transition: 'background-color 0.1s ease-out'
                }}
              >
                <div style={{
                  position: 'absolute',
                  right: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '10px',
                  color: isActive ? '#fff' : '#000',
                  zIndex: 3,
                  pointerEvents: 'none'
                }}>
                  {fullNote}
                </div>
              </div>
            );
          })}
  
          {blackKeysConfig.map((blackKey, i) => {
            const pos = whiteKeys.indexOf(blackKey.whiteRef);
            if (pos === -1) return null;
            
            const fullNote = `${blackKey.note}${octaveNum}`;
            const rowIndex = PIANO_NOTES.findIndex(n => n === fullNote);
            const isActive = activeRows.has(rowIndex);
  
            return (
              <div
                key={`black-${groupIndex}-${i}`}
                style={{
                  position: 'absolute',
                  bottom: `${(pos + blackKey.offset) * whiteKeyHeight - (whiteKeyHeight * 0.2)}px`,
                  left: '0',
                  width: blackKey.width,
                  height: `${whiteKeyHeight * 0.6}px`,
                  backgroundColor: isActive ? 'rgba(76, 175, 80, 0.9)' : '#000',
                  zIndex: 2,
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.6)',
                  borderRadius: '4px',
                  borderRight: '1px solid #333',
                  transition: 'background-color 0.1s ease-out'
                }}
              >
                <div style={{
                  position: 'absolute',
                  right: '4px',
                  top: '2px',
                  color: isActive ? '#000' : '#fff',
                  fontSize: '10px',
                  textShadow: isActive ? 'none' : '0 1px 1px #000',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}>
                  {fullNote}
                </div>
              </div>
            );
          })}
  
          <div style={{ 
            position: 'absolute',
            top: '2px',
            left: '4px',
            fontSize: '10px',
            fontWeight: 'bold',
            color: isGroupActive ? '#2d572c' : '#666',
            zIndex: 2
          }}>
            {group.label} {isGroupActive && '•'}
          </div>
        </div>
      );
    });
  };

  // Render grid cells for 88-key piano
  const render88GridCells = () => {
    const cells = [];
    octaveGroups.forEach((group, groupIndex) => {
      const groupRows = Array.from({ length: group.span }, (_, i) => group.start + i);
      const groupTop = octaveGroupPositions[groupIndex];
      
      groupRows.forEach((rowIndex, i) => {
        const rowTop = groupTop + i * rowHeight;
        for (let stepIndex = 0; stepIndex < totalSteps; stepIndex++) {
          const cellId = `${rowIndex}-${stepIndex}`;
          const isActive = selectedCells.has(cellId);
          const cellBgColor = isActive
            ? 'rgba(76, 175, 80, 0.8)'
            : isBlackKey(PIANO_NOTES[rowIndex])
                ? 'rgba(34, 34, 34, 0.7)'
                : '#f9f9f9';
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
              {isActive && (
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
                  {PIANO_NOTES[rowIndex]}
                </div>
              )}
            </div>
          );
        }
      });
    });
    return cells;
  };

  // Render timeline headers
  const renderTimelineHeaders = () => {
    return Array.from({ length: totalSteps }).map((_, stepIndex) => {
      const localStep = stepIndex % totalStepsPerMeasure;
      const measureLabel = localStep === 0 ? Math.floor(stepIndex / totalStepsPerMeasure) + 1 : "";
      const pulseLabel = localStep % subdivisionsPerPulse === 0 ? Math.floor(localStep / subdivisionsPerPulse) + 1 : "";
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
    });
  };

  // Open controls modal
  const openControlsModal = () => {
    setModalContent(
      <div style={{ padding: '20px', width: '70vw' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '10px' }}>
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
                />
                <CustomNumberInput
                  min={0.10}
                  max={Number(currentSampleData.duration.toFixed(2))}
                  step={0.01}
                  value={Number(currentSampleData.durationToUse.toFixed(2))}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

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
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Subdivisions:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
    setModalOpen(true);
  };

  // Fetch piano samples on mount
  useEffect(() => {
    async function fetchSamples() {
      try {
        const response = await fetch('/api/blackBlaze/listAllPublicSamples');
        if (!response.ok) throw new Error(`Error en fetch: ${response.statusText}`);
        
        const data = await response.json();
        const publicSamples = [];

        Object.entries(data.groups).forEach(([folder, filesArray]) => {
          if (folder.startsWith('publicSamples')) {
            filesArray.forEach(file => {
              const parts = file.fileName.split('/');
              const filename = parts[parts.length - 1];
              const id = filename.split('.')[0];
              
              publicSamples.push({
                id,
                name: filename,
                path: file.signedUrl,
                baseFreq: 440,
              });
            });
          }
        });

        if (publicSamples.length > 0) {
          setSelectedPianoSample(publicSamples[0].id);
        }

        setPianoSamples(publicSamples);
      } catch (error) {
        console.error("Error al obtener samples públicos:", error);
      }
    }

    fetchSamples();
  }, []);

  // Load samples when selected sample changes
  useEffect(() => {
    if (pianoSamples.length > 0) {
      loadPianoSamples();
    }
  }, [selectedPianoSample, pianoSamples, loadPianoSamples]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
      if (globalAudioContextRef.current) globalAudioContextRef.current.close();
    };
  }, [stopPlayback]);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      paddingLeft: '5px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {modalContent}
      </Modal>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
        <button
          onClick={() => setShowLeftPanel(!showLeftPanel)}
          style={{
            padding: '8px 16px',
            backgroundColor: showLeftPanel ? '#ff4444' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showLeftPanel ? '◄ Hide Left Panel' : '► Show Left Panel'}
        </button>

        <TogglePlayPause 
          size={20}
          isPlaying={isPlaying}
          onToggle={togglePlayback}
        />

        <button
          onClick={openControlsModal}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Controls
        </button>
      </div>
      
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
          <div style={{ width: '60px', flexShrink: 0, boxSizing: 'border-box' }}>
            <div style={{ height: '45px', boxSizing: 'border-box' }}></div>
            {render88LeftPanel()}
          </div>
        )}

        <div
          style={{
            width: showLeftPanel ? `${measureWidth - 60}px` : `${measureWidth}px`,
            overflowX: 'auto',
            position: 'relative',
            scrollBehavior: 'auto',
            boxSizing: 'border-box'
          }}
          ref={gridContainerRef}
        >
          <div style={{ width: `${totalSteps * cellWidth}px`, boxSizing: 'border-box' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${totalSteps}, ${cellWidth}px)`,
                gridTemplateRows: '15px 15px 15px',
                height: '45px',
                boxSizing: 'border-box'
              }}
            >
              {renderTimelineHeaders()}
            </div>

            <div
              style={{
                position: 'relative',
                height: octaveGroupPositions.slice(-1)[0] + octaveGroupEffectiveHeights.slice(-1)[0],
                boxSizing: 'border-box'
              }}
            >
              {render88GridCells()}
              <div
                ref={indicatorRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '2px',
                  height: '100%',
                  backgroundColor: 'red',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


























































