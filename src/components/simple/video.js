import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import TogglePlayPause from '../complex/TogglePlayPause';
import QualityIcon from '../complex/quialityIcon';
import QualitySelectorModal from '../complex/qualitySelectorModal';
import GlassIcon from '../complex/glassIcon';

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
  isVideoFullScreen
}) => {
  const videoRef = useRef(null);
  const [quality, setQuality] = useState(25);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const currentTimeMediaRef = useRef(currentTimeMedia);

  // Actualizar la referencia de currentTimeMedia cuando cambia
  useEffect(() => {
    currentTimeMediaRef.current = currentTimeMedia;
  }, [currentTimeMedia]);

  // Pausar el video si el componente en uso es 'audio'
  useEffect(() => {
    console.log(componentInUse);
    
    if (componentInUse === 'audio' && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [componentInUse]);

  // Reproducir el video si componentInUse es 'video'
  useEffect(() => {
    if (componentInUse === 'video' && videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
    }
  }, [componentInUse]);

  // Función para manejar la actualización del tiempo del video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  // Función para manejar el evento de inicio de reproducción del video
  const handlePlay = () => {
    setComponentInUse('video');
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = currentTimeMediaRef.current;
    }
    videoRef.current.style.width = '100%';
    videoRef.current.style.height = '100%';
  };

  // Función para manejar el evento de pausa del video
  const handlePause = () => {
    setComponentInUse('');
    setIsPlaying(false);
  };

  // Función para manejar el evento de espera (cargando)
  const handleWaiting = () => {
    setIsLoading(true);
  };

  // Función para manejar el evento de reproducción (ya no está cargando)
  const handlePlaying = () => {
    setIsLoading(false);
  };

  // Configurar el video y los eventos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = mixUrlWithQuality(src, quality);
      videoRef.current.load();

      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('play', handlePlay);
      videoRef.current.addEventListener('pause', handlePause);
      videoRef.current.addEventListener('waiting', handleWaiting);
      videoRef.current.addEventListener('playing', handlePlaying);

      return () => {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        videoRef.current.removeEventListener('play', handlePlay);
        videoRef.current.removeEventListener('pause', handlePause);
        videoRef.current.removeEventListener('waiting', handleWaiting);
        videoRef.current.removeEventListener('playing', handlePlaying);
      };
    }
  }, [src, quality]);

  // Actualizar currentTimeMedia cuando currentTime cambia
  useEffect(() => {
    setCurrentTimeMedia(currentTime);
  }, [currentTime, setCurrentTimeMedia]);

  // Función para reproducir o pausar el video
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Función para abrir el modal de calidad
  const openQualityModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal de calidad
  const closeQualityModal = () => {
    setIsModalOpen(false);
  };

  // Función para cambiar la calidad del video
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    closeQualityModal();
  };

  // Formatear el tiempo en minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Función para manejar el cambio en el control deslizante
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = e.target.value;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Verifica si el tamaño del video es menor de 100px
  const isSmallVideo = style.width < 100 && style.height < 100;

  // Función para manejar el hover o el toque en el video
  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    setShowControls(false);
  };

  const handleTouchStart = () => {
    setShowControls(!showControls);
  };

  return (
    <div 
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      <video
        ref={videoRef}
        id={id}
        onClick={isSmallVideo ? handlePlay : onClick}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
        className={className}
      >
        <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
        Tu navegador no admite el elemento de video.
      </video>
  
      {isVideoFullScreen && (
        <>
          <div className="input-container" style={{ 
    position: 'absolute', 
    top: '10px',  
    left: '50%', 
    transform: 'translateX(-50%)',  
    display: showControls ? 'flex' : 'none', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    padding: '5px', 
    borderRadius: '10px',
    width: 'auto',
}} onClick={(e) => e.stopPropagation()}>
    <input type="text" placeholder="Search" style={{
        width: '80vw',
        padding: '5px',
        border: 'none',
        borderRadius: '10px',
        outline: 'none',
    }} onClick={(e) => e.stopPropagation()} />
    <GlassIcon style={{ marginLeft: '5px', color: '#fff' }} onClick={(e) => e.stopPropagation()} />
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







/**
import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';
import TogglePlayPause from '../complex/TogglePlayPause';
import QualityIcon from '../complex/quialityIcon';
import QualitySelectorModal from '../complex/qualitySelectorModal';

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
  isVideoFullScreen
}) => {
  const videoRef = useRef(null);
  const [quality, setQuality] = useState(25);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentTimeMediaRef = useRef(currentTimeMedia);

  // Actualizar la referencia de currentTimeMedia cuando cambia
  useEffect(() => {
    currentTimeMediaRef.current = currentTimeMedia;
  }, [currentTimeMedia]);

  // Pausar el video si el componente en uso es 'audio'
  useEffect(() => {
    console.log(componentInUse);
    
    if (componentInUse === 'audio' && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [componentInUse]);

  // Reproducir el video si componentInUse es 'video'
  useEffect(() => {
    if (componentInUse === 'video' && videoRef.current && videoRef.current.paused) {
      videoRef.current.play();
    }
  }, [componentInUse]);

  // Función para manejar la actualización del tiempo del video
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  // Función para manejar el evento de inicio de reproducción del video
  const handlePlay = () => {
    setComponentInUse('video');
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = currentTimeMediaRef.current;
    }
    videoRef.current.style.width = '100%';
    videoRef.current.style.height = '100%';
  };

  // Función para manejar el evento de pausa del video
  const handlePause = () => {
    setComponentInUse('');
    setIsPlaying(false);
  };

  // Función para manejar el evento de espera (cargando)
  const handleWaiting = () => {
    setIsLoading(true);
  };

  // Función para manejar el evento de reproducción (ya no está cargando)
  const handlePlaying = () => {
    setIsLoading(false);
  };

  // Configurar el video y los eventos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.src = mixUrlWithQuality(src, quality);
      videoRef.current.load();

      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      videoRef.current.addEventListener('play', handlePlay);
      videoRef.current.addEventListener('pause', handlePause);
      videoRef.current.addEventListener('waiting', handleWaiting);
      videoRef.current.addEventListener('playing', handlePlaying);

      return () => {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        videoRef.current.removeEventListener('play', handlePlay);
        videoRef.current.removeEventListener('pause', handlePause);
        videoRef.current.removeEventListener('waiting', handleWaiting);
        videoRef.current.removeEventListener('playing', handlePlaying);
      };
    }
  }, [src, quality]);

  // Actualizar currentTimeMedia cuando currentTime cambia
  useEffect(() => {
    setCurrentTimeMedia(currentTime);
  }, [currentTime, setCurrentTimeMedia]);

  // Función para reproducir o pausar el video
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  // Función para abrir el modal de calidad
  const openQualityModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal de calidad
  const closeQualityModal = () => {
    setIsModalOpen(false);
  };

  // Función para cambiar la calidad del video
  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    closeQualityModal();
  };

  // Formatear el tiempo en minutos y segundos
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Función para manejar el cambio en el control deslizante
  const handleSeek = (e) => {
    if (videoRef.current) {
      const seekTime = e.target.value;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Verifica si el tamaño del video es menor de 100px
  const isSmallVideo = style.width < 100 && style.height < 100;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <video
        ref={videoRef}
        id={id}
        onClick={isSmallVideo ? handlePlay : onClick}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
        className={className}
      >
        <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
        Tu navegador no admite el elemento de video.
      </video>

      {isVideoFullScreen && (
        <div className="progress-bar">
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
          <div style={styles.controlsContainer}>
          <TogglePlayPause
            size={40}
            isPlaying={isPlaying}
            onToggle={togglePlayPause}
          />

          <QualityIcon size={30} onClick={openQualityModal} />
        </div>
        </div>
        
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











