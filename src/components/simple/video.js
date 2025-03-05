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
  const backgroundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const previousTimeRef = useRef(0);
  const userInteractionRef = useRef(false);
  const timeoutRef = useRef(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  const isMobile = /Mobile|iPhone|iPad|iPod|Android|BlackBerry|Windows Phone|Opera Mini|IEMobile|Silk/i.test(navigator.userAgent);

  const { isVisible, showControls } = UseControlVisibility(isMobile);

  // Captura el frame actual del video y lo usa como fondo
  const captureFrame = () => {
    if (videoRef.current && backgroundRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      backgroundRef.current.src = canvas.toDataURL();
    }
  };

  // Actualiza las dimensiones del video
  const updateVideoDimensions = () => {
    if (videoRef.current) {
      const { videoWidth, videoHeight } = videoRef.current;
      setVideoDimensions({ width: videoWidth, height: videoHeight });
    }
  };

  const showUIElements = (showControlsFlag = true) => {
    if (showControlsFlag) setIsControlsVisible(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!isMenuOpen) {
      timeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 5000);
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

  // Captura el frame cuando el video está listo para reproducirse
  useEffect(() => {
    if (videoRef.current) {
      const handleCanPlay = () => {
        captureFrame();
        updateVideoDimensions();
      };
      videoRef.current.addEventListener('canplay', handleCanPlay);
      return () => {
        if (videoRef.current) { // Check if videoRef.current is not null
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        }
      };
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
    <div
      className="video-wrapper"
      onMouseEnter={!isMobile ? () => setIsControlsVisible(true) : undefined}
      onMouseLeave={!isMobile ? () => setIsControlsVisible(false) : undefined}
      onClick={handleVideoInteraction}
      onTouchStart={(e) => {
        handleVideoInteraction();
        handleTouchStart(e);
        handleDoubleTap();
      }}
    >
      {/* Fondo difuminado */}
      <img
        ref={backgroundRef}
        className="video-background"
        alt="Video background"
      />

      {/* Video principal */}
      <video
        className="video-container"
        ref={videoRef}
        src={mixUrlWithQuality(src, qualityMedia)}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onLoadStart={() => setIsLoadingMedia(true)}
        onCanPlay={() => setIsLoadingMedia(false)}
        onWaiting={() => setIsLoadingMedia(true)}
        onPlaying={() => setIsLoadingMedia(false)}
        muted={isMutedMedia}
        loop={isRepeatMedia}
        style={{
          width: videoDimensions.width > videoDimensions.height ? '100%' : 'auto',
          height: videoDimensions.height > videoDimensions.width ? '100%' : 'auto',
          objectFit: 'cover',
        }}
      >
        Tu navegador no admite el elemento de video.
      </video>

      {/* Controles */}
      {isMobile && isControlsVisible && (
        <button
          className="center-play-button"
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

      <div className={`controls-container ${isControlsVisible ? 'visible' : ''}`}>
        <FullControlMedia {...fullControlMediaProps} />
      </div>
    </div>
  );
};

export default Video;





