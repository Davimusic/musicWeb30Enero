import React from "react";
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

export const TrackControls = ({ track, showContent, onAction }) => (
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
);

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
    {/*<div className="current-time-display">{formatTime(currentTime)}</div>*/}
  </div>
);