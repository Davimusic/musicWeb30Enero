import React, { useState, useEffect, useRef } from "react";
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


export const reconnectAudioChain = (track) => {
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
};

export const TrackControls = ({ track, showContent, onAction, setIsPlaying, filterNodesRef, insertModalContentAndShow, setIsModalOpen, setTracks, tracks, audioNodesRef }) => {
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [minutes, setMinutes] = useState(Math.floor((track.startTime || 0) / 60));
  const [seconds, setSeconds] = useState(Math.floor((track.startTime || 0) % 60));
  const [milliseconds, setMilliseconds] = useState(
    Math.round(((track.startTime || 0) - Math.floor(track.startTime || 0)) * 1000
  ));

  console.log(audioNodesRef);
  

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterParams, setFilterParams] = useState({});

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
    onAction("updateFilter", track.id, setTracks, audioNodesRef, tracks, index, newParams);
  };

  return (
    <div className="track-controls">
      <ResponsiveContent showContent={showContent}>
        <button 
          onClick={() => insertModalContentAndShow(
            setIsModalOpen, 
            <SingleColorPickerModalContent 
              initialColor={track.backgroundColorTrack} 
              onClose={() => setIsModalOpen(false)} 
              onColorUpdate={(newColor) => onAction("updateColor", track.id, setTracks, audioNodesRef, tracks, newColor)} 
            />
          )}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          🎨                             
        </button>
        <div className="track-header">
          <button onClick={() => setShowStartTimeModal(true)}>Set Start Time</button>
          <button onClick={() => setShowFilterModal(true)}>Add Filter</button>

          <ToggleSolo onToggle={() => onAction("solo", track.id, setTracks, audioNodesRef, tracks)} />
          <TrashIcon onClick={() => onAction("delete", track.id, setTracks, audioNodesRef, tracks)} />
        </div>

        <Knob
  size={90}
  accentColor="#4CAF50"
  baseColor="#3A3A3A"
  value={track.volume}
  min={0}
  max={100}
  onChange={(val) =>  onAction("volume", track.id, setTracks, audioNodesRef, tracks, val)}
  children={<ToggleMute 
    onToggle={() => onAction("mute", track.id, setTracks, audioNodesRef, tracks, !track.muted)}
  />}
/>

<Knob
  size={90}
  accentColor="#2196F3"
  baseColor="#3A3A3A"
  value={track.panning}
  min={-50}
  max={50}
  onChange={(val) => onAction("pan", track.id, setTracks, audioNodesRef, tracks, val)}
  children={<PanIcon panValue={track.panning} size={30} onClick={() => onAction("pan", track.id, setTracks, audioNodesRef, tracks, 0)}
  />}
/>
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
              <label>Minutos: </label>
              <input
                type="text"
                value={minutes === 0 ? '0' : minutes.toString().replace(/^0+/, '')}
                onChange={handleManualChange(setMinutes, 59)}
                maxLength="2"
              />
              <RangeInput
                value={minutes}
                onChange={(val) => setMinutes(val)}
                min="0"
                max="59"
              />
            </div>

            <div>
              <label>Segundos: </label>
              <input
                type="text"
                value={seconds === 0 ? '0' : seconds.toString().replace(/^0+/, '')}
                onChange={handleManualChange(setSeconds, 59)}
                maxLength="2"
              />
              <RangeInput
                value={seconds}
                onChange={(val) => setSeconds(val)}
                min="0"
                max="59"
              />
            </div>

            <div>
              <label>Milisegundos: </label>
              <input
                type="text"
                value={milliseconds === 0 ? '0' : milliseconds.toString().replace(/^0+/, '')}
                onChange={handleManualChange(setMilliseconds, 999)}
                maxLength="3"
              />
              <RangeInput
                value={milliseconds}
                onChange={(val) => setMilliseconds(val)}
                min="0"
                max="999"
              />
            </div>

            <div>
              <label>Tiempo final: </label>
              <input
                type="text"
                value={formatTime(minutes, seconds, milliseconds)}
                readOnly
              />
            </div>

            <button onClick={handleSetStartTime}>Aceptar</button>
            <button onClick={() => setShowStartTimeModal(false)}>Cancelar</button>
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
};

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
  setIsModalOpen,
  insertModalContentAndShow
}) => (

  <div className="global-controls">
    <TogglePlayPause isPlaying={isPlaying} onToggle={onPlayPause} />
    <StopIcon onClick={onStop} />
    <RecordIcon isRecording={isRecording} onClick={onRecord} />
    <DownloadIcon onToggle={onDownload} />
    <EditToggleIcon size={30} onToggle={onToggleUI} />
    <input
      type="file"
      accept="audio/*"
      onChange={onLoadAudio}
      style={{ display: "none" }}
      id="audio-upload"
    />
    <label htmlFor="audio-upload" className="current-time-display">
      Cargar Audio
    </label>
    <button onClick={()=>insertModalContentAndShow(setIsModalOpen, <ColorPickerModalContent onClose={() => setIsModalOpen(false)} />)}>x</button>
    <div className="current-time-display">{formatTime(currentTime)}</div>
  </div>
);