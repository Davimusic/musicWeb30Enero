import React, { useState, useRef, useEffect } from 'react';
import FullControlMedia from '../complex/fullControlMedia';





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
  allMusicProyects = [],
  setContent,
  setCurrentTimeMedia,
  currentTimeMedia,
  setComponentInUse,
  componentInUse,
  setIsLoading,
  isEndedVideo,
  setIsEndedVideo,
  currentIndex,
  setCurrentIndex,
  setIsFirstTimeLoading,
  isFirstTimeLoading,
  setQuality,
  quality,
  setIsMuted,
  isMuted,
  setVolume,
  volume,
  tags,
  setTags,
  setMusicContent,
  setContentModal,
  isMenuOpen,
  toggleMenu,
  content,
  handleItemClick,
  toggleContentVisibility,
  isContentVisible,
  setIsShuffle, // Recibimos setIsShuffle desde el componente padre
  isShuffle, // Recibimos isShuffle desde el componente padre
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false); // Estado para el modo de repetición
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Efecto para inicializar currentIndex cuando cambia la lista de canciones
  useEffect(() => {
    if (allMusicProyects.length > 0) {
      const index = allMusicProyects.findIndex(
        (project) => project.audioPrincipal?.src === src
      );
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [allMusicProyects, src]);

  // Efecto para pausar el audio si componentInUse cambia a 'video'
  useEffect(() => {
    if (componentInUse === "video" && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [componentInUse]);

  // Efecto para sincronizar componentInUse con isPlaying
  useEffect(() => {
    if (isPlaying) {
      if (isEndedVideo) {
        setComponentInUse("video");
        setIsEndedVideo(false);
        setCurrentTimeMedia(0);
      } else {
        setComponentInUse("audio");
      }
    } else if (audioRef.current && audioRef.current.paused) {
      if (componentInUse === "video") {
        // No hacer nada si el componente en uso es video
      } else {
        setComponentInUse("");
      }
    }
  }, [isPlaying]);

  // Efecto para forzar la reproducción automática cuando componentInUse es 'audio'
  useEffect(() => {
    if (componentInUse === "audio" && !isPlaying && audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error al reproducir el audio:", error);
        }
      };
      playAudio();
    }
  }, [componentInUse]);

  // Efecto para sincronizar currentTimeMedia con el reproductor de audio
  useEffect(() => {
    if (
      audioRef.current &&
      currentTimeMedia !== undefined &&
      currentTimeMedia !== null &&
      Math.abs(audioRef.current.currentTime - currentTimeMedia) > 0.1
    ) {
      audioRef.current.currentTime = currentTimeMedia;
    }
  }, [currentTimeMedia]);

  // Efecto para manejar la reproducción automática al cambiar la fuente
  useEffect(() => {
    if (autoPlay && audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setComponentInUse("audio");
        } catch (error) {
          console.error("Error al reproducir automáticamente:", error);
        }
      };
      playAudio();
    }
    setCurrentTime(0);
  }, [src, autoPlay]);

  // Efecto para recargar el audio con la nueva calidad y actualizar la duración
  useEffect(() => {
    if (isFirstTimeLoading === false && audioRef.current) {
      setIsLoading(true);
      audioRef.current.src = mixUrlWithQuality(src, quality);
      audioRef.current.load();

      const handleLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
        setIsLoading(false);
      };

      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata, {
        once: true,
      });

      const playAudio = async () => {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setComponentInUse("audio");
          setCurrentTime(0);
        } catch (error) {
          console.error("Error al reproducir después de cambiar la calidad:", error);
        }
      };
      playAudio();
    } else {
      setIsFirstTimeLoading(false);
    }
  }, [src, quality]);

  // Función para alternar entre play y pause
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.readyState >= 3) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        const handleCanPlay = () => {
          audioRef.current.play();
          setIsPlaying(true);
          audioRef.current.removeEventListener("canplay", handleCanPlay);
        };
        audioRef.current.addEventListener("canplay", handleCanPlay, { once: true });
        audioRef.current.load();
      }
    }
  };

  // Función para manejar la actualización del tiempo
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setCurrentTimeMedia(audioRef.current.currentTime);
    }
  };

  // Función para manejar la carga de metadatos
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Función para manejar la búsqueda en la barra de progreso
  const handleSeek = (e) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Función para manejar el cambio de volumen
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  // Función para alternar el silencio
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
      setIsMuted(!isMuted);
    }
  };

  // Función para alternar el modo aleatorio
  const toggleShuffle = () => {
    setIsShuffle(!isShuffle); // Actualizamos el estado isShuffle
  };

  // Función para alternar el modo de repetición
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  // Función para obtener la siguiente canción
  const getNextSong = () => {
    if (allMusicProyects.length === 0) return null;
    if (isShuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allMusicProyects.length);
      } while (randomIndex === currentIndex);
      return allMusicProyects[randomIndex];
    } else {
      const nextIndex = (currentIndex + 1) % allMusicProyects.length;
      return allMusicProyects[nextIndex];
    }
  };

  // Función para obtener la canción anterior
  const getPreviousSong = () => {
    if (allMusicProyects.length === 0) return null;
    const previousIndex =
      (currentIndex - 1 + allMusicProyects.length) % allMusicProyects.length;
    return allMusicProyects[previousIndex];
  };

  // Función para manejar el cambio a la siguiente canción
  const handleNextSong = () => {
    const nextSong = getNextSong();
    if (nextSong && audioRef.current) {
      setContent([nextSong]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.audioPrincipal?.src === nextSong.audioPrincipal.src
        )
      );
      audioRef.current.src = mixUrlWithQuality(nextSong.audioPrincipal.src, quality);
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Función para manejar el cambio a la canción anterior
  const handlePreviousSong = () => {
    const previousSong = getPreviousSong();
    if (previousSong && audioRef.current) {
      setContent([previousSong]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.audioPrincipal?.src === previousSong.audioPrincipal.src
        )
      );
      audioRef.current.src = mixUrlWithQuality(previousSong.audioPrincipal.src, quality);
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Función para manejar el final de la reproducción
  const handleEnded = () => {
    alert('gio')
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNextSong();
    }
  };

  // Función para formatear el tiempo en minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <FullControlMedia
      audioRef={audioRef}
      src={src}
      isPlaying={isPlaying}
      togglePlayPause={togglePlayPause}
      isShuffle={isShuffle}
      toggleShuffle={toggleShuffle}
      isRepeat={isRepeat}
      toggleRepeat={toggleRepeat}
      handleNextSong={handleNextSong}
      handlePreviousSong={handlePreviousSong}
      handleTimeUpdate={handleTimeUpdate}
      handleLoadedMetadata={handleLoadedMetadata}
      handleSeek={handleSeek}
      handleVolumeChange={handleVolumeChange}
      toggleMute={toggleMute}
      handleEnded={handleEnded}
      formatTime={formatTime}
      currentTime={currentTime}
      duration={duration}
      isMuted={isMuted}
      volume={volume}
      buttonColor={buttonColor}
      showPlayButton={showPlayButton}
      showVolumeButton={showVolumeButton}
      isModalOpen={isModalOpen}
      openQualityModal={() => setIsModalOpen(true)}
      closeQualityModal={() => setIsModalOpen(false)}
      handleQualityChange={(newQuality) => {
        setQuality(newQuality);
        setIsModalOpen(false);
      }}
      quality={quality}
      tags={tags}
      setTags={setTags}
      setContent={setContent}
      setMusicContent={setMusicContent}
      setIsModalOpen={setIsModalOpen}
      setContentModal={setContentModal}
      isMenuOpen={isMenuOpen}
      toggleMenu={toggleMenu}
      content={content}
      handleItemClick={handleItemClick}
      toggleContentVisibility={toggleContentVisibility}
      isContentVisible={isContentVisible}
    />
  );
};



export default Audio;











