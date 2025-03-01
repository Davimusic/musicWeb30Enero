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

  const isMobile = /Mobile|iPhone|iPad|iPod|Android|BlackBerry|Windows Phone|Opera Mini|IEMobile|Silk/i.test(navigator.userAgent);


  // Usar el hook para controlar la visibilidad
  const { isVisible, showControls } = UseControlVisibility(isMobile);

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error('Error al reproducir el video:', error);
      });
      setIsPlaying(true);
    }
  };

  // Mostrar controles al interactuar con el video
  const handleVideoInteraction = () => {
    showControls();
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
        onClick={handleVideoInteraction} // Mostrar controles al hacer clic
        onTouchStart={handleVideoInteraction} // Mostrar controles al tocar en móvil
      >
        Tu navegador no admite el elemento de video.
      </video>

      {isVisible && <FullControlMedia {...fullControlMediaProps} />}
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
