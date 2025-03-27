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

export const TrackControls = ({ track, showContent, onAction, audioContextRef, tracks, setIsPlaying, filterNodesRef, isPlayingRef, currentTime, startTimeRef, setCurrentTime, scrollContainerRef }) => {
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [minutes, setMinutes] = useState(Math.floor((track.startTime || 0) / 60)); // Minutos
  const [seconds, setSeconds] = useState(Math.floor((track.startTime || 0) % 60)); // Segundos
  const [milliseconds, setMilliseconds] = useState(
    Math.round(((track.startTime || 0) - Math.floor(track.startTime || 0)) * 1000
  ));

  // Nuevo estado para el modal de filtros
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [filterParams, setFilterParams] = useState({});


  
  
  

  // Función para formatear el tiempo final (solo lectura)
  const formatTime = (mins, secs, ms) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  

  // Función para manejar cambios en los inputs manuales (sin padding)
  const handleManualChange = (setter, max) => (e) => {
    const value = e.target.value.replace(/^0+/, ''); // Eliminar ceros iniciales
    const numValue = parseInt(value || 0);

    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, 0), max);
      setter(clampedValue);
    }
  };

  // Función para calcular el tiempo total en milisegundos
  const calculateTotalMilliseconds = (mins, secs, ms) => {
    return mins * 60000 + secs * 1000 + ms;
  };

  // Manejar el envío del tiempo de inicio
  const handleSetStartTime = () => {
    const startTime = calculateTotalMilliseconds(minutes, seconds, milliseconds) / 1000; // Convertir a segundos
    onAction("setStartTime", track.id, startTime); // Envía la acción al padre
    setShowStartTimeModal(false); // Cierra el modal
  };

  // Manejar la adición de un filtro
  const handleAddFilter = () => {
    if (!selectedFilter) return;
    
    const newFilter = {
      type: selectedFilter,
      params: filterParams,
      node: null  // Se creará al reproducir
    };
    
    onAction("addFilter", track.id, newFilter);
    setShowFilterModal(false);

    // Forzar la actualización de la forma de onda
    onAction("redrawWaveform", track.id);
    setIsPlaying(false)
    //handleStop(setIsPlaying, setCurrentTime, tracks, scrollContainerRef, filterNodesRef)
    //restartTracks(audioContextRef, tracks, currentTime, setIsPlaying, isPlayingRef, startTimeRef, filterNodesRef, setCurrentTime, scrollContainerRef);
  };

  const handleRemoveFilter = (index) => {
    // Eliminar el filtro del estado
    onAction("removeFilter", track.id, index);
    
    // Limpiar la referencia del nodo de filtro
    if (filterNodesRef.current[track.id]?.[index]) {
      filterNodesRef.current[track.id][index].disconnect();
      filterNodesRef.current[track.id].splice(index, 1);
    }
    
    // Forzar actualización
    onAction("redrawWaveform", track.id);
    setIsPlaying(false)
    //restartTracks(audioContextRef, tracks, currentTime, setIsPlaying, isPlayingRef, startTimeRef, filterNodesRef, setCurrentTime, scrollContainerRef);
  };
  
  // Ejemplo para actualizar parámetros de un filtro existente
  const handleUpdateFilter = (index, newParams) => {
    const updatedFilters = track.filters.map((filter, i) =>
      i === index ? { ...filter, params: newParams } : filter
    );
    onAction("updateFilter", track.id, index, newParams);
  };

  

  return (
    <div className="track-controls">
      <ResponsiveContent showContent={showContent}>
        <div className="track-header">
          {/* Botón para abrir el modal de tiempo de inicio */}
          <button onClick={() => setShowStartTimeModal(true)}>Set Start Time</button>

          {/* Botón para abrir el modal de filtros */}
          <button onClick={() => setShowFilterModal(true)}>Add Filter</button>

          {/* Controles principales */}
          <ToggleSolo onToggle={() => onAction("solo", track.id)} />
          <TrashIcon onClick={() => onAction("delete", track.id)} />
        </div>

        {/* Controles adicionales */}
        <RangeInput
          value={track.volume * 100}
          onChange={(val) => onAction("volume", track.id, val)}
          icon={<ToggleMute onToggle={() => onAction("mute", track.id, !track.muted)} />}
        />
        <RangeInput
          value={track.panning}
          onChange={(val) => onAction("pan", track.id, val)}
          icon={<PanIcon onClick={() => onAction("pan", track.id, 0)} />}
        />

        {/* Lista de filtros activos */}
        // En el return del componente:
        {track.filters?.map((filter, index) => (
          <div key={index} className="filter-item">
            <span>{filter.type}</span>
            <button onClick={() => {
              // Limpiar nodo específico al eliminar
              if (filterNodesRef.current[track.id]?.[index]) {
                filterNodesRef.current[track.id][index].disconnect();
                filterNodesRef.current[track.id].splice(index, 1);
              }
              handleRemoveFilter(index);
            }}>×</button>
          </div>
        ))}
      </ResponsiveContent>

      {/* Modal para seleccionar el tiempo de inicio */}
      {showStartTimeModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Set Start Time for {track.name}</h3>

            {/* Input manual y range para minutos */}
            <div>
              <label>Minutos: </label>
              <input
                type="text"
                value={minutes === 0 ? '0' : minutes.toString().replace(/^0+/, '')} // Mostrar sin ceros iniciales
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

            {/* Input manual y range para segundos */}
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

            {/* Input manual y range para milisegundos */}
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

            {/* Valor final en formato 00:00.000 (solo lectura) */}
            <div>
              <label>Tiempo final: </label>
              <input
                type="text"
                value={formatTime(minutes, seconds, milliseconds)}
                readOnly
              />
            </div>

            {/* Botones de aceptar y cancelar */}
            <button onClick={handleSetStartTime}>Aceptar</button>
            <button onClick={() => setShowStartTimeModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal de Filtros */}
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

            {/* Agregar más controles para otros tipos de filtros según sea necesario */}

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
    <div className="current-time-display">{formatTime(currentTime)}</div>
  </div>
);