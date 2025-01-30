import React, { useState, useRef, useEffect } from 'react';

const Audio = ({
  src,
  id,
  autoPlay,
  loop,
  controlsList,
  backgroundColor = "#282828", // Color de fondo por defecto
  buttonColor = "#ffffff", // Color de los botones por defecto
  sliderEmptyColor = "#535353", // Color de la línea vacía por defecto
  sliderFilledColor = "#1db954", // Color de la línea rellena por defecto
  showPlayButton = true, // Mostrar botón de play/pause
  showVolumeButton = true, // Mostrar botón de volumen
  playIcon = "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/play_slnrjf.png", // Icono de play
  pauseIcon = "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/pause_h2cozi.png", // Icono de pause
  volumeIcon = "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/volumeup_qodl3n.png", // Icono de volumen
  width = "600px", // Ancho por defecto
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      className="spotify-player"
      style={{ backgroundColor, width: width === "100%" ? "100%" : width }}
    >
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      >
        Tu navegador no admite el elemento de audio.
      </audio>

      <div className="controls">
        {showPlayButton && (
          <button
            onClick={togglePlayPause}
            className="play-pause"
            style={{ color: buttonColor }}
          >
            <img
              src={isPlaying ? pauseIcon : playIcon}
              alt={isPlaying ? "Pause" : "Play"}
              style={{ width: "24px", height: "24px" }}
            />
          </button>
        )}

        <div className="progress-bar">
          <span style={{ color: buttonColor }}>{formatTime(currentTime)}</span>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max={duration || 100} // Evita errores si duration es 0
              value={currentTime}
              onChange={handleSeek}
              className="seek-slider"
              style={{
                background: `linear-gradient(to right, ${sliderFilledColor} ${
                  (currentTime / (duration || 1)) * 100
                }%, ${sliderEmptyColor} ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
          </div>
          <span style={{ color: buttonColor }}>{formatTime(duration)}</span>
        </div>

        {showVolumeButton && (
          <div className="volume-control">
            <button
              onClick={toggleMute}
              className="volume-icon"
              style={{ color: buttonColor }}
            >
              <img
                src={volumeIcon}
                alt="Volume"
                style={{ width: "24px", height: "24px" }}
              />
            </button>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                style={{
                  background: `linear-gradient(to right, ${sliderFilledColor} ${
                    (isMuted ? 0 : volume) * 100
                  }%, ${sliderEmptyColor} ${(isMuted ? 0 : volume) * 100}%)`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Estilos con styled-jsx */}
      <style jsx>{`
        .spotify-player {
          padding: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 0 auto;
          max-width: ${width === "100%" ? "100%" : width};
          width: ${width === "100%" ? "100%" : "auto"};
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .play-pause,
        .volume-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-bar,
        .volume-control {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .slider-container {
          flex: 1;
          position: relative;
        }

        .seek-slider,
        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          outline: none;
          opacity: 0.7;
          transition: opacity 0.2s;
          border-radius: 2px;
        }

        .seek-slider:hover,
        .volume-slider:hover {
          opacity: 1;
        }

        .seek-slider::-webkit-slider-thumb,
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
          background: transparent;
          cursor: pointer;
        }

        .seek-slider::-moz-range-thumb,
        .volume-slider::-moz-range-thumb {
          width: 0;
          height: 0;
          background: transparent;
          cursor: pointer;
        }

        .volume-control {
          max-width: 150px;
        }

        @media (max-width: 768px) {
          .spotify-player {
            flex-direction: column;
            gap: 16px;
          }

          .controls {
            flex-direction: column;
            gap: 8px;
          }

          .progress-bar,
          .volume-control {
            width: 100%;
          }

          .volume-control {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Audio;