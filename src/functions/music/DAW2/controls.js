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
  const [seconds, setSeconds] = useState(Math.floor(track.startTime || 0)); // Segundos
  const [milliseconds, setMilliseconds] = useState(
    Math.round((track.startTime - Math.floor(track.startTime || 0)) * 1000) // Milisegundos
  );

  const handleSetStartTime = () => {
    const startTime = seconds + milliseconds / 1000; // Calcular el tiempo total en segundos
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
          {/*<input
            value={track.name}
            onChange={(e) => onAction("rename", track.id, e.target.value)}
            className="track-name-input"
          />*/}
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

            {/* Input range para segundos */}
            <div>
              <label>Segundos: {seconds}</label>
              <input
                type="range"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value))}
                min="0"
                max="600" // Máximo 10 minutos
                step="1"
              />
            </div>

            {/* Input range para milisegundos */}
            <div>
              <label>Milisegundos: {milliseconds}</label>
              <input
                type="range"
                value={milliseconds}
                onChange={(e) => setMilliseconds(parseInt(e.target.value))}
                min="0"
                max="999"
                step="1"
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