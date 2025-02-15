import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';

const Video = ({ id, src, onClick, style, className, setCurrentTimeMedia, currentTimeMedia, setComponentInUse, componentInUse, setIsLoading }) => {
    const videoRef = useRef(null);
    const [quality, setQuality] = useState(25); // Estado para la calidad del video
    const [currentTime, setCurrentTime] = useState(0); // Estado para el tiempo actual del video
    const [duration, setDuration] = useState(0); // Estado para la duración total del video
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
        // Sincroniza el currentTime del video con el valor actual de currentTimeMedia
        if (videoRef.current) {
            videoRef.current.currentTime = currentTimeMediaRef.current;
        }
    };

    // Función para manejar el evento de pausa del video
    const handlePause = () => {
        setComponentInUse('');
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

    return (
        <div>
            {/* Selector de calidad */}
            <div className="quality-selector">
                <label htmlFor="quality">Calidad:</label>
                <select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                >
                    <option value={100}>Alta</option>
                    <option value={75}>Media</option>
                    <option value={50}>Baja</option>
                    <option value={25}>Muy baja</option>
                </select>
            </div>

            {/* Elemento de video */}
            <video
                ref={videoRef}
                id={id}
                onClick={onClick}
                controls
                style={style}
                className={extractArrayContentToStrings(className)}
            >
                <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
                Tu navegador no admite el elemento de video.
            </video>
        </div>
    );
};

export default Video;





/*import React, { useEffect, useRef, useState } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';
import mixUrlWithQuality from '@/functions/music/mixUrlWithQuality';

const Video = ({ id, src, onClick, style, className, setCurrentTimeMedia, currentTimeMedia, setComponentInUse, componentInUse }) => {
    const videoRef = useRef(null);
    const [quality, setQuality] = useState(25); // Estado para la calidad del video
    const [currentTime, setCurrentTime] = useState(0); // Estado para el tiempo actual del video
    const [duration, setDuration] = useState(0); // Estado para la duración total del video
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
        // Sincroniza el currentTime del video con el valor actual de currentTimeMedia
        if (videoRef.current) {
            videoRef.current.currentTime = currentTimeMediaRef.current;
        }
    };

    // Función para manejar el evento de pausa del video
    const handlePause = () => {
        setComponentInUse('');
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

            // Limpia los eventos cuando el componente se desmonta
            return () => {
                videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                videoRef.current.removeEventListener('play', handlePlay);
                videoRef.current.removeEventListener('pause', handlePause);
            };
        }
    }, [src, quality]); // Dependencias: src y quality

    // Actualizar currentTimeMedia cuando currentTime cambia
    useEffect(() => {
        setCurrentTimeMedia(currentTime);
    }, [currentTime, setCurrentTimeMedia]);

    return (
        <div>
            
            <div className="quality-selector">
                <label htmlFor="quality">Calidad:</label>
                <select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                >
                    <option value={100}>Alta</option>
                    <option value={75}>Media</option>
                    <option value={50}>Baja</option>
                    <option value={25}>Muy baja</option>
                </select>
            </div>

            
            <video
                ref={videoRef}
                id={id}
                onClick={onClick}
                controls
                style={style}
                className={extractArrayContentToStrings(className)}
            >
                <source src={mixUrlWithQuality(src, quality)} type="video/mp4" />
                Tu navegador no admite el elemento de video.
            </video>
        </div>
    );
};

export default Video;*/











