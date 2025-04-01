import React, { useState, useEffect, useRef, useCallback } from "react";
import TogglePlayPause from "../../../components/complex/TogglePlayPause";
import RecordIcon from "../../../components/complex/recordIcon";
import StopIcon from "../../../components/complex/stopIcon";
import EditToggleIcon from "../../../components/complex/EditToggleIcon ";
import RangeInput from "../../../components/complex/rangeInput";
import DownloadIcon from "../../../components/complex/downloadIcon";
import ToggleMute from "../../../components/complex/ToggleMute";
import PanIcon from "../../../components/complex/panIcon";
import ToggleSolo from "../../../components/complex/toggleSolo";
import TrashIcon from "../../../components/complex/trashIcon";
import ResponsiveContent from "../../../components/complex/responsiveContent";
import { formatTime } from "./audioUtils";
import { restartTracks, createFilterNode, handleStop } from "./audioHandlers";
import ColorPickerModalContent from "@/components/complex/colorPicker";
import SingleColorPickerModalContent from "@/components/complex/singleColorPickerModalContent";
import Knob from "@/components/complex/knob";
import MenuIcon from "@/components/complex/menuIcon";
import ControlsIcon from "@/components/complex/controlsIcon";
'../../../estilos/general/general.css'





/*export const reconnectAudioChain = (track) => {
  const ctx = track.audioContext; // Asegúrate de que track tenga referencia al AudioContext
  if (!ctx || !track.sourceNode) return;

  // Guardar el estado de reproducción y el tiempo actual
  const wasPlaying = track.isPlaying;
  const currentTime = ctx.currentTime - track.startTime;

  // Detener y desconectar el nodo actual
  track.sourceNode.stop();
  track.sourceNode.disconnect();

  // Crear nuevo sourceNode
  track.sourceNode = ctx.createBufferSource();
  track.sourceNode.buffer = track.audioBuffer;

  // Reconectar la cadena con los filtros actualizados
  let lastNode = track.sourceNode;

  track.filters?.forEach((filter) => {
    if (!filter.node) {
      filter.node = createFilterNode(ctx, filter);
    }
    lastNode.connect(filter.node);
    lastNode = filter.node;
  });

  // Conectar al gainNode y pannerNode
  lastNode.connect(track.gainNode).connect(track.pannerNode);

  // Reanudar la reproducción si estaba activa
  if (wasPlaying) {
    const startOffset = Math.max(currentTime, 0);
    track.sourceNode.start(ctx.currentTime, startOffset);
    track.isPlaying = true;
  }
};*/


