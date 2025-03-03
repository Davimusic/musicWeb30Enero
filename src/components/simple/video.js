import React, { useEffect, useRef, useState } from 'react';
import FullControlMedia from '../complex/fullControlMedia';
import '../../estilos/music/video.css';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import UseControlVisibility from '../complex/useControlVisibility';
import TogglePlayPause from '../complex/TogglePlayPause';

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
  setIsMenuOpen,
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
  openUpdateBackgroundColor,
  setIsLoadingMedia, 
  setIsLike,
  isLike,
  isHybridView
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const previousTimeRef = useRef(0);
  const userInteractionRef = useRef(false);
  const timeoutRef = useRef(null);

  const isMobile = /Mobile|iPhone|iPad|iPod|Android|BlackBerry|Windows Phone|Opera Mini|IEMobile|Silk/i.test(navigator.userAgent);

  const { isVisible, showControls } = UseControlVisibility(isMobile);

  const showUIElements = (showControlsFlag = true) => {
    if (showControlsFlag) setIsControlsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isMenuOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2000);
    }
  };

  const handleTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;

    if (currentTime - previousTimeRef.current >= 2) {
      showUIElements();
      userInteractionRef.current = false;
    }
    previousTimeRef.current = currentTime;
    setCurrentTimeMedia(currentTime);
  };

  useEffect(() => {
    if (isMenuOpen) {
      showUIElements();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      setIsControlsVisible(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    showUIElements();
  }, [isLike]);

  const handleVideoInteraction = () => {
    showControls();
    showUIElements();
  };

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

  const togglePlayPause = (fromCenterButton = false, e) => {
    if (e) e.stopPropagation();
    userInteractionRef.current = !fromCenterButton;
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
    if (!fromCenterButton) showUIElements();
  };

  const handleEnded = () => {
    if (isRepeatMedia) {
      playVideo();
    } else {
      handleNextVideo();
    }
    setCurrentTimeMedia(0);
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
    showUIElements();
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
    showUIElements();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMutedMedia;
      setIsMutedMedia(!isMutedMedia);
    }
    showUIElements();
  };

  const toggleShuffle = () => {
    if (isRepeatMedia) {
      setIsRepeatMedia(false);
    }
    setIsShuffleMedia(!isShuffleMedia);
    showUIElements();
  };

  const toggleRepeat = () => {
    if (isShuffleMedia) {
      setIsShuffleMedia(false);
    }
    setIsRepeatMedia(!isRepeatMedia);
    showUIElements();
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
    showUIElements();
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
    showUIElements();
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      alert('Me gusta');
    }
    setLastTap(now);
  };

  const handleTouchStart = (e) => {
    setTouchStartY(e.touches[0].clientY);
  };

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
    openUpdateBackgroundColor,
    closeQualityModal: () => setIsModalOpen(false),
    quality: qualityMedia,
    isRepeat: isRepeatMedia,
    toggleShuffle,
    isShuffle: isShuffleMedia,
    toggleRepeat,
    setIsMenuOpen,
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
    currentIndex,
    setIsLike,
    isLike,
    isHybridView
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
        onLoadStart={() => setIsLoadingMedia(true)} // Establece isLoadingMedia en true cuando comienza la carga
        onCanPlay={() => setIsLoadingMedia(false)} // Establece isLoadingMedia en false cuando el audio está listo para reproducirse
        onWaiting={() => setIsLoadingMedia(true)} // Establece isLoadingMedia en true cuando el audio está esperando datos (buffering)
        onPlaying={() => setIsLoadingMedia(false)} // Establece isLoadingMedia en false cuando el audio continúa reproduciéndose
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

      {isMobile && isControlsVisible && (
        
        <button
          className="center-play-button"
          //onClick={(e) => togglePlayPause(true, e)}
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
          
          <TogglePlayPause isPlaying={isPlaying} size={50} onToggle={(e) => togglePlayPause(true, e)}/> 
        </button>
      )}

      {isControlsVisible && <FullControlMedia {...fullControlMediaProps} />}
    </>
  );
};

export default Video;






