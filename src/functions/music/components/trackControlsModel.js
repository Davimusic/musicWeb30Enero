import React from 'react';
import EditableTrackName from '../DAW3/editableTrackName';
import ControlsIcon from '@/components/complex/controlsIcon';
import AudioLevelMeter from '../DAW3/audioLevelMeter';

const TrackControlsModal = ({ track, openModal, audioNodesRef, currentTime, isPlaying, tracks, setTracks }) => {
  // Determinar si mostrar el medidor de audio (solo para tracks de audio)
  const showAudioMeter = track.type !== "drumMachine";


  const updateTrackName = (trackId, newName) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? {...track, name: newName} : track
      )
    );
  };
  
  return (
    <div
      className={`${track.solo ? 'trackSolo' : ''}`}
      style={{
        position: 'sticky',
        left: '0px',
        top: '0',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
        width: 'auto',
        marginLeft: '10px',
        float: 'left',
        // Asegurar que el contenedor tenga el mismo tamaño siempre
        minWidth: '200px',
        height: '40px'
      }}
    >
      <EditableTrackName
        name={track.name}
        onChange={(newName) => updateTrackName(track.id, newName)}
        style={{
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          border: 'none',
          color: 'black',
          // Asegurar que el nombre no haga crecer el contenedor
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      />
      
      <ControlsIcon 
        size={30} 
        onToggle={() => openModal(track.id, 'trackControl')} 
      />
      
      {showAudioMeter && (
        <AudioLevelMeter
          analyser={audioNodesRef.current[track.id]?.analyser}
          muted={track.muted}
          clipTimes={track.clipTimes}
          globalTime={currentTime}
          isPlaying={isPlaying}
          tracks={tracks}
          trackId={track.id}
        />
      )}
      
      {/* Espacio reservado para mantener la alineación cuando no hay medidor */}
      {!showAudioMeter && (
        <div style={{ width: '30px' }}></div>
      )}
    </div>
  );
};

export default TrackControlsModal;