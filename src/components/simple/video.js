import React, { useEffect, useRef, useState } from 'react';
import FullControlMedia from '../complex/fullControlMedia';
import '../../estilos/music/video.css';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import UseControlVisibility from '../complex/useControlVisibility';

const Video = ({
  src,
  allMusicProyects,
  currentIndex,
  setCurrentIndex,
  setContent,
  tags,
  setTags,
  setMusicContent,
  isContentVisible,
  toggleContentVisibility,
  componentInUse,
  setComponentInUse,
  setIsLoading,
  isVideoFullScreen,
  setIsEndedVideo,
  isEndendVideo,
  setContentModal,
  setIsModalOpen,
  isModalOpen,
  setQuality,
  quality,
  setIsMuted,
  isMuted,
  setVolume,
  volume,
  isMenuOpen,
  toggleMenu,
  content,
  handleItemClick,
  setShowComponent,
  showComponent,
  setCurrentTimeMedia,
  currentTimeMedia,
  changeStateMenu,
  setVolumeMedia,
  volumeMedia,
  setQualityMedia,
  qualityMedia,
  setIsRepeatMedia,
  isRepeatMedia,
  setIsShuffleMedia,
  isShuffleMedia,
  setIsMutedMedia,
  isMutedMedia,
  openQualityModal,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const [isCenterButtonVisible, setIsCenterButtonVisible] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const previousTimeRef = useRef(0); // Almacenar el tiempo anterior
  const userInteractionRef = useRef(false); // Bandera para interacciones del usuario
  const timeoutRef = useRef(null); // Referencia para el temporizador

  const isMobile = /Mobile|iPhone|iPad|iPod|Android|BlackBerry|Windows Phone|Opera Mini|IEMobile|Silk/i.test(navigator.userAgent);

  // Usar el hook para controlar la visibilidad
  const { isVisible, showControls } = UseControlVisibility(isMobile);

  // Función para mostrar el botón central y los controles, y reiniciar el temporizador
  const showUIElements = (showControlsFlag = true) => {
    setIsCenterButtonVisible(true);
    if (showControlsFlag) setIsControlsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Limpiar el temporizador anterior
    }

    // Si el menú no está abierto, iniciar el temporizador para ocultar los elementos
    if (!isMenuOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsCenterButtonVisible(false);
        setIsControlsVisible(false);
      }, 2000); // Ocultar después de 2 segundos
    }
  };

  // Manejar cambios de tiempo
  const handleTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
    if (currentTime - previousTimeRef.current >= 2) {
      showUIElements();
      userInteractionRef.current = false; // Resetear bandera
    }
    previousTimeRef.current = currentTime;
  };

  // Reiniciar el temporizador cuando cambien ciertos estados
  useEffect(() => {
    showUIElements();
  }, [isMuted, content, volumeMedia, qualityMedia, isRepeatMedia, isShuffleMedia, isMutedMedia, openQualityModal]);

  // Mantener los elementos visibles mientras el menú esté abierto
  useEffect(() => {
    if (isMenuOpen) {
      showUIElements();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // Detener el temporizador
      }
    }
  }, [isMenuOpen]);

  // Mostrar controles al interactuar con el video
  const handleVideoInteraction = () => {
    showControls();
    showUIElements();
  };

  // Reproducir el video
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
      setIsPlaying(true);
    }
  };

  // Cargar el video con la calidad seleccionada
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = mixUrlWithQuality(src, qualityMedia);
      videoRef.current.load();
      videoRef.current.currentTime = currentTimeMedia;
      videoRef.current.volume = volumeMedia;
      playVideo();
    }
  }, [qualityMedia]);

  // Controlar la reproducción/pausa del video
  useEffect(() => {
    if (componentInUse === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTimeMedia;
        playVideo();
        videoRef.current.volume = volumeMedia;
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [componentInUse]);

  // Cambiar el video cuando cambia la fuente
  useEffect(() => {
    if (componentInUse === 'video') {
      if (videoRef.current) {
        videoRef.current.src = mixUrlWithQuality(src, qualityMedia);
        videoRef.current.load();
        videoRef.current.currentTime = currentTimeMedia;
        playVideo();
      }
    }
  }, [src]);

  // Alternar entre reproducir y pausar
  const togglePlayPause = (fromCenterButton = false, e) => {
    if (e) e.stopPropagation(); // Detener propagación
    userInteractionRef.current = !fromCenterButton; // Marcar interacción
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setComponentInUse('');
      setIsPlaying(false);
    } else {
      setComponentInUse('video');
      setIsPlaying(true);
    }
  };

  // Manejar el final del video
  const handleEnded = () => {
    if (isRepeatMedia) {
      playVideo();
    } else {
      handleNextVideo();
    }
    setCurrentTimeMedia(0);
  };

  // Obtener la duración del video
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Buscar un tiempo específico en el video
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = parseFloat(e.target.value);
      videoRef.current.currentTime = seekTime;
      setCurrentTimeMedia(seekTime);
    }
    showUIElements();
  };

  // Cambiar el volumen
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeMedia(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (isMutedMedia && newVolume > 0) {
      setIsMutedMedia(false);
    }
    showUIElements();
  };

  // Alternar el silencio
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMutedMedia;
      setIsMutedMedia(!isMutedMedia);
    }
    showUIElements();
  };

  // Alternar el modo shuffle
  const toggleShuffle = () => {
    if (isRepeatMedia) {
      setIsRepeatMedia(false);
    }
    setIsShuffleMedia(!isShuffleMedia);
    showUIElements();
  };

  // Alternar el modo repeat
  const toggleRepeat = () => {
    if (isShuffleMedia) {
      setIsShuffleMedia(false);
    }
    setIsRepeatMedia(!isRepeatMedia);
    showUIElements();
  };

  // Obtener el siguiente video
  const getNextVideo = () => {
    if (allMusicProyects.length === 0) return null;
    if (isShuffleMedia) {
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

  // Obtener el video anterior
  const getPreviousVideo = () => {
    if (allMusicProyects.length === 0) return null;
    if (isShuffleMedia) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allMusicProyects.length);
      } while (randomIndex === currentIndex);
      return allMusicProyects[randomIndex];
    } else {
      const previousIndex = (currentIndex - 1 + allMusicProyects.length) % allMusicProyects.length;
      return allMusicProyects[previousIndex];
    }
  };

  // Cambiar al siguiente video
  const handleNextVideo = () => {
    const nextVideo = getNextVideo();
    if (nextVideo) {
      setContent([nextVideo]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.videoPrincipal?.src === nextVideo.videoPrincipal.src
        )
      );
      setCurrentTimeMedia(0);
    }
    showUIElements();
  };

  // Cambiar al video anterior
  const handlePreviousVideo = () => {
    const previousVideo = getPreviousVideo();
    if (previousVideo) {
      setContent([previousVideo]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.videoPrincipal?.src === previousVideo.videoPrincipal.src
        )
      );
      setCurrentTimeMedia(0);
    }
    showUIElements();
  };

  // Formatear el tiempo en minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Manejar doble toque para "Me gusta"
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      alert('Me gusta');
    }
    setLastTap(now);
  };

  // Manejar el inicio del toque
  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

  // Manejar el movimiento del toque
  const handleTouchMove = (e) => {
    if (touchStartY === null) return;

    const touchEndY = e.touches[0].clientY;
    const deltaY = touchEndY - touchStartY;

    if (deltaY > 50) {
      handlePreviousVideo();
      setTouchStartY(null);
    } else if (deltaY < -50) {
      handleNextVideo();
      setTouchStartY(null);
    }
  };

  // Propiedades para FullControlMedia
  const fullControlMediaProps = {
    isPlaying,
    togglePlayPause,
    handleNextSong: handleNextVideo,
    handlePreviousSong: handlePreviousVideo,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    formatTime,
    currentTime: currentTimeMedia,
    duration,
    isMuted: isMutedMedia,
    volume: volumeMedia,
    isModalOpen,
    openQualityModal,
    closeQualityModal: () => setIsModalOpen(false),
    quality: qualityMedia,
    isRepeat: isRepeatMedia,
    toggleShuffle,
    isShuffle: isShuffleMedia,
    toggleRepeat,
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
    changeStateMenu,
    tags,
    setTags,
    setContent,
    setMusicContent,
  };

  return (
    <>
      <video
        className="video-container"
        ref={videoRef}
        src={mixUrlWithQuality(src, qualityMedia)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        muted={isMutedMedia}
        loop={isRepeatMedia}
        onClick={handleVideoInteraction}
        onTouchStart={(e) => {
          handleVideoInteraction();
          handleTouchStart(e);
          handleDoubleTap();
        }}
        onTouchMove={handleTouchMove}
      >
        Tu navegador no admite el elemento de video.
      </video>

      {isMobile && isCenterButtonVisible && (
        <button
          className="center-play-button"
          onClick={(e) => togglePlayPause(true, e)} // No mostrar controles si se activa desde el botón central
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '48px',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
      )}

      {isControlsVisible && <FullControlMedia {...fullControlMediaProps} />}
    </>
  );
};

