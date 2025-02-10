import React, { useState, useRef, useEffect } from 'react';
'../../estilos/general';
import ShuffleButton from '../complex/ShuffleButton';
import RepeatButton from '../complex/RepeatButton';

const Audio = ({
  src,
  id,
  autoPlay,
  loop,
  controlsList,
  backgroundColor = "backgroundColor4",
  buttonColor = "#ffffff",
  sliderEmptyColor = "#535353",
  sliderFilledColor = "#1db954",
  showPlayButton = true,
  showVolumeButton = true,
  playIcon = "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/play_slnrjf.png",
  pauseIcon = "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/pause_h2cozi.png",
  volumeIcon = "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/volumeup_qodl3n.png",
  width = "600px",
  allMusicProyects = [], // Todas las canciones disponibles
  setContent, // Función para actualizar la canción actual
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false); // Estado para modo aleatorio
  const [isRepeat, setIsRepeat] = useState(false); // Estado para repetir la canción

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (autoPlay) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    setCurrentTime(0);
  }, [src, autoPlay]);

  useEffect(() => {
    audioRef.current.play();
    setIsPlaying(true);
    setCurrentTime(0);
  }, [src]);

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

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const getNextSong = () => {
    if (allMusicProyects.length === 0) return null;

    const currentIndex = allMusicProyects.findIndex((song) => song.audio.src === src);

    if (isShuffle) {
      // Modo aleatorio: selecciona una canción aleatoria
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allMusicProyects.length);
      } while (randomIndex === currentIndex); // Evita repetir la misma canción
      return allMusicProyects[randomIndex];
    } else {
      // Modo normal: selecciona la siguiente canción en la lista
      const nextIndex = (currentIndex + 1) % allMusicProyects.length;
      return allMusicProyects[nextIndex];
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      // Repetir la misma canción
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      // Reproducir la siguiente canción
      const nextSong = getNextSong();
      if (nextSong) {
        setContent([nextSong]); // Actualiza la canción actual

        // Cambia la fuente del audio y espera a que esté lista para reproducir
        audioRef.current.src = nextSong.audio.src;
        audioRef.current.load(); // Recarga el audio con la nueva fuente

        // Espera a que el audio esté listo antes de reproducir
        audioRef.current.addEventListener('canplay', () => {
          audioRef.current.play();
        }, { once: true }); // El evento se elimina automáticamente después de ejecutarse
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      className="spotify-player backgroundColor3"
      style={{ width: width === "100%" ? "100%" : width }}
    >
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        loop={isRepeat}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
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

        {/* Usar el componente ShuffleButton */}
        <ShuffleButton
          buttonColor={buttonColor}
          isShuffle={isShuffle}
          toggleShuffle={toggleShuffle}
        />

        <div className="progress-bar">
          <span style={{ color: buttonColor }}>{formatTime(currentTime)}</span>
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="seek-slider"
              style={{
                background: `linear-gradient(to right, #2bc6c8 ${
                  (currentTime / (duration || 1)) * 100
                }%,  #060606 ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
          </div>
          <span style={{ color: buttonColor }}>{formatTime(duration)}</span>
        </div>

        {/* Usar el componente RepeatButton */}
        <RepeatButton
          buttonColor={buttonColor}
          isRepeat={isRepeat}
          toggleRepeat={toggleRepeat}
        />

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
                  background: `linear-gradient(to right, #2bc6c8 ${
                    (isMuted ? 0 : volume) * 100
                  }%,  #060606 ${(isMuted ? 0 : volume) * 100}%)`,
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
        .volume-icon,
        .shuffle-button,
        .repeat-button {
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




/*import React, { useState, useRef, useEffect } from 'react';
'../../estilos/general'

const Audio = ({
  src,
  id,
  autoPlay,
  loop,
  controlsList,
  backgroundColor = "backgroundColor4", // Color de fondo por defecto, no funciona
  buttonColor = "#ffffff", // Color de los botones por defecto
  sliderEmptyColor = "#535353", // Color de la línea vacía por defecto, no funciona
  sliderFilledColor = "#1db954", // Color de la línea rellena por defecto, no funciona
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

  useEffect(() => {//por mi
    audioRef.current.play();
    setCurrentTime(0)
    setIsPlaying(true);
  }, [src]);


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
      className="spotify-player backgroundColor3"
      style={{width: width === "100%" ? "100%" : width }}
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
                background: `linear-gradient(to right, #2bc6c8 ${
                  (currentTime / (duration || 1)) * 100
                }%,  #060606 ${(currentTime / (duration || 1)) * 100}%)`,
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
                  background: `linear-gradient(to right, #2bc6c8 ${
                    (isMuted ? 0 : volume) * 100
                  }%,  #060606 ${(isMuted ? 0 : volume) * 100}%)`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      
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

export default Audio;*/