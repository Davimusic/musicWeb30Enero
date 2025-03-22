import React, { useState } from "react";
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









export const TrackControls = ({ track, showContent, onAction }) => {
  const [showStartTimeModal, setShowStartTimeModal] = useState(false);
  const [minutes, setMinutes] = useState(Math.floor((track.startTime || 0) / 60)); // Minutos
  const [seconds, setSeconds] = useState(Math.floor((track.startTime || 0) % 60)); // Segundos
  const [milliseconds, setMilliseconds] = useState(
    Math.round(((track.startTime || 0) - Math.floor(track.startTime || 0)) * 1000
  ));

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

  return (
    <div className="track-controls">
      <ResponsiveContent showContent={showContent}>
        <div className="track-header">
          {/* Botón para abrir el modal */}
          <button onClick={() => setShowStartTimeModal(true)}>Set Start Time</button>

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
    </div>
  );
};


/*export const TrackControls = ({ track, showContent, onAction }) => (
  <div className="track-controls">
    <ResponsiveContent showContent={showContent}>
      <div className="track-header">
        <ToggleSolo onToggle={() => onAction("solo", track.id)} />
        <input
          value={track.name}
          onChange={(e) => onAction("rename", track.id, e.target.value)}
          className="track-name-input"
        />
        <TrashIcon onClick={() => onAction("delete", track.id)} />
      </div>
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
    </ResponsiveContent>
  </div>
);*/

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