export const TrackControls = React.memo(({
  track,
  showContent,
  onAction,
  setIsPlaying,
  filterNodesRef,
  updateTrackColor,
  tracks,
  setTracks,
  audioNodesRef,
  onClose,
  openModal,
  audioContextRef
}) => {
  if (!track) return null; // Al inicio del componente

  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [minutes, setMinutes] = useState(Math.floor((track.startTime || 0) / 60));
  const [seconds, setSeconds] = useState(Math.floor((track.startTime || 0) % 60));
  const [milliseconds, setMilliseconds] = useState(
    Math.round(((track.startTime || 0) - Math.floor(track.startTime || 0)) * 1000
  ));

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterParams, setFilterParams] = useState({});

  // Handlers optimizados con useCallback
  const handleVolumeChange = useCallback(
    (val) => onAction("volume", track.id, setTracks, audioNodesRef, tracks, val),
    [onAction, track.id, setTracks, audioNodesRef, tracks]
  );

  const handlePanChange = useCallback(
    (val) => onAction("pan", track.id, setTracks, audioNodesRef, tracks, val),
    [onAction, track.id, setTracks, audioNodesRef, tracks]
  );

  const handleToggleMute = useCallback(
    () => onAction("mute", track.id, setTracks, audioNodesRef, tracks, !track.muted),
    [onAction, track.id, setTracks, audioNodesRef, tracks, track.muted]
  );

  const handleResetPan = useCallback(
    () => onAction("pan", track.id, setTracks, audioNodesRef, tracks, 0),
    [onAction, track.id, setTracks, audioNodesRef, tracks]
  );

  const handleToggleSolo = useCallback(
    () => onAction("solo", track.id, setTracks, audioNodesRef, tracks),
    [onAction, track.id, setTracks, audioNodesRef, tracks]
  );

  const handleDeleteTrack = useCallback(
    () => {
      onAction("delete", track.id, setTracks, audioNodesRef, tracks);
      onClose();
    },
    [onAction, track.id, setTracks, audioNodesRef, tracks, onClose]
  );

  const formatTime = (mins, secs, ms) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const handleManualChange = (setter, max) => (e) => {
    const value = e.target.value.replace(/^0+/, '');
    const numValue = parseInt(value || 0);

    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, 0), max);
      setter(clampedValue);
    }
  };

  const calculateTotalMilliseconds = (mins, secs, ms) => {
    return mins * 60000 + secs * 1000 + ms;
  };

  const handleSetStartTime = () => {
    const startTime = calculateTotalMilliseconds(minutes, seconds, milliseconds) / 1000;
    onAction("setStartTime", track.id, setTracks, audioNodesRef, tracks, startTime);
    setShowStartTimeModal(false);
  };

  const handleAddFilter = () => {
    if (!selectedFilter) return;
    
    const newFilter = {
      type: selectedFilter,
      params: filterParams,
      node: null
    };
    
    onAction("addFilter", track.id, setTracks, audioNodesRef, tracks, newFilter);
    setShowFilterModal(false);
    onAction("redrawWaveform", track.id, setTracks, audioNodesRef, tracks);
    setIsPlaying(false);
  };

  const handleRemoveFilter = (index) => {
    onAction("removeFilter", track.id, setTracks, audioNodesRef, tracks, index);
    
    if (filterNodesRef.current[track.id]?.[index]) {
      filterNodesRef.current[track.id][index].disconnect();
      filterNodesRef.current[track.id].splice(index, 1);
    }
    
    onAction("redrawWaveform", track.id, setTracks, audioNodesRef, tracks);
    setIsPlaying(false);
  };
  
  const handleUpdateFilter = (index, newParams) => {
    onAction("updateFilter", track.id, setTracks, audioNodesRef, tracks, { index, newParams });
  };

  const handleColorUpdate = (newColor) => {
    updateTrackColor(track.id, newColor);
    onClose();
  };

  return (
    <div className="track-controls">
      <ResponsiveContent showContent={showContent}>
        


        <div style={{textAlign: 'center', display: 'flex', justifyContent: 'space-around'}}>
          <button onClick={() => setShowStartTimeModal(true)}>Set Start Time</button>
          <button onClick={() => setShowFilterModal(true)}>Add Filter</button>
        </div>
        <div style={{textAlign: 'center', display: 'flex', justifyContent: 'space-around', padding: '10px'}}>
          <ToggleSolo size={30} isSolo={track.solo} onToggle={handleToggleSolo} />
          <button 
            onClick={() => openModal( track.id, 'SingleColorPickerModalContent')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px', 
              padding: '0px'
            }}
          >
            🎨
          </button>
          <TrashIcon size={30} onClick={handleDeleteTrack} />
        </div>
        <div style={{textAlign: 'center', display: 'flex', justifyContent: 'space-between'}}>
          <Knob
            title={'Volume'}
            size={110}
            value={track.volume}
            min={0}
            max={100}
            onChange={handleVolumeChange}
            children={<ToggleMute isMuted={track.muted} size={30} onToggle={handleToggleMute} />}
          />

          <Knob
            title={'Pannigg'}
            size={110}
            value={track.panning}
            min={-50}
            max={50}
            onChange={handlePanChange}
            children={<PanIcon panValue={track.panning} size={30} onClick={handleResetPan} />}
          />
        </div>

        

        {track.filters?.map((filter, index) => (
          <div key={index} className="filter-item">
            <span>{filter.type}</span>
            <button onClick={() => handleRemoveFilter(index)}>×</button>
          </div>
        ))}
      </ResponsiveContent>

      {showStartTimeModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Set Start Time for {track.name}</h3>

            <div>
              <label>Minutes: </label>
              <input
                type="text"
                value={minutes === 0 ? '0' : minutes.toString().replace(/^0+/, '')}
                onChange={handleManualChange(setMinutes, 59)}
                maxLength="2"
                style={{border: 'none', padding: '5px'}}
                className="borderRadius1"
              />
              <RangeInput
                value={minutes}
                onChange={(val) => setMinutes(val)}
                min="0"
                max="59"
              />
            </div>

            <div>
              <label>Seconds: </label>
              <input
                type="text"
                value={seconds === 0 ? '0' : seconds.toString().replace(/^0+/, '')}
                onChange={handleManualChange(setSeconds, 59)}
                maxLength="2"
                style={{border: 'none', padding: '5px'}}
                className="borderRadius1"
              />
              <RangeInput
                value={seconds}
                onChange={(val) => setSeconds(val)}
                min="0"
                max="59"
              />
            </div>

            <div>
              <label>Milliseconds: </label>
              <input
                type="text"
                value={milliseconds === 0 ? '0' : milliseconds.toString().replace(/^0+/, '')}
                onChange={handleManualChange(setMilliseconds, 999)}
                maxLength="3"
                className="borderRadius1"
                style={{border: 'none', padding: '5px'}}
              />
              <RangeInput
                value={milliseconds}
                onChange={(val) => setMilliseconds(val)}
                min="0"
                max="999"
              />
            </div>

            <div>
              <label>Final Time: </label>
              <input
                type="text"
                value={formatTime(minutes, seconds, milliseconds)}
                readOnly
                style={{border: 'none', padding: '5px'}}
                className="borderRadius1"
              />
            </div>
            <div style={{padding: '20px', textAlign: 'center', display: 'flex', justifyContent: 'space-around' }}>
              <div className="borderRadius1 backgroundColor3" style={{width: 'min-content', padding: '10px'}} onClick={handleSetStartTime}>Accept</div>
              <div className="borderRadius1 backgroundColor3" style={{width: 'min-content', padding: '10px'}} onClick={() => setShowStartTimeModal(false)}>Cancel</div>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Audio Filter</h3>
            
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="">Select Filter</option>
              <option value="lowpass">Lowpass</option>
              <option value="highpass">Highpass</option>
              <option value="bandpass">Bandpass</option>
              <option value="notch">Notch</option>
              <option value="delay">Delay</option>
              <option value="compressor">Compressor</option>
            </select>

            {selectedFilter === "lowpass" && (
              <div>
                <label>Frequency (Hz): 
                  <input 
                    type="range" 
                    min="20" 
                    max="20000" 
                    step="10"
                    value={filterParams.frequency || 20000}
                    onChange={(e) => setFilterParams({...filterParams, frequency: e.target.value})}
                  />
                </label>
                <label>Q: 
                  <input 
                    type="range" 
                    min="0.1" 
                    max="10" 
                    step="0.1"
                    value={filterParams.Q || 1}
                    onChange={(e) => setFilterParams({...filterParams, Q: e.target.value})}
                  />
                </label>
              </div>
            )}

            <button onClick={handleAddFilter}>Apply</button>
            <button onClick={() => setShowFilterModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
});




