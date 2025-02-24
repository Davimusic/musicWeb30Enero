// components/simple/video.js
import React, { useEffect, useRef, useState } from 'react';
import FullControlMedia from '../complex/fullControlMedia';

const Video = ({
  id,
  src,
  onClick,
  style,
  className,
  setCurrentTimeMedia,
  currentTimeMedia,
  setComponentInUse,
  componentInUse,
  setIsLoading,
  isVideoFullScreen,
  allMusicProyects = [],
  setContent,
  setIsEndedVideo,
  setMusicContent,
  currentIndex,
  setCurrentIndex,
  isEndendVideo,
  setTags,
  tags,
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
  toggleContentVisibility,
  isContentVisible,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Efecto para inicializar currentIndex cuando cambia la lista de canciones
  useEffect(() => {
    if (allMusicProyects.length > 0) {
      const index = allMusicProyects.findIndex(
        (project) => project.videoPrincipal?.src === src
      );
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [allMusicProyects, src]);

  // Efecto para pausar el video si componentInUse cambia a 'audio'
  useEffect(() => {
    if (componentInUse === "audio" && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [componentInUse]);

  // Efecto para reproducir el video si componentInUse cambia a 'video'
  useEffect(() => {
    if (componentInUse === "video" && videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
    }
  }, [componentInUse]);

  // Función para manejar la actualización del tiempo
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  // Función para manejar el inicio de la reproducción
  const handlePlay = () => {
    setComponentInUse("video");
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = currentTimeMedia;
    }
  };

  // Función para manejar la pausa
  const handlePause = () => {
    setIsPlaying(false);
  };

  // Función para manejar la carga
  const handleWaiting = () => {
    setIsLoading(true);
  };

  // Función para manejar la reproducción
  const handlePlaying = () => {
    setIsLoading(false);
  };

  // Función para obtener el siguiente video
  const getNextVideo = () => {
    if (allMusicProyects.length === 0) return null;

    const projectsWithVideoPrincipal = allMusicProyects.filter(project => project.videoPrincipal);

    if (projectsWithVideoPrincipal.length === 0) return null;

    const nextIndex = (currentIndex + 1) % projectsWithVideoPrincipal.length;
    return projectsWithVideoPrincipal[nextIndex];
  };

  // Función para obtener el video anterior
  const getPreviousVideo = () => {
    if (allMusicProyects.length === 0) return null;

    const projectsWithVideoPrincipal = allMusicProyects.filter(project => project.videoPrincipal);

    if (projectsWithVideoPrincipal.length === 0) return null;

    const previousIndex = (currentIndex - 1 + projectsWithVideoPrincipal.length) % projectsWithVideoPrincipal.length;
    setIsEndedVideo(true);
    return projectsWithVideoPrincipal[previousIndex];
  };

  // Función para manejar el cambio al siguiente video
  const handleNextVideo = () => {
    const nextVideo = getNextVideo();
    if (nextVideo) {
      setContent([nextVideo]);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allMusicProyects.length);
      videoRef.current.src = mixUrlWithQuality(nextVideo.videoPrincipal.src, quality);
      setIsEndedVideo(true);
      videoRef.current.load();
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Función para manejar el cambio al video anterior
  const handlePreviousVideo = () => {
    const previousVideo = getPreviousVideo();
    if (previousVideo) {
      setContent([previousVideo]);
      setCurrentIndex((prevIndex) => (prevIndex - 1 + allMusicProyects.length) % allMusicProyects.length);
      videoRef.current.src = mixUrlWithQuality(previousVideo.videoPrincipal.src, quality);
      videoRef.current.load();
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Función para manejar el final de la reproducción
  const handleEnded = () => {
    videoEndedRef.current = true;
    const nextVideo = getNextVideo();
    if (nextVideo) {
      setContent([nextVideo]);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % allMusicProyects.length);
      videoRef.current.src = mixUrlWithQuality(nextVideo.videoPrincipal.src, quality);
      videoRef.current.load();
      videoRef.current.play();
      setIsPlaying(true);
    }
    setIsEndedVideo(true);
    setCurrentTimeMedia(0);
  };

  // Configurar eventos del video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = mixUrlWithQuality(src, quality);
      videoRef.current.load();

      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('play', handlePlay);
      videoRef.current.addEventListener('pause', handlePause);
      videoRef.current.addEventListener('waiting', handleWaiting);
      videoRef.current.addEventListener('playing', handlePlaying);
      videoRef.current.addEventListener('ended', handleEnded);

      return () => {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        videoRef.current.removeEventListener('play', handlePlay);
        videoRef.current.removeEventListener('pause', handlePause);
        videoRef.current.removeEventListener('waiting', handleWaiting);
        videoRef.current.removeEventListener('playing', handlePlaying);
        videoRef.current.removeEventListener('ended', handleEnded);
      };
    }
  }, [src, quality]);

  // Actualizar currentTimeMedia cuando cambia currentTime
  useEffect(() => {
    setCurrentTimeMedia(currentTime);
  }, [currentTime, setCurrentTimeMedia]);

  // Función para alternar entre play y pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Función para alternar entre silenciar y desilenciar
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Función para manejar el cambio de volumen
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  // Función para abrir el modal de calidad
  const openQualityModal = () => {
    setISShowQuialityModal(true);
  };

  // Función para cerrar el modal de calidad
  const closeQualityModal = () => {
    setISShowQuialityModal(false);
  };

  // Función para cambiar la calidad del video
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    closeQualityModal();
  };

  // Función para formatear el tiempo en minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Función para manejar la búsqueda en el video
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = e.target.value;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  return (
    <FullControlMedia
      audioRef={videoRef}
      src={src}
      isPlaying={isPlaying}
      togglePlayPause={togglePlayPause}
      isShuffle={false} // No aplicable para video
      toggleShuffle={() => {}} // No aplicable para video
      isRepeat={false} // No aplicable para video
      toggleRepeat={() => {}} // No aplicable para video
      handleNextSong={handleNextVideo}
      handlePreviousSong={handlePreviousVideo}
      handleTimeUpdate={handleTimeUpdate}
      handleLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
      handleSeek={handleSeek}
      handleVolumeChange={handleVolumeChange}
      toggleMute={toggleMute}
      handleEnded={handleEnded}
      formatTime={formatTime}
      currentTime={currentTime}
      duration={duration}
      isMuted={isMuted}
      volume={volume}
      buttonColor={'white'}
      showPlayButton={true}
      showVolumeButton={true}
      isModalOpen={isShowQuialityModal}
      openQualityModal={openQualityModal}
      closeQualityModal={closeQualityModal}
      handleQualityChange={handleQualityChange}
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

export default Video;