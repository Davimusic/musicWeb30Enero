// src/components/Audio.js

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
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={mixUrlWithQuality(src, qualityMedia)}
        onTimeUpdate={() => handleTimeUpdate(audioRef, setCurrentTimeMedia)}
        onLoadedMetadata={() => handleLoadedMetadata(audioRef, setDuration)}
        onEnded={() => handleEnded(isRepeatMedia, playAudio, handleNextSong, setCurrentTimeMedia)}
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






/**
import React, { useRef, useState, useEffect } from 'react';
import MediaControl from '../complex/mediaControl';
import FullControlMedia from '../complex/fullControlMedia';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';

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

  const togglePlayPause = () => {
    if (isPlaying) {
      setComponentInUse('');
    } else {
      setComponentInUse('audio');
    }
  };

  const handleEnded = () => {
    if (isRepeatMedia) {
      playAudio();
    } else {
      handleNextSong();
    }
    setCurrentTimeMedia(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTimeMedia(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTimeMedia(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeMedia(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (isMutedMedia && newVolume > 0) {
      setIsMutedMedia(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMutedMedia;
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

  const getNextSong = () => {
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

  const getPreviousSong = () => {
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

  const handleNextSong = () => {
    const nextSong = getNextSong();
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
    const previousSong = getPreviousSong();
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const fullControlMediaProps = {
    isPlaying,
    togglePlayPause,
    handleNextSong,
    handlePreviousSong,
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
      <audio
        ref={audioRef}
        src={mixUrlWithQuality(src, qualityMedia)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
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
 */










