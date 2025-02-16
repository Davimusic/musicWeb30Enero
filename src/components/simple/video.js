import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';


const Video = ({ id, src, onClick, style, className, setCurrentTimeMedia, currentTimeMedia, setComponentInUse, componentInUse, setIsLoading }) => {
    const videoRef = useRef(null);
    const [quality, setQuality] = useState(25); // Estado para la calidad del video
    const [currentTime, setCurrentTime] = useState(0); // Estado para el tiempo actual del video
    const [duration, setDuration] = useState(0); // Estado para la duración total del video
    const [isPlaying, setIsPlaying] = useState(false); // Estado para controlar si el video está reproduciéndose
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la apertura del modal
    const currentTimeMediaRef = useRef(currentTimeMedia); // Ref para almacenar el valor actual de currentTimeMedia

    // Actualizar la referencia de currentTimeMedia cuando cambia
    useEffect(() => {
        currentTimeMediaRef.current = currentTimeMedia;
    }, [currentTimeMedia]);

    // Pausar el video si el componente en uso es 'audio'
    useEffect(() => {
        if (componentInUse === 'audio' && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause(); // Pausa el video si componentInUse es 'audio'
        }
    }, [componentInUse]);

    // Reproducir el video si componentInUse es 'video'
    useEffect(() => {
        if (componentInUse === 'video' && videoRef.current && videoRef.current.paused) {
            videoRef.current.play(); // Reproduce el video si componentInUse es 'video'
        }
    }, [componentInUse]);

    // Función para manejar la actualización del tiempo del video
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime); // Actualiza el tiempo actual
            setDuration(videoRef.current.duration); // Actualiza la duración total
        }
    };

    // Función para manejar el evento de inicio de reproducción del video
    const handlePlay = () => {
        setComponentInUse('video');
        setIsPlaying(true);
        // Sincroniza el currentTime del video con el valor actual de currentTimeMedia
        if (videoRef.current) {
            videoRef.current.currentTime = currentTimeMediaRef.current;
        }
        // Expandir video cuando se reproduce
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
        setIsLoading(true); // Indica que el video está cargando
    };

    // Función para manejar el evento de reproducción (ya no está cargando)
    const handlePlaying = () => {
        setIsLoading(false); // Indica que el video ya no está cargando
    };

    // Configurar el video y los eventos
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = mixUrlWithQuality(src, quality); // Actualiza la URL con la calidad seleccionada
            videoRef.current.load(); // Recarga el video

            // Agrega el evento timeupdate para rastrear el tiempo actual del video
            videoRef.current.addEventListener('timeupdate', handleTimeUpdate);

            // Agrega el evento play para rastrear cuándo el video empieza a reproducirse
            videoRef.current.addEventListener('play', handlePlay);

            // Agrega el evento pause para rastrear cuándo el video se pausa o se detiene
            videoRef.current.addEventListener('pause', handlePause);

            // Agrega el evento waiting para rastrear cuándo el video está cargando
            videoRef.current.addEventListener('waiting', handleWaiting);

            // Agrega el evento playing para rastrear cuándo el video comienza a reproducirse
            videoRef.current.addEventListener('playing', handlePlaying);

            // Limpia los eventos cuando el componente se desmonta
            return () => {
                videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                videoRef.current.removeEventListener('play', handlePlay);
                videoRef.current.removeEventListener('pause', handlePause);
                videoRef.current.removeEventListener('waiting', handleWaiting);
                videoRef.current.removeEventListener('playing', handlePlaying);
            };
        }
    }, [src, quality]); // Dependencias: src y quality

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
        setQuality(newQuality); // Actualiza la calidad
        closeQualityModal(); // Cierra el modal
    };

    // Formatear el tiempo en minutos y segundos
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Verifica si el tamaño del video es menor de 100px
    const isSmallVideo = style.width < 100 && style.height < 100;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
            {/* Video */}
            <video
                ref={videoRef}
                id={id}
                onClick={isSmallVideo ? handlePlay : onClick}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                className={extractArrayContentToStrings(className)}
            >
                <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
                Tu navegador no admite el elemento de video.
            </video>

            <div style={styles.controlsContainer}>
                    {/* Botón de reproducción/pausa */}
                    <button onClick={togglePlayPause} style={styles.playPauseButton}>
                        {isPlaying ? '⏸️' : '▶️'}
                    </button>

                    {/* Tiempo actual y duración */}
                    <span style={styles.timeText}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Botón de cambio de calidad */}
                    <button onClick={openQualityModal} style={styles.qualityButton}>
                        🎚️
                    </button>
            </div>

            {/* Controles personalizados */}
            {!isSmallVideo && (
                <></>
            )}

            {/* Modal de calidad */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2>Selecciona la calidad del video</h2>
                        <button onClick={() => handleQualityChange(100)} style={styles.qualityOptionButton}>Alta</button>
                        <button onClick={() => handleQualityChange(75)} style={styles.qualityOptionButton}>Media</button>
                        <button onClick={() => handleQualityChange(50)} style={styles.qualityOptionButton}>Baja</button>
                        <button onClick={() => handleQualityChange(25)} style={styles.qualityOptionButton}>Muy baja</button>
                        <button onClick={closeQualityModal} style={styles.closeButton}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};