export const GlobalControls = ({
  isPlaying,
  isRecording,
  currentTime,
  onPlayPause,
  onStop,
  onRecord,
  onDownload,
  onToggleUI,
  onLoadAudio,
  onShowColorPicker,
  toggleMenu,
  openModal
}) => {
  return (
    <div className="global-controls backgroundColor2 color2">
      <div style={{display: 'flex'}}>
        <TogglePlayPause isPlaying={isPlaying} onToggle={onPlayPause} />
        <StopIcon onClick={onStop} />
        <RecordIcon isRecording={isRecording} onClick={onRecord} />
      </div>

      <div style={{display: 'flex'}}>
        <DownloadIcon onToggle={onDownload} />
        <div className="backgroundColor2" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Hidden audio file input */}
          <input
            type="file"
            accept="audio/*"  // Only accepts audio files
            onChange={onLoadAudio}
            style={{ display: "none" }}
            id="audio-upload"

          />
          
          {/* Audio upload label */}
          <label 
            htmlFor="audio-upload" 
            style={{ 
              cursor: "pointer",
              padding: "8px 16px",
              
              color: "white",
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "0.875rem",
              textTransform: "uppercase",
              '&:hover': {
                backgroundColor: "red"
              }
            }}
          >
            Select Audio File
          </label>
          <ControlsIcon size={30} onToggle={openModal}/>
        </div>
      </div>
      <MenuIcon className="backgroundColor2" size={30} onClick={toggleMenu} style={{color: "white"}}/>
      <div className="time-display">
        {formatTime(currentTime)}
      </div>
      {/* Botón del menú */}
      
    </div>
  );
};


