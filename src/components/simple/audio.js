import React, { useRef, useState, useEffect } from 'react';
import MediaControl from '../complex/mediaControl';
import FullControlMedia from '../complex/fullControlMedia';

const Audio = ({
  src,
  allMusicProyects,
  currentIndex,
  setCurrentIndex,
  setContent,
  isFirstTimeLoading,
  setIsFirstTimeLoading,
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
  setComponentInUse,
  componentInUse,
  setShowComponent,
  showComponent,
  setCurrentTimeMedia,
  currentTimeMedia,
  changeStateMenu
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState(25);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función auxiliar para manejar la reproducción del audio
  const playAudio = () => {
    audioRef.current.play().catch((error) => {
      console.error('Error al reproducir el audio:', error);
    });
    setIsPlaying(true);
  };

  // Efecto para manejar cambios en `src`
  /*useEffect(() => {
    console.log('acaca');
    
    if (!isFirstTimeLoading && componentInUse === 'audio') {
      playAudio();
      setComponentInUse('audio')
    } else {
      setIsFirstTimeLoading(false);
    }
  }, [src]);*/

  useEffect(() => {
    if (!isFirstTimeLoading && componentInUse === 'audio') {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTimeMedia; // Aplicar el tiempo actual
        playAudio();
      }
    } else {
      setIsFirstTimeLoading(false);
    }
  }, [src]);

  useEffect(() => {
    if (componentInUse === 'audio') {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTimeMedia; // Aplicar el tiempo actual
        playAudio();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [componentInUse]);
  

  /*/ Efecto para manejar cambios en `componentInUse`
  useEffect(() => {
    console.log('Componente en uso:', componentInUse);

    if (componentInUse === 'audio') {
      playAudio();
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [componentInUse]);*/

  // Función para alternar entre play y pause
  const togglePlayPause = () => {
    if (isPlaying) {
      setComponentInUse(''); // Pausa el audio y desactiva el componente
    } else {
      setComponentInUse('audio'); // Activa el componente y reproduce el audio
    }
  };

  // Función para manejar el final de la reproducción
  const handleEnded = () => {
    if (isRepeat) {
      //audioRef.current.currentTime = 0;
      playAudio();
    } else {
      handleNextSong();
    }
    setCurrentTimeMedia(0)
  };

  // Función para manejar la actualización del tiempo
  const handleTimeUpdate = () => {
    if (audioRef.current) {
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
      setCurrentTimeMedia(seekTime);
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
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleShuffle = () => {
    // Si el modo de repetición está activo, lo desactivo antes de activar el modo aleatorio
    if (isRepeat) {
      setIsRepeat(false);
    }
    setIsShuffle(!isShuffle);
  };
  
  const toggleRepeat = () => {
    // Si el modo aleatorio está activo, lo desactivo antes de activar el modo de repetición
    if (isShuffle) {
      setIsShuffle(false);
    }
    setIsRepeat(!isRepeat);
  };

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
  
    if (isShuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allMusicProyects.length);
      } while (randomIndex === currentIndex); // Asegura que no se repita la canción actual
      return allMusicProyects[randomIndex];
    } else {
      const previousIndex =
        (currentIndex - 1 + allMusicProyects.length) % allMusicProyects.length;
      return allMusicProyects[previousIndex];
    }
  };

  // Función para manejar el cambio a la siguiente canción
  const handleNextSong = () => {
    const nextSong = getNextSong();
    if (nextSong) {
      setContent([nextSong]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.audioPrincipal?.src === nextSong.audioPrincipal.src
        )
      );
    }
  };

  // Función para manejar el cambio a la canción anterior
  const handlePreviousSong = () => {
    const previousSong = getPreviousSong();
    if (previousSong) {
      setContent([previousSong]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.audioPrincipal?.src === previousSong.audioPrincipal.src
        )
      );
    }
  };

  // Función para formatear el tiempo en minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      {/* Elemento de audio */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        muted={isMuted}
        loop={isRepeat}
      >
        Tu navegador no admite el elemento de audio.
      </audio>

      {/* FullControlMedia con MediaControl */}
      <FullControlMedia
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        handleNextSong={handleNextSong}
        handlePreviousSong={handlePreviousSong}
        handleSeek={handleSeek}
        handleVolumeChange={handleVolumeChange}
        toggleMute={toggleMute}
        formatTime={formatTime}
        currentTime={currentTimeMedia}
        duration={duration}
        isMuted={isMuted}
        volume={volume}
        isModalOpen={isModalOpen}
        openQualityModal={() => setIsModalOpen(true)}
        closeQualityModal={() => setIsModalOpen(false)}
        handleQualityChange={(newQuality) => {
          setQuality(newQuality);
          setIsModalOpen(false);
        }}
        quality={quality}
        isRepeat={isRepeat}
        toggleShuffle={toggleShuffle}
        isShuffle={isShuffle}
        toggleRepeat={toggleRepeat}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        content={content}
        handleItemClick={handleItemClick}
        toggleContentVisibility={toggleContentVisibility}
        isContentVisible={isContentVisible}
        setComponentInUse={setComponentInUse}
        componentInUse={componentInUse}
        setShowComponent={setShowComponent}
        showComponent={showComponent}
        changeStateMenu={changeStateMenu}
      />
    </>
  );
};

export default Audio;