const styles = {
    controlsContainer: {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
    },
    playPauseButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    qualityButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    timeText: {
        color: 'white',
        fontSize: '14px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '5px 10px',
        borderRadius: '5px',
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

/*import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';

const Video = ({ id, src, onClick, style, className, setCurrentTimeMedia, currentTimeMedia, setComponentInUse, componentInUse, setIsLoading }) => {
    const videoRef = useRef(null);
    const [quality, setQuality] = useState(25); // Estado para la calidad del video
    const [currentTime, setCurrentTime] = useState(0); // Estado para el tiempo actual del video
    const [duration, setDuration] = useState(0); // Estado para la duración total del video
    const [isPlaying, setIsPlaying] = useState(false); // Estado para controlar si el video está reproduciéndose
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar la apertura del modal
    const currentTimeMediaRef = useRef(currentTimeMedia); // Ref para almacenar el valor actual de currentTimeMedia

    // Actualizar la referencia de currentTimeMedia cuando cambia
    useEffect(() => {
        currentTimeMediaRef.current = currentTimeMedia;
    }, [currentTimeMedia]);

    // Pausar el video si el componente en uso es 'audio'
    useEffect(() => {
        if (componentInUse === 'audio' && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause(); // Pausa el video si componentInUse es 'audio'
        }
    }, [componentInUse]);

    // Función para manejar la actualización del tiempo del video
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime); // Actualiza el tiempo actual
            setDuration(videoRef.current.duration); // Actualiza la duración total
        }
    };

    // Función para manejar el evento de inicio de reproducción del video
    const handlePlay = () => {
        setComponentInUse('video');
        setIsPlaying(true);
        // Sincroniza el currentTime del video con el valor actual de currentTimeMedia
        if (videoRef.current) {
            videoRef.current.currentTime = currentTimeMediaRef.current;
        }
    };

    // Función para manejar el evento de pausa del video
    const handlePause = () => {
        setComponentInUse('');
        setIsPlaying(false);
    };

    // Función para manejar el evento de espera (cargando)
    const handleWaiting = () => {
        setIsLoading(true); // Indica que el video está cargando
    };

    // Función para manejar el evento de reproducción (ya no está cargando)
    const handlePlaying = () => {
        setIsLoading(false); // Indica que el video ya no está cargando
    };

    // Configurar el video y los eventos
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.src = mixUrlWithQuality(src, quality); // Actualiza la URL con la calidad seleccionada
            videoRef.current.load(); // Recarga el video

            // Agrega el evento timeupdate para rastrear el tiempo actual del video
            videoRef.current.addEventListener('timeupdate', handleTimeUpdate);

            // Agrega el evento play para rastrear cuándo el video empieza a reproducirse
            videoRef.current.addEventListener('play', handlePlay);

            // Agrega el evento pause para rastrear cuándo el video se pausa o se detiene
            videoRef.current.addEventListener('pause', handlePause);

            // Agrega el evento waiting para rastrear cuándo el video está cargando
            videoRef.current.addEventListener('waiting', handleWaiting);

            // Agrega el evento playing para rastrear cuándo el video comienza a reproducirse
            videoRef.current.addEventListener('playing', handlePlaying);

            // Limpia los eventos cuando el componente se desmonta
            console.log(videoRef.current.removeEventListener);
            
            if(videoRef.current.removeEventListener != null){
                return () => {
                    videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                    videoRef.current.removeEventListener('play', handlePlay);
                    videoRef.current.removeEventListener('pause', handlePause);
                    videoRef.current.removeEventListener('waiting', handleWaiting);
                    videoRef.current.removeEventListener('playing', handlePlaying);
                };
            }
            
        }
    }, [src, quality]); // Dependencias: src y quality

    

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
        setQuality(newQuality); // Actualiza la calidad
        closeQualityModal(); // Cierra el modal
    };

    // Formatear el tiempo en minutos y segundos
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
            <video
                ref={videoRef}
                id={id}
                onClick={onClick}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
                className={extractArrayContentToStrings(className)}
            >
                <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
                Tu navegador no admite el elemento de video.
            </video>

            <div style={styles.controlsContainer}>
                <button onClick={togglePlayPause} style={styles.playPauseButton}>
                    {isPlaying ? '⏸️' : '▶️'}
                </button>

                <span style={styles.timeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button onClick={openQualityModal} style={styles.qualityButton}>
                    🎚️
                </button>
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2>Selecciona la calidad del video</h2>
                        <button onClick={() => handleQualityChange(100)} style={styles.qualityOptionButton}>Alta</button>
                        <button onClick={() => handleQualityChange(75)} style={styles.qualityOptionButton}>Media</button>
                        <button onClick={() => handleQualityChange(50)} style={styles.qualityOptionButton}>Baja</button>
                        <button onClick={() => handleQualityChange(25)} style={styles.qualityOptionButton}>Muy baja</button>
                        <button onClick={closeQualityModal} style={styles.closeButton}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Estilos
const styles = {
    controlsContainer: {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
    },
    playPauseButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    qualityButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    timeText: {
        color: 'white',
        fontSize: '14px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '5px 10px',
        borderRadius: '5px',
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

export default Video;*/









