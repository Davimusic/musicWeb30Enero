import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import TogglePlayPause from '../complex/TogglePlayPause';
import QualityIcon from '../complex/quialityIcon';
import QualitySelectorModal from '../complex/qualitySelectorModal';
import GlassIcon from '../complex/glassIcon';
import SearchTagInDb from '../complex/searchTag';



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
  setMusicContent
}) => {
  const videoRef = useRef(null);
  const videoEndedRef = useRef(false);
  const [quality, setQuality] = useState(25);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const currentTimeMediaRef = useRef(currentTimeMedia);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);

  // Detectar si es un dispositivo móvil y ajustar el breakpoint
  useEffect(() => {
    const checkIfMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsSmallMobile(width <= 543);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Asegurar que componentInUse sea 'video' cuando el componente esté activo
  useEffect(() => {
    setComponentInUse('video');
    return () => {
      setComponentInUse('');
    };
  }, [setComponentInUse]);

  // Forzar componentInUse a 'video' si el video ha terminado y componentInUse cambia a 'audio'
  useEffect(() => {
    if (componentInUse === 'audio' && videoEndedRef.current) {
      setComponentInUse('video');
      videoEndedRef.current = false;
    }
  }, [componentInUse, setComponentInUse]);

  // Actualizar currentTimeMediaRef cuando cambia currentTimeMedia
  useEffect(() => {
    currentTimeMediaRef.current = currentTimeMedia;
  }, [currentTimeMedia]);

  // Pausar el video si componentInUse cambia a 'audio'
  useEffect(() => {
    if (componentInUse === 'audio' && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [componentInUse]);

  // Reproducir el video si componentInUse cambia a 'video'
  useEffect(() => {
    if (componentInUse === 'video' && videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
    }
  }, [componentInUse]);

  // Manejar actualización del tiempo del video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  // Manejar inicio de reproducción
  const handlePlay = () => {
    setComponentInUse('video');
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = currentTimeMediaRef.current;
    }
  };

  // Manejar pausa
  const handlePause = () => {
    setIsPlaying(false);
  };

  // Manejar estado de carga
  const handleWaiting = () => {
    setIsLoading(true);
  };

  // Manejar estado de reproducción
  const handlePlaying = () => {
    setIsLoading(false);
  };

  // Obtener la siguiente canción
  const getNextSong = () => {
    if (allMusicProyects.length === 0) return null;

    const projectsWithAudioPrincipal = allMusicProyects.filter(project => project.videoPrincipal);

    if (projectsWithAudioPrincipal.length === 0) return null;

    const currentProjectIndex = projectsWithAudioPrincipal.findIndex((project) => 
      project.videoPrincipal.src === src
    );

    if (currentProjectIndex === -1) return null;

    const nextProjectIndex = (currentProjectIndex + 1) % projectsWithAudioPrincipal.length;
    const nextProject = projectsWithAudioPrincipal[nextProjectIndex];
    return nextProject;
  };

  // Manejar finalización del video
  const handleEnded = () => {
    videoEndedRef.current = true;
    const nextSong = getNextSong();
    if (nextSong) {
      setContent([nextSong]);
      setComponentInUse('video');
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

  // Alternar entre play y pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Abrir modal de calidad
  const openQualityModal = () => {
    setIsModalOpen(true);
  };

  // Cerrar modal de calidad
  const closeQualityModal = () => {
    setIsModalOpen(false);
  };

  // Cambiar calidad del video
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    closeQualityModal();
  };

  // Formatear tiempo en minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Manejar búsqueda en el video
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = e.target.value;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Verificar si el video es pequeño
  const isSmallVideo = style.width < 100 && style.height < 100;

  // Mostrar controles al entrar con el mouse
  const handleMouseEnter = () => {
    setShowControls(true);
  };

  // Ocultar controles al salir con el mouse
  const handleMouseLeave = () => {
    setShowControls(false);
  };

  // Manejar toques en dispositivos móviles
  const handleTouchStart = (e) => {
    const isControlElement = inputRef.current?.contains(e.target);
    const isSearchInput = e.target.closest('.input-container');

    if (!isControlElement && !isSearchInput) {
      setShowControls(prev => !prev);
    }
  };

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100vh', // Ocupar toda la altura de la pantalla
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'black', // Fondo negro para el contenedor
        overflow: 'hidden', // Evitar desbordamiento
        ...style 
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <video
        ref={videoRef}
        id={id}
        onClick={isSmallVideo ? handlePlay : onClick}
        style={{
          width: componentInUse === 'video' ? '100%' : '0px',
          height: componentInUse === 'video' ? '100%' : '0px', // Ocupar toda la altura
          objectFit: 'cover', // Ajustar el video para cubrir el contenedor
          objectPosition: 'center', // Centrar el video
          borderRadius: '10px',
          opacity: componentInUse === 'video' ? 1 : 0,
          visibility: componentInUse === 'video' ? 'visible' : 'hidden',
          transition: 'opacity 0.3s, visibility 0.3s',
          backgroundColor: 'black', // Fondo negro para áreas no cubiertas
          position: 'absolute', // Posicionar el video de manera absoluta
          top: 0,
          left: 0,
        }}
        className={className}
      >
        <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
        Tu navegador no admite el elemento de video.
      </video>

      {isVideoFullScreen && (
        <div ref={inputRef}>
          <div className="input-container" 
            style={{ 
              position: 'fixed',
              top: '10px',  
              left: '50%', 
              transform: 'translateX(-50%)',  
              display: showControls ? 'flex' : 'none', 
              alignItems: 'center', 
              backgroundColor: 'rgba(0, 0, 0, 0.5)', 
              padding: '5px', 
              borderRadius: '10px',
              width: 'auto',
              zIndex: 1000,
              pointerEvents: 'auto',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <SearchTagInDb 
              setContent={setContent} 
              setMusicContent={setMusicContent}
              onInputInteraction={() => setShowControls(true)}
            />
          </div>

          <div className="progress-bar" 
            style={{
              opacity: showControls ? 1 : 0,
              transition: 'opacity 0.3s',
              zIndex: 999,
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              right: '20px',
              ...(isSmallMobile && {
                flexDirection: 'column',
                alignItems: 'stretch'
              })
            }}
          >
            <GlassIcon/>
            <span style={{ color: '#2bc6c8' }}>{formatTime(currentTime)}</span>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="seek-slider"
                style={{
                  background: `linear-gradient(to right, #2bc6c8 ${
                    (currentTime / (duration || 1)) * 100
                  }%, #060606 ${(currentTime / (duration || 1)) * 100}%)`,
                }}
              />
            </div>
            <span style={{ color: '#2bc6c8' }}>{formatTime(duration)}</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <TogglePlayPause
                size={40}
                isPlaying={isPlaying}
                onToggle={togglePlayPause}
              />
              <QualityIcon size={30} onClick={openQualityModal} />
            </div>
          </div>
        </div>
      )}

      <QualitySelectorModal 
        isOpen={isModalOpen} 
        onClose={closeQualityModal} 
        onQualityChange={handleQualityChange} 
      />

      <style jsx>{`
        .progress-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: rgba(0, 0, 0, 0.7);
          padding: 10px;
          border-radius: 10px;
          backdrop-filter: blur(5px);
        }

        .slider-container {
          flex: 1;
          min-width: ${isSmallMobile ? '100%' : '120px'};
        }

        .seek-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          background: transparent;
          outline: none;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        .seek-slider:hover {
          opacity: 1;
        }

        .seek-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          background: #2bc6c8;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .seek-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};










// Estilos
const styles = {
  controlsContainer: {
    position: 'absolute',
    bottom: '80px', // Ajustar posición para no solapar con la barra de progreso
    right: '20px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  qualityOptionButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Video;






/**
import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import TogglePlayPause from '../complex/TogglePlayPause';
import QualityIcon from '../complex/quialityIcon';
import QualitySelectorModal from '../complex/qualitySelectorModal';
import GlassIcon from '../complex/glassIcon';
import SearchTagInDb from '../complex/searchTag';


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
  setMusicContent
}) => {
  const videoRef = useRef(null);
  const videoEndedRef = useRef(false);
  const [quality, setQuality] = useState(25);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const currentTimeMediaRef = useRef(currentTimeMedia);
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es un dispositivo móvil
  useEffect(() => {
      const checkIfMobile = () => {
          const isMobileDevice = window.innerWidth <= 768;
          setIsMobile(isMobileDevice);
      };

      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);

      return () => {
          window.removeEventListener('resize', checkIfMobile);
      };
  }, []);

  // Asegurar que componentInUse sea 'video' cuando el componente esté activo
  useEffect(() => {
      setComponentInUse('video');
      return () => {
          setComponentInUse('');
      };
  }, [setComponentInUse]);

  // Forzar componentInUse a 'video' si el video ha terminado y componentInUse cambia a 'audio'
  useEffect(() => {
      if (componentInUse === 'audio' && videoEndedRef.current) {
          setComponentInUse('video');
          videoEndedRef.current = false;
      }
  }, [componentInUse, setComponentInUse]);

  const handleFocus = () => {
      setShowControls(true);
  };

  const handleBlur = () => {
      if (document.activeElement !== inputRef.current) {
          setShowControls(false);
      }
  };

  useEffect(() => {
      currentTimeMediaRef.current = currentTimeMedia;
  }, [currentTimeMedia]);

  useEffect(() => {
      if (componentInUse === 'audio' && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
      }
  }, [componentInUse]);

  useEffect(() => {
      if (componentInUse === 'video' && videoRef.current && videoRef.current.paused) {
          videoRef.current.play();
      }
  }, [componentInUse]);

  const handleTimeUpdate = () => {
      if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          setDuration(videoRef.current.duration);
      }
  };

  const handlePlay = () => {
      setComponentInUse('video');
      setIsPlaying(true);
      if (videoRef.current) {
          videoRef.current.currentTime = currentTimeMediaRef.current;
      }
      videoRef.current.style.width = '100%';
      videoRef.current.style.height = '100%';
  };

  const handlePause = () => {
      setIsPlaying(false);
  };

  const handleWaiting = () => {
      setIsLoading(true);
  };

  const handlePlaying = () => {
      setIsLoading(false);
  };

  const getNextSong = () => {
      if (allMusicProyects.length === 0) return null;

      const projectsWithAudioPrincipal = allMusicProyects.filter(project => project.videoPrincipal);

      if (projectsWithAudioPrincipal.length === 0) return null;

      const currentProjectIndex = projectsWithAudioPrincipal.findIndex((project) => 
          project.videoPrincipal.src === src
      );

      if (currentProjectIndex === -1) return null;

      const nextProjectIndex = (currentProjectIndex + 1) % projectsWithAudioPrincipal.length;
      const nextProject = projectsWithAudioPrincipal[nextProjectIndex];
      return nextProject;
  };

  const handleEnded = () => {
      videoEndedRef.current = true;
      const nextSong = getNextSong();
      if (nextSong) {
          setContent([nextSong]);
          setComponentInUse('video');
      }
      setIsEndedVideo(true);
      setCurrentTimeMedia(0)
  };

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

  useEffect(() => {
      setCurrentTimeMedia(currentTime);
  }, [currentTime, setCurrentTimeMedia]);

  const togglePlayPause = () => {
      if (videoRef.current) {
          if (videoRef.current.paused) {
              videoRef.current.play();
          } else {
              videoRef.current.pause();
          }
      }
  };

  const openQualityModal = () => {
      setIsModalOpen(true);
  };

  const closeQualityModal = () => {
      setIsModalOpen(false);
  };

  const handleQualityChange = (newQuality) => {
      setQuality(newQuality);
      closeQualityModal();
  };

  const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e) => {
      if (videoRef.current) {
          const seekTime = e.target.value;
          videoRef.current.currentTime = seekTime;
          setCurrentTime(seekTime);
      }
  };

  const isSmallVideo = style.width < 100 && style.height < 100;

  const handleMouseEnter = () => {
      setShowControls(true);
  };

  const handleMouseLeave = () => {
      setShowControls(false);
  };

  const handleTouchStart = (e) => {
      if (!inputRef.current.contains(e.target)) {
          setShowControls(!showControls);
      }
  };

  return (
      <div 
          style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              ...style 
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
      >
          <video
              ref={videoRef}
              id={id}
              onClick={isSmallVideo ? handlePlay : onClick}
              style={{
                  width: componentInUse === 'video' ? '100%' : '0px',
                  height: componentInUse === 'video' ? (isMobile ? '100vh' : 'auto') : '0px',
                  objectFit: isMobile ? 'cover' : 'contain',
                  borderRadius: '10px',
                  opacity: componentInUse === 'video' ? 1 : 0,
                  visibility: componentInUse === 'video' ? 'visible' : 'hidden',
                  transition: 'opacity 0.3s, visibility 0.3s',
                  backgroundColor: isMobile ? 'transparent' : 'black',
              }}
              className={className}
          >
              <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
              Tu navegador no admite el elemento de video.
          </video>

          {isVideoFullScreen && (
              <>
                  <div className="input-container" style={{ 
                      position: 'fixed',
                      top: '10px',  
                      left: '50%', 
                      transform: 'translateX(-50%)',  
                      display: showControls ? 'flex' : 'none', 
                      alignItems: 'center', 
                      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                      padding: '5px', 
                      borderRadius: '10px',
                      width: 'auto',
                      zIndex: 1000,
                  }} onClick={(e) => e.stopPropagation()}>
                      <SearchTagInDb setContent={setContent} setMusicContent={setMusicContent}/>
                  </div>

                  <div className="progress-bar" style={{opacity: showControls ? 1 : 0, transition: 'opacity 0.3s' }}>
                      <GlassIcon/>
                      <span style={{ color: '#2bc6c8' }}>{formatTime(currentTime)}</span>
                      <div className="slider-container">
                          <input
                              type="range"
                              min="0"
                              max={duration || 100}
                              value={currentTime}
                              onChange={handleSeek}
                              className="seek-slider"
                              style={{
                                  background: `linear-gradient(to right, #2bc6c8 ${
                                      (currentTime / (duration || 1)) * 100
                                  }%, #060606 ${(currentTime / (duration || 1)) * 100}%)`,
                              }}
                          />
                      </div>
                      <span style={{ color: '#2bc6c8' }}>{formatTime(duration)}</span>
                      <TogglePlayPause
                          size={40}
                          isPlaying={isPlaying}
                          onToggle={togglePlayPause}
                      />
                      <QualityIcon size={30} onClick={openQualityModal} />
                  </div>
              </>
          )}

          <QualitySelectorModal isOpen={isModalOpen} onClose={closeQualityModal} onQualityChange={handleQualityChange} />

          <style jsx>{`
              .progress-bar {
                  position: absolute;
                  bottom: 20px;
                  left: 20px;
                  right: 20px;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  background-color: rgba(0, 0, 0, 0.5);
                  padding: 10px;
                  border-radius: 10px;
              }

              .slider-container {
                  flex: 1;
                  position: relative;
              }

              .seek-slider {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 100%;
                  height: 4px;
                  outline: none;
                  opacity: 0.7;
                  transition: opacity 0.2s;
                  border-radius: 2px;
              }

              .seek-slider:hover {
                  opacity: 1;
              }

              .seek-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 12px;
                  height: 12px;
                  background: #2bc6c8;
                  border-radius: 50%;
                  cursor: pointer;
              }

              .seek-slider::-moz-range-thumb {
                  width: 12px;
                  height: 12px;
                  background: #2bc6c8;
                  border-radius: 50%;
                  cursor: pointer;
              }
          `}</style>
      </div>
  );
};




// Estilos
const styles = {
  controlsContainer: {
    position: 'absolute',
    bottom: '80px', // Ajustar posición para no solapar con la barra de progreso
    right: '20px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  qualityOptionButton: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Video;
 */










