import React, { forwardRef } from 'react';
import '../../estilos/general/general.css';
import TogglePlayPause from './TogglePlayPause';
import ShuffleButton from './ShuffleButton';
import RepeatButton from './RepeatButton';
import NextBeforeIcon from './nextBeforeIcon';
import QualityIcon from './quialityIcon';
import ToggleMute from './ToggleMute';
import QualitySelectorModal from './qualitySelectorModal';
import getCSSVariableValue from '@/functions/music/getCSSVariableValue';
import '../../estilos/music/mediaControl.css';
import ExpandIcon from './expandIcon';

const MediaControl = forwardRef(
  (
    {
      isPlaying,
      togglePlayPause,
      handleNextSong,
      handlePreviousSong,
      handleSeek,
      handleVolumeChange,
      toggleMute,
      formatTime,
      currentTime,
      duration,
      isMuted,
      volume,
      buttonColor = 'white',
      showPlayButton = true,
      showVolumeButton = true,
      isModalOpen,
      openQualityModal,
      closeQualityModal,
      handleQualityChange,
      quality,
      isRepeat,
      toggleShuffle,
      isShuffle,
      toggleRepeat,
      toggleComponentInUse,
    },
    ref
  ) => {
    return (
      <div className="media-control-container backgroundColor3">
        {/* Contenedor principal */}
        <div className="mainContainer">
          {/* Controles de reproducción */}
          <div className="playback-controls">
            {showPlayButton && (
              <TogglePlayPause
                size={30}
                isPlaying={isPlaying}
                onToggle={togglePlayPause}
                buttonColor={buttonColor}
              />
            )}

            <ShuffleButton
              buttonColor={buttonColor}
              isShuffle={isShuffle}
              toggleShuffle={toggleShuffle}
            />

            <RepeatButton
              buttonColor={buttonColor}
              isRepeat={isRepeat}
              toggleRepeat={toggleRepeat}
            />

            <NextBeforeIcon onToggle={handlePreviousSong} direction={'left'} />
            <NextBeforeIcon onToggle={handleNextSong} direction={'right'} />
            <QualityIcon size={30} onClick={openQualityModal} />
          </div>

          {/* Barra de progreso */}
          <div className="audioControlContainer">
            <span style={{ color: buttonColor }}>{formatTime(currentTime)}</span>
            <div className="slider-container" style={{ flex: 1 }}>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="seek-slider backgroundColor5"
                style={{
                  width: '100%',
                  background: `linear-gradient(to right, ${getCSSVariableValue(
                    '--backgroundColor4'
                  )} ${(currentTime / (duration || 1)) * 100}%, ${getCSSVariableValue(
                    '--backgroundColor5'
                  )} ${(currentTime / (duration || 1)) * 100}%)`,
                }}
              />
            </div>
            <span style={{ color: buttonColor }}>{formatTime(duration)}</span>
          </div>

          {/* Controles de volumen */}
          {showVolumeButton && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                maxWidth: '30vh',
              }}
              className="volume-controls"
            >
              <ToggleMute
                size={30}
                isMuted={isMuted}
                onToggle={toggleMute}
                buttonColor={buttonColor}
              />
              <div className="slider-container" style={{ width: '100px' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider backgroundColor5"
                  style={{
                    width: '100%',
                    background: `linear-gradient(to right, ${getCSSVariableValue(
                      '--backgroundColor4'
                    )} ${(isMuted ? 0 : volume) * 100}%,${getCSSVariableValue(
                      '--backgroundColor5'
                    )} ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>
              <div className="changeModePhoneView">
                <ExpandIcon size={50} onClick={toggleComponentInUse} />
              </div>
            </div>
          )}
        </div>

        {/* Modal de calidad */}
        <QualitySelectorModal
          isOpen={isModalOpen}
          onClose={closeQualityModal}
          onQualityChange={handleQualityChange}
          quality={quality}
        />
      </div>
    );
  }
);

MediaControl.displayName = 'MediaControl';
export default MediaControl;