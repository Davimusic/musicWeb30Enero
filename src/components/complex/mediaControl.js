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

const MediaControl = forwardRef(({
  src,
  isPlaying,
  togglePlayPause,
  isShuffle,
  toggleShuffle,
  isRepeat,
  toggleRepeat,
  handleNextSong,
  handlePreviousSong,
  handleTimeUpdate,
  handleLoadedMetadata,
  handleSeek,
  handleVolumeChange,
  toggleMute,
  handleEnded,
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
  quality
}, ref) => {
    return (
        <div className="media-control-container backgroundColor3">
          <audio
            ref={ref}
            src={src}
            autoPlay={isPlaying}
            loop={isRepeat}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          >
            Tu navegador no admite el elemento de audio.
          </audio>
      
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
      
              <NextBeforeIcon onToggle={handlePreviousSong} direction={"left"} />
              <NextBeforeIcon onToggle={handleNextSong} direction={"right"} />
              <QualityIcon size={30} onClick={openQualityModal} />
            </div>
      
            {/* Barra de progreso */}
            <div style={{ maxWidth: '60vh', display: 'flex' }} className="">
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
                      "--backgroundColor4"
                    )} ${(currentTime / (duration || 1)) * 100}%, ${getCSSVariableValue(
                      "--backgroundColor5"
                    )} ${(currentTime / (duration || 1)) * 100}%)`,
                  }}
                />
              </div>
              <span style={{ color: buttonColor }}>{formatTime(duration)}</span>
            </div>
      
            {/* Controles de volumen */}
            {showVolumeButton && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', maxWidth: '30vh' }} className="volume-controls">
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
                        "--backgroundColor4"
                      )} ${(isMuted ? 0 : volume) * 100}%,${getCSSVariableValue(
                        "--backgroundColor5"
                      )} ${(isMuted ? 0 : volume) * 100}%)`,
                    }}
                  />
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
      
          {/* Estilos */}
          <style jsx>{`
            .mainContainer {
              display: block;
            }
      
            .media-control-container {
              padding: 16px;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              gap: 16px;
              width: 89vw;
            }
      
            .playback-controls {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 16px;
              flex-wrap: wrap;
            }
      
            .progress-controls {
              display: flex;
              align-items: center;
              gap: 8px;
              width: 100%;
            }
      
            .slider-container {
              flex: 1;
              position: relative;
              height: 4px;
            }
      
            .seek-slider,
            .volume-slider {
              -webkit-appearance: none;
              width: 100%;
              height: 4px;
              border-radius: 2px;
              outline: none;
              transition: opacity 0.2s;
            }
      
            .seek-slider::-webkit-slider-thumb,
            .volume-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 12px;
              height: 12px;
              background: var(--backgroundColor4);
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.2s;
            }
      
            .volume-controls {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              width: 100%;
            }
      
            @media (min-width: 768px) {
              .mainContainer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
              }
      
              .progress-controls {
                flex: 1;
                margin: 0 16px;
              }
      
              .volume-controls {
                justify-content: flex-end;
                max-width: 200px;
              }
            }
      
            @media (max-width: 767px) {
              .progress-controls {
                flex-direction: column;
                gap: 8px;
              }
      
              .volume-controls {
                justify-content: center;
              }
            }
          `}</style>
        </div>
      );
});

MediaControl.displayName = 'MediaControl';
export default MediaControl;