export default Video;








/*import React, { useEffect, useRef, useState } from 'react';
import FullControlMedia from '../complex/fullControlMedia';
import '../../estilos/music/video.css';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';

const Video = ({
  src,
  allMusicProyects,
  currentIndex,
  setCurrentIndex,
  setContent,
  tags,
  setTags,
  setMusicContent,
  isContentVisible,
  toggleContentVisibility,
  componentInUse,
  setComponentInUse,
  setIsLoading,
  isVideoFullScreen,
  setIsEndedVideo,
  isEndendVideo,
  setContentModal,
  setIsModalOpen,
  isModalOpen,
  setQuality,
  quality,
  setIsMuted,
  isMuted,
  setVolume,
  volume,
  isMenuOpen,
  toggleMenu,
  content,
  handleItemClick,
  setShowComponent,
  showComponent,
  setCurrentTimeMedia,
  currentTimeMedia,
  changeStateMenu,
  setVolumeMedia,
  volumeMedia,
  setQualityMedia,
  qualityMedia,
  setIsRepeatMedia,
  isRepeatMedia,
  setIsShuffleMedia,
  isShuffleMedia,
  setIsMutedMedia,
  isMutedMedia,
  openQualityModal,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = mixUrlWithQuality(src, qualityMedia);
      videoRef.current.load();
      videoRef.current.currentTime = currentTimeMedia;
      videoRef.current.volume = volumeMedia;
      playVideo();
    }
  }, [qualityMedia]);

  useEffect(() => {
    if (componentInUse === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTimeMedia;
        playVideo();
        videoRef.current.volume = volumeMedia;
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [componentInUse]);

  useEffect(() => {
    if (componentInUse === 'video') {
      if (videoRef.current) {
        videoRef.current.src = mixUrlWithQuality(src, qualityMedia);
        videoRef.current.load();
        videoRef.current.currentTime = currentTimeMedia;
        playVideo();
      }
    }
  }, [src]);

  const togglePlayPause = () => {
    if (isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setComponentInUse('');
      setIsPlaying(false);
    } else {
      setComponentInUse('video');
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (isRepeatMedia) {
      playVideo();
    } else {
      handleNextVideo();
    }
    setCurrentTimeMedia(0);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTimeMedia(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = parseFloat(e.target.value);
      videoRef.current.currentTime = seekTime;
      setCurrentTimeMedia(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeMedia(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (isMutedMedia && newVolume > 0) {
      setIsMutedMedia(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMutedMedia;
      setIsMutedMedia(!isMutedMedia);
    }
  };

  const toggleShuffle = () => {
    if (isRepeatMedia) {
      setIsRepeatMedia(false);
    }
    setIsShuffleMedia(!isShuffleMedia);
  };

  const toggleRepeat = () => {
    if (isShuffleMedia) {
      setIsShuffleMedia(false);
    }
    setIsRepeatMedia(!isRepeatMedia);
  };

  const getNextVideo = () => {
    if (allMusicProyects.length === 0) return null;
    if (isShuffleMedia) {
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

  const getPreviousVideo = () => {
    if (allMusicProyects.length === 0) return null;
    if (isShuffleMedia) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allMusicProyects.length);
      } while (randomIndex === currentIndex);
      return allMusicProyects[randomIndex];
    } else {
      const previousIndex = (currentIndex - 1 + allMusicProyects.length) % allMusicProyects.length;
      return allMusicProyects[previousIndex];
    }
  };

  const handleNextVideo = () => {
    const nextVideo = getNextVideo();
    if (nextVideo) {
      setContent([nextVideo]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.videoPrincipal?.src === nextVideo.videoPrincipal.src
        )
      );
      setCurrentTimeMedia(0);
    }
  };

  const handlePreviousVideo = () => {
    const previousVideo = getPreviousVideo();
    if (previousVideo) {
      setContent([previousVideo]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.videoPrincipal?.src === previousVideo.videoPrincipal.src
        )
      );
      setCurrentTimeMedia(0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const fullControlMediaProps = {
    isPlaying,
    togglePlayPause,
    handleNextSong: handleNextVideo,
    handlePreviousSong: handlePreviousVideo,
    handleSeek,
    handleVolumeChange,
    toggleMute,
    formatTime,
    currentTime: currentTimeMedia,
    duration,
    isMuted: isMutedMedia,
    volume: volumeMedia,
    isModalOpen,
    openQualityModal,
    closeQualityModal: () => setIsModalOpen(false),
    quality: qualityMedia,
    isRepeat: isRepeatMedia,
    toggleShuffle,
    isShuffle: isShuffleMedia,
    toggleRepeat,
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
    changeStateMenu,
    tags,
    setTags,
    setContent,
    setMusicContent,
  };

  return (
    <>
      <video
        className="video-container"
        ref={videoRef}
        src={mixUrlWithQuality(src, qualityMedia)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        muted={isMutedMedia}
        loop={isRepeatMedia}
      >
        Tu navegador no admite el elemento de video.
      </video>

      <FullControlMedia {...fullControlMediaProps} />
    </>
  );
};

export default Video;*/
