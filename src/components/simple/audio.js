import React, { useState, useRef, useEffect } from 'react';
'../../estilos/general';
import ShuffleButton from '../complex/ShuffleButton';
import RepeatButton from '../complex/RepeatButton';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import TogglePlayPause from '../complex/TogglePlayPause';
import ToggleMute from '../complex/ToggleMute';
import QualitySelectorModal from '../complex/qualitySelectorModal';
import QualityIcon from '../complex/quialityIcon';
import NextBeforeIcon from '../complex/nextBeforeIcon';


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
  width = "600px",
  allMusicProyects = [], // Todas las canciones disponibles
  setContent, // Función para actualizar la canción actual
  setCurrentTimeMedia,
  currentTimeMedia,
  setComponentInUse,
  componentInUse,
  setIsLoading,
  isEndedVideo,
  setIsEndedVideo
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false); // Estado para modo aleatorio
  const [isRepeat, setIsRepeat] = useState(false); // Estado para repetir la canción
  const [quality, setQuality] = useState(25); // Estado para la calidad del audio
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleShuffle = () => {
    setIsRepeat(false); // Desactivar Repeat si Shuffle se activa
    setIsShuffle(prev => !prev);
  };

  const handleToggleRepeat = () => {
    setIsShuffle(false); // Desactivar Shuffle si Repeat se activa
    setIsRepeat(prev => !prev);
  };

  // Efecto para pausar el audio si componentInUse cambia a 'video'
  useEffect(() => {
    if (componentInUse === 'video' && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [componentInUse]);

  // Efecto para sincronizar componentInUse con isPlaying
  useEffect(() => {
    if (isPlaying) {
      if (isEndedVideo) {
        setComponentInUse('video'); // Esto viene de video, cuando acaba el video el manda el mensaje para que lo deje empezar a él con el siguiente video
        setIsEndedVideo(false);
      } else {
        setComponentInUse('audio'); // Si está reproduciendo, componentInUse es 'audio'
      }
    } else if (audioRef.current && audioRef.current.paused) {
      setComponentInUse(''); // Si está pausado, componentInUse es ''
    }
  }, [isPlaying]);

  // Efecto para forzar la reproducción automática cuando componentInUse es 'audio'
  useEffect(() => {
    if (componentInUse === 'audio' && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [componentInUse]);

  // Efecto para sincronizar currentTimeMedia con el reproductor de audio
  useEffect(() => {
    if (
      audioRef.current &&
      currentTimeMedia !== undefined &&
      currentTimeMedia !== null &&
      Math.abs(audioRef.current.currentTime - currentTimeMedia) > 0.1 // Evitar actualizaciones innecesarias
    ) {
      audioRef.current.currentTime = currentTimeMedia; // Actualizar el tiempo del reproductor
    }
  }, [currentTimeMedia]);

  // Efecto para manejar la reproducción automática al cambiar la fuente
  useEffect(() => {
    if (autoPlay) {
      audioRef.current.play();
      setIsPlaying(true);
      setComponentInUse('audio'); // Actualizar componentInUse a 'audio' cuando se reproduce automáticamente
    }
    setCurrentTime(0);
  }, [src, autoPlay]);

  // Efecto para recargar el audio con la nueva calidad
  useEffect(() => {
    setIsLoading(true); // Comienza la carga
    audioRef.current.src = mixUrlWithQuality(src, quality);
    audioRef.current.load(); // Recarga el audio con la nueva calidad
    audioRef.current.play();
    setIsPlaying(true);
    setComponentInUse('audio'); // Actualizar componentInUse a 'audio' cuando se reproduce automáticamente
    setCurrentTime(0);
  }, [src, quality]);

  const openQualityModal = () => setIsModalOpen(true);
  const closeQualityModal = () => setIsModalOpen(false);
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    closeQualityModal();
  };

  // Función para alternar entre play y pause
  const togglePlayPause = () => {
    if (isPlaying) {
      // Pausar el audio
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reproducir el audio
      if (audioRef.current.readyState >= 3) { // 3 = HAVE_FUTURE_DATA
        if (currentTimeMedia !== undefined && currentTimeMedia !== null) {
          audioRef.current.currentTime = currentTimeMedia; // Establecer el tiempo desde currentTimeMedia
        }
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        // Si el audio no está listo, esperar al evento 'canplay'
        const handleCanPlay = () => {
          if (currentTimeMedia !== undefined && currentTimeMedia !== null) {
            audioRef.current.currentTime = currentTimeMedia; // Establecer el tiempo desde currentTimeMedia
          }
          audioRef.current.play();
          setIsPlaying(true);
          // Eliminar el event listener después de usarlo
          audioRef.current.removeEventListener('canplay', handleCanPlay);
        };

        // Agregar el event listener para canplay
        audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });

        // Forzar la recarga del audio si no está listo
        audioRef.current.load();
      }
    }
  };

  // Función para manejar la actualización del tiempo
  const handleTimeUpdate = () => {
    if (audioRef.current.currentTime !== currentTime) {
      setCurrentTime(audioRef.current.currentTime);
      setCurrentTimeMedia(audioRef.current.currentTime); // Actualizar currentTimeMedia
    }
  };

  // Función para manejar la carga de metadatos
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  // Función para manejar la búsqueda en la barra de progreso
  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Función para manejar el cambio de volumen
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Función para alternar el silencio
  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  // Función para alternar el modo aleatorio
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // Función para alternar el modo de repetición
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  // Función para obtener la siguiente canción
  const getNextSong = () => {
    if (allMusicProyects.length === 0) return null;

    // Filtra los proyectos que tienen un audioPrincipal definido
    const projectsWithAudioPrincipal = allMusicProyects.filter(project => project.audioPrincipal);

    if (projectsWithAudioPrincipal.length === 0) return null;

    // Encuentra el índice del proyecto que contiene el audioPrincipal actual
    const currentProjectIndex = projectsWithAudioPrincipal.findIndex((project) =>
      project.audioPrincipal.src === src // Usamos la variable local `src`
    );

    if (currentProjectIndex === -1) return null;

    if (isShuffle) {
      // Modo aleatorio: selecciona un proyecto aleatorio
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * projectsWithAudioPrincipal.length);
      } while (randomIndex === currentProjectIndex); // Evita repetir el mismo proyecto

      const randomProject = projectsWithAudioPrincipal[randomIndex];
      return randomProject;
    } else {
      // Modo normal: selecciona el siguiente proyecto en la lista
      const nextProjectIndex = (currentProjectIndex + 1) % projectsWithAudioPrincipal.length;
      const nextProject = projectsWithAudioPrincipal[nextProjectIndex];
      return nextProject;
    }
  };

  // Función para obtener la canción anterior
  const getPreviousSong = () => {
    if (allMusicProyects.length === 0) return null;

    // Filtra los proyectos que tienen un audioPrincipal definido
    const projectsWithAudioPrincipal = allMusicProyects.filter(project => project.audioPrincipal);

    if (projectsWithAudioPrincipal.length === 0) return null;

    // Encuentra el índice del proyecto que contiene el audioPrincipal actual
    const currentProjectIndex = projectsWithAudioPrincipal.findIndex((project) =>
      project.audioPrincipal.src === src // Usamos la variable local `src`
    );

    if (currentProjectIndex === -1) return null;

    // Modo normal: selecciona el proyecto anterior en la lista
    const previousProjectIndex = (currentProjectIndex - 1 + projectsWithAudioPrincipal.length) % projectsWithAudioPrincipal.length;
    const previousProject = projectsWithAudioPrincipal[previousProjectIndex];
    return previousProject;
  };

  // Función para manejar el cambio a la siguiente canción
  const handleNextSong = () => {
    const nextSong = getNextSong();
    if (nextSong) {
      setContent([nextSong]); // Actualiza la canción actual
      audioRef.current.src = mixUrlWithQuality(nextSong.audioPrincipal.src, quality);
      audioRef.current.load(); // Recarga el audio con la nueva fuente
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Función para manejar el cambio a la canción anterior
  const handlePreviousSong = () => {
    const previousSong = getPreviousSong();
    if (previousSong) {
      setContent([previousSong]); // Actualiza la canción actual
      audioRef.current.src = mixUrlWithQuality(previousSong.audioPrincipal.src, quality);
      audioRef.current.load(); // Recarga el audio con la nueva fuente
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Función para manejar el final de la reproducción
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
        audioRef.current.src = mixUrlWithQuality(nextSong.audioPrincipal.src, quality);
        audioRef.current.load(); // Recarga el audio con la nueva fuente
        audioRef.current.play();
      }
    }
  };

  // Función para formatear el tiempo en minutos y segundos
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
        src={mixUrlWithQuality(src, quality)}
        autoPlay={autoPlay}
        loop={isRepeat}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)} // Cuando el audio está esperando datos
        onCanPlay={() => setIsLoading(false)} // Cuando el audio está listo para reproducirse
      >
        Tu navegador no admite el elemento de audio.
      </audio>

      <div className="controls">
        <div className="">
          {showPlayButton && (
            <TogglePlayPause
              size={24}
              isPlaying={isPlaying}
              onToggle={togglePlayPause}
              buttonColor={buttonColor}
            />
          )}

          <ShuffleButton
            buttonColor={buttonColor}
            isShuffle={isShuffle}
            toggleShuffle={handleToggleShuffle}
          />

          <RepeatButton
            buttonColor={buttonColor}
            isRepeat={isRepeat}
            toggleRepeat={handleToggleRepeat}
          />

          <NextBeforeIcon onToggle={handlePreviousSong} direction={'left'} />
          <NextBeforeIcon onToggle={handleNextSong} direction={'right'} />
          <QualityIcon size={30} onClick={openQualityModal} />
        </div>

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

        {showVolumeButton && (
          <div className="volume-control">
            <ToggleMute
              size={40}
              isMuted={isMuted}
              onToggle={toggleMute}
              buttonColor={buttonColor}
            />
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

        <QualitySelectorModal
          isOpen={isModalOpen}
          onClose={closeQualityModal}
          onQualityChange={handleQualityChange}
        />
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

        .quality-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quality-selector select {
          padding: 4px;
          border-radius: 4px;
          border: 1px solid ${buttonColor};
          background-color: ${backgroundColor};
          color: ${buttonColor};
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

          .quality-selector {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Audio;









/**
import React, { useState, useRef, useEffect } from 'react';
'../../estilos/general';
import ShuffleButton from '../complex/ShuffleButton';
import RepeatButton from '../complex/RepeatButton';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import TogglePlayPause from '../complex/TogglePlayPause';
import ToggleMute from '../complex/ToggleMute';
import QualitySelectorModal from '../complex/qualitySelectorModal';
import QualityIcon from '../complex/quialityIcon';
import NextBeforeIcon from '../complex/nextBeforeIcon';


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
  width = "600px",
  allMusicProyects = [], // Todas las canciones disponibles
  setContent, // Función para actualizar la canción actual
  setCurrentTimeMedia,
  currentTimeMedia,
  setComponentInUse,
  componentInUse,
  setIsLoading,
  isEndedVideo,
  setIsEndedVideo
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false); // Estado para modo aleatorio
  const [isRepeat, setIsRepeat] = useState(false); // Estado para repetir la canción
  const [quality, setQuality] = useState(25); // Estado para la calidad del audio
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleShuffle = () => {
    setIsRepeat(false); // Desactivar Repeat si Shuffle se activa
    setIsShuffle(prev => !prev);
  };

  const handleToggleRepeat = () => {
    setIsShuffle(false); // Desactivar Shuffle si Repeat se activa
    setIsRepeat(prev => !prev);
  };

  // Efecto para pausar el audio si componentInUse cambia a 'video'
  useEffect(() => {
    if (componentInUse === 'video' && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [componentInUse]);

  // Efecto para sincronizar componentInUse con isPlaying
  useEffect(() => {
    if (isPlaying) {
      if(isEndedVideo){
        setComponentInUse('video')//esto viene de video, cuando acaba el video el manda el mensaje para que lo deje empezar a el con el siguienyte video
        setIsEndedVideo(false)
      } else {
        setComponentInUse('audio'); // Si está reproduciendo, componentInUse es 'audio'
      }
    } else if (audioRef.current && audioRef.current.paused) {
      setComponentInUse(''); // Si está pausado, componentInUse es ''
    }
  }, [isPlaying]);

  // Efecto para forzar la reproducción automática cuando componentInUse es 'audio'
  useEffect(() => {
    if (componentInUse === 'audio' && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [componentInUse]);

  // Efecto para sincronizar currentTimeMedia con el reproductor de audio
  useEffect(() => {
    if (
      audioRef.current &&
      currentTimeMedia !== undefined &&
      currentTimeMedia !== null &&
      Math.abs(audioRef.current.currentTime - currentTimeMedia) > 0.1 // Evitar actualizaciones innecesarias
    ) {
      audioRef.current.currentTime = currentTimeMedia; // Actualizar el tiempo del reproductor
    }
  }, [currentTimeMedia]);

  // Efecto para manejar la reproducción automática al cambiar la fuente
  useEffect(() => {
    if (autoPlay) {
      audioRef.current.play();
      setIsPlaying(true);
      setComponentInUse('audio'); // Actualizar componentInUse a 'audio' cuando se reproduce automáticamente
    }
    setCurrentTime(0);
  }, [src, autoPlay]);

  // Efecto para recargar el audio con la nueva calidad
  useEffect(() => {
    setIsLoading(true); // Comienza la carga
    audioRef.current.src = mixUrlWithQuality(src, quality);
    audioRef.current.load(); // Recarga el audio con la nueva calidad
    audioRef.current.play();
    setIsPlaying(true);
    setComponentInUse('audio'); // Actualizar componentInUse a 'audio' cuando se reproduce automáticamente
    setCurrentTime(0);
  }, [src, quality]);

  const openQualityModal = () => setIsModalOpen(true);
  const closeQualityModal = () => setIsModalOpen(false);
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    closeQualityModal();
  };

  // Función para alternar entre play y pause
  const togglePlayPause = () => {
    if (isPlaying) {
      // Pausar el audio
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Reproducir el audio
      if (audioRef.current.readyState >= 3) { // 3 = HAVE_FUTURE_DATA
        if (currentTimeMedia !== undefined && currentTimeMedia !== null) {
          audioRef.current.currentTime = currentTimeMedia; // Establecer el tiempo desde currentTimeMedia
        }
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        // Si el audio no está listo, esperar al evento 'canplay'
        const handleCanPlay = () => {
          if (currentTimeMedia !== undefined && currentTimeMedia !== null) {
            audioRef.current.currentTime = currentTimeMedia; // Establecer el tiempo desde currentTimeMedia
          }
          audioRef.current.play();
          setIsPlaying(true);
          // Eliminar el event listener después de usarlo
          audioRef.current.removeEventListener('canplay', handleCanPlay);
        };

        // Agregar el event listener para canplay
        audioRef.current.addEventListener('canplay', handleCanPlay, { once: true });

        // Forzar la recarga del audio si no está listo
        audioRef.current.load();
      }
    }
  };

  // Función para manejar la actualización del tiempo
  const handleTimeUpdate = () => {
    if (audioRef.current.currentTime !== currentTime) {
      setCurrentTime(audioRef.current.currentTime);
      setCurrentTimeMedia(audioRef.current.currentTime); // Actualizar currentTimeMedia
    }
  };

  // Función para manejar la carga de metadatos
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  // Función para manejar la búsqueda en la barra de progreso
  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Función para manejar el cambio de volumen
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Función para alternar el silencio
  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = 0;
    }
    setIsMuted(!isMuted);
  };

  // Función para alternar el modo aleatorio
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // Función para alternar el modo de repetición
  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  

  const getNextSong = () => {
    //console.log(allMusicProyects);
    
    if (allMusicProyects.length === 0) return null;

    // Filtra los proyectos que tienen un audioPrincipal definido
    const projectsWithAudioPrincipal = allMusicProyects.filter(project => project.audioPrincipal);

    if (projectsWithAudioPrincipal.length === 0) return null;

    // Encuentra el índice del proyecto que contiene el audioPrincipal actual
    const currentProjectIndex = projectsWithAudioPrincipal.findIndex((project) => 
        project.audioPrincipal.src === src // Usamos la variable local `src`
    );

    if (currentProjectIndex === -1) return null;

    if (isShuffle) {
        // Modo aleatorio: selecciona un proyecto aleatorio
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * projectsWithAudioPrincipal.length);
        } while (randomIndex === currentProjectIndex); // Evita repetir el mismo proyecto

        const randomProject = projectsWithAudioPrincipal[randomIndex];
        // Selecciona el audioPrincipal del proyecto aleatorio
        const nextAudio = randomProject.audioPrincipal;
        console.log(randomProject);
        
        return randomProject;
    } else {
        // Modo normal: selecciona el siguiente proyecto en la lista
        const nextProjectIndex = (currentProjectIndex + 1) % projectsWithAudioPrincipal.length;
        const nextProject = projectsWithAudioPrincipal[nextProjectIndex];
        // Selecciona el audioPrincipal del siguiente proyecto
        const nextAudio = nextProject.audioPrincipal;
        //console.log({ project: nextProject, audio: nextAudio });
        
        return  nextProject ;
    }
};

  // Función para manejar el final de la reproducción
  const handleEnded = () => {
    if (isRepeat) {
      // Repetir la misma canción
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      // Reproducir la siguiente canción
      const nextSong = getNextSong();
      //console.log(nextSong);
      
      if (nextSong) {
        setContent([nextSong]); // Actualiza la canción actual

        // Cambia la fuente del audio y espera a que esté lista para reproducir
        audioRef.current.src = mixUrlWithQuality(nextSong.audioPrincipal.src, quality);
        audioRef.current.load(); // Recarga el audio con la nueva fuente

        // Espera a que el audio esté listo antes de reproducir
        audioRef.current.addEventListener('canplay', () => {
          audioRef.current.play();
        }, { once: true }); // El evento se elimina automáticamente después de ejecutarse
      }
    }
  };

  // Función para formatear el tiempo en minutos y segundos
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
        src={mixUrlWithQuality(src, quality)}
        autoPlay={autoPlay}
        loop={isRepeat}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)} // Cuando el audio está esperando datos
        onCanPlay={() => setIsLoading(false)} // Cuando el audio está listo para reproducirse
      >
        Tu navegador no admite el elemento de audio.
      </audio>

      <div className="controls">
        <div className="">
          {showPlayButton && (
            <TogglePlayPause
              size={24}
              isPlaying={isPlaying}
              onToggle={togglePlayPause}
              buttonColor={buttonColor}
            />
          )}

          <ShuffleButton
            buttonColor={buttonColor}
            isShuffle={isShuffle}
            toggleShuffle={handleToggleShuffle}
          />

          <RepeatButton
            buttonColor={buttonColor}
            isRepeat={isRepeat}
            toggleRepeat={handleToggleRepeat}
          />

          <NextBeforeIcon onToggle={()=>console.log()} direction={'left'}/>
          <NextBeforeIcon onToggle={()=>console.log()} direction={'right'}/>
          <QualityIcon size={30} onClick={openQualityModal} />
        </div>

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

        {showVolumeButton && (
          <div className="volume-control">
            <ToggleMute
              size={40}
              isMuted={isMuted}
              onToggle={toggleMute}
              buttonColor={buttonColor}
            />
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



<QualitySelectorModal
  isOpen={isModalOpen}
  onClose={closeQualityModal}
  onQualityChange={handleQualityChange}
/>

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

        .quality-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quality-selector select {
          padding: 4px;
          border-radius: 4px;
          border: 1px solid ${buttonColor};
          background-color: ${backgroundColor};
          color: ${buttonColor};
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

          .quality-selector {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Audio;
 */






































