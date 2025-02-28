import React, { useEffect, useRef, useState } from 'react';
import FullControlMedia from '../complex/fullControlMedia';
import '../../estilos/music/video.css'
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
  openQualityModal
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  //const [isRepeat, setIsRepeat] = useState(false);
  //const [isShuffle, setIsShuffle] = useState(false);
  
  // Función para manejar la reproducción del video
  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    console.log(qualityMedia);
    console.log(mixUrlWithQuality(src, qualityMedia));
    if (videoRef.current) {
      videoRef.current.src = mixUrlWithQuality(src, qualityMedia);
      videoRef.current.load();
      videoRef.current.currentTime = currentTimeMedia; // Aplicar el tiempo actual
      videoRef.current.volume = volumeMedia
      playVideo();
    }
  }, [qualityMedia]);

  useEffect(() => {
    if (componentInUse === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTimeMedia; // Aplicar el tiempo actual
        playVideo();
        videoRef.current.volume = volumeMedia
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
        videoRef.current.currentTime = currentTimeMedia; // Aplicar el tiempo actual
        playVideo();
      }
    }
  }, [src]);

  useEffect(() => {
    console.log(volumeMedia);
    
  }, [volumeMedia]);

  /*/ Efecto para manejar cambios en `src`
  useEffect(() => {
    if (componentInUse === 'video') {
      console.log('deberia');
      
      if (videoRef.current) {
        videoRef.current.src = src;
        videoRef.current.load();
        playVideo()
      }
    }
  }, [src]);

  

  // Efecto para manejar cambios en `componentInUse`
  useEffect(() => {
    if (componentInUse === 'video' && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
      setIsPlaying(true);
    } else if (componentInUse !== 'video') {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [componentInUse]);*/

  // Función para alternar entre play y pause
  const togglePlayPause = () => {
    if (isPlaying) {
      // Pausar el video y desactivar el componente
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setComponentInUse('');
      setIsPlaying(false);
    } else {
      // Activar el componente y reproducir el video
      setComponentInUse('video');
      setIsPlaying(true);
    }
  };

  // Función para manejar el final de la reproducción
  const handleEnded = () => {
    if (isRepeatMedia) {
      //videoRef.current.currentTime = 0;
      playVideo();
    } else {
      handleNextVideo();
    }
    setCurrentTimeMedia(0)
  };

  // Función para manejar la actualización del tiempo
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTimeMedia(videoRef.current.currentTime);
    }
  };

  // Función para manejar la carga de metadatos
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Función para manejar la búsqueda en la barra de progreso
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = parseFloat(e.target.value);
      videoRef.current.currentTime = seekTime;
      setCurrentTimeMedia(seekTime);
    }
  };

  // Función para manejar el cambio de volumen
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

  // Función para alternar el silencio
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMutedMedia;
      setIsMutedMedia(!isMutedMedia);
    }
  };

  // Función para alternar el modo shuffle
  const toggleShuffle = () => {
    if (isRepeatMedia) {
      setIsRepeatMedia(false);
    }
    setIsShuffleMedia(!isShuffleMedia);
  };

  // Función para alternar el modo repeat
  const toggleRepeat = () => {
    if (isShuffleMedia) {
      setIsShuffleMedia(false);
    }
    setIsRepeatMedia(!isRepeatMedia);
  };

  // Función para obtener el siguiente video
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

  // Función para obtener el video anterior
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

  // Función para manejar el cambio al siguiente video
  const handleNextVideo = () => {
    const nextVideo = getNextVideo();
    if (nextVideo) {
      setContent([nextVideo]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.videoPrincipal?.src === nextVideo.videoPrincipal.src
        )
      );
      setCurrentTimeMedia(0)
    }
  };

  // Función para manejar el cambio al video anterior
  const handlePreviousVideo = () => {
    const previousVideo = getPreviousVideo();
    if (previousVideo) {
      setContent([previousVideo]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.videoPrincipal?.src === previousVideo.videoPrincipal.src
        )
      );
      setCurrentTimeMedia(0)
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
      {/* Elemento de video */}
      <video className="video-container"
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

      {/* FullControlMedia con MediaControl */}
      <FullControlMedia
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        handleNextSong={handleNextVideo}
        handlePreviousSong={handlePreviousVideo}
        handleSeek={handleSeek}
        handleVolumeChange={handleVolumeChange}
        toggleMute={toggleMute}
        formatTime={formatTime}
        currentTime={currentTimeMedia}
        duration={duration}
        isMuted={isMutedMedia}
        volume={volumeMedia}
        isModalOpen={isModalOpen}
        openQualityModal={openQualityModal}
        closeQualityModal={() => setIsModalOpen(false)}
        
        quality={qualityMedia}
        isRepeat={isRepeatMedia}
        toggleShuffle={toggleShuffle}
        isShuffle={isShuffleMedia}
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
        tags={tags}
        setTags={setTags}
        setContent={setContent}
        setMusicContent={setMusicContent}
      />
    </>
  );
};

export default Video;