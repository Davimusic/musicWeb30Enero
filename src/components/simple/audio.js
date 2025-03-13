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

  // Nuevo estado para la transcripción de la letra
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Inicializar el reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Tu navegador no soporta la Web Speech API.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true; // Reconocimiento continuo
    recognitionRef.current.interimResults = true; // Resultados provisionales
    recognitionRef.current.lang = 'es-ES'; // Idioma español

    recognitionRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Error en el reconocimiento de voz:', event.error);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    console.log(content);
    
  }, [content]);

  // Iniciar/detener el reconocimiento de voz cuando el audio se reproduce/pausa
  useEffect(() => {
    if (isPlaying && recognitionRef.current) {
      recognitionRef.current.start();
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isPlaying]);

  const playAudio = () => {
    audioRef.current.play().catch((error) => {
      console.error('Error al reproducir el audio:', error);
    });
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioRef.current.pause();
    setIsPlaying(false);
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
        pauseAudio();
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
    togglePlayPause: () => {
      if (isPlaying) {
        pauseAudio();
      } else {
        playAudio();
      }
    },
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
        onLoadStart={() => setIsLoadingMedia(true)}
        onCanPlay={() => setIsLoadingMedia(false)}
        onWaiting={() => setIsLoadingMedia(true)}
        onPlaying={() => setIsLoadingMedia(false)}
        muted={isMutedMedia}
        loop={isRepeatMedia}
      >
        Tu navegador no admite el elemento de audio.
      </audio>

      <FullControlMedia {...fullControlMediaProps} />

      {/* Nuevo: Mostrar la transcripción de la letra en tiempo real */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '300px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          backgroundColor: '#fff',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Letra en Tiempo Real</h3>
        <p>{transcript || 'Habla o reproduce audio para ver la letra...'}</p>
      </div>
    </>
  );
};

export default Audio;






