import React, { useRef, useState, useEffect } from 'react';
import FullControlMedia from '../complex/fullControlMedia';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import {
  togglePlayPause,
  handleEnded,
  handleTimeUpdate,
  handleLoadedMetadata,
  handleSeek,
  handleVolumeChange,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
  getNextMedia,
  getPreviousMedia,
  formatTime,
} from '@/functions/music/mediaUtils';

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
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const playAudio = () => {
    audioRef.current.play().catch((error) => {
      console.error('Error al reproducir el audio:', error);
    });
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = mixUrlWithQuality(src, qualityMedia);
      audioRef.current.currentTime = currentTimeMedia;
      audioRef.current.volume = volumeMedia;
      playAudio();
    }
  }, [qualityMedia]);

  useEffect(() => {
    if (!isFirstTimeLoading && componentInUse === 'audio') {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTimeMedia;
        playAudio();
      }
    } else {
      setIsFirstTimeLoading(false);
    }
  }, [src]);

  useEffect(() => {
    if (componentInUse === 'audio') {
      if (audioRef.current) {
        audioRef.current.currentTime = currentTimeMedia;
        playAudio();
        audioRef.current.volume = volumeMedia;
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [componentInUse]);

  const handleNextSong = () => {
    const nextSong = getNextMedia(allMusicProyects, currentIndex, isShuffleMedia);
    if (nextSong) {
      setContent([nextSong]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.audioPrincipal?.src === nextSong.audioPrincipal.src
        )
      );
      setCurrentTimeMedia(0);
    }
  };

  const handlePreviousSong = () => {
    const previousSong = getPreviousMedia(allMusicProyects, currentIndex, isShuffleMedia);
    if (previousSong) {
      setContent([previousSong]);
      setCurrentIndex(
        allMusicProyects.findIndex(
          (project) => project.audioPrincipal?.src === previousSong.audioPrincipal.src
        )
      );
      setCurrentTimeMedia(0);
    }
  };

  const fullControlMediaProps = {
    isPlaying,
    togglePlayPause: () => togglePlayPause(isPlaying, setComponentInUse, 'audio'),
    handleNextSong,
    handlePreviousSong,
    handleSeek: (e) => handleSeek(e, audioRef, setCurrentTimeMedia),
    handleVolumeChange: (e) =>
      handleVolumeChange(e, setVolumeMedia, audioRef, isMutedMedia, setIsMutedMedia),
    toggleMute: () => toggleMute(audioRef, isMutedMedia, setIsMutedMedia),
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
    toggleShuffle: () => toggleShuffle(isShuffleMedia, setIsShuffleMedia, isRepeatMedia, setIsRepeatMedia),
    isShuffle: isShuffleMedia,
    toggleRepeat: () => toggleRepeat(isShuffleMedia, setIsShuffleMedia, isRepeatMedia, setIsRepeatMedia),
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
      <audio
        ref={audioRef}
        src={mixUrlWithQuality(src, qualityMedia)}
        onTimeUpdate={() => handleTimeUpdate(audioRef, setCurrentTimeMedia)}
        onLoadedMetadata={() => handleLoadedMetadata(audioRef, setDuration)}
        onEnded={() => handleEnded(isRepeatMedia, playAudio, handleNextSong, setCurrentTimeMedia)}
        onLoadStart={() => setIsLoadingMedia(true)} // Establece isLoadingMedia en true cuando comienza la carga
        onCanPlay={() => setIsLoadingMedia(false)} // Establece isLoadingMedia en false cuando el audio está listo para reproducirse
        onWaiting={() => setIsLoadingMedia(true)} // Establece isLoadingMedia en true cuando el audio está esperando datos (buffering)
        onPlaying={() => setIsLoadingMedia(false)} // Establece isLoadingMedia en false cuando el audio continúa reproduciéndose
        muted={isMutedMedia}
        loop={isRepeatMedia}
      >
        Tu navegador no admite el elemento de audio.
      </audio>

      <FullControlMedia {...fullControlMediaProps} />
    </>
  );
};

export default Audio;






