// src/utils/mediaUtils.js

// Función para alternar entre play y pause
export const togglePlayPause = (isPlaying, setComponentInUse, componentType) => {
    if (isPlaying) {
      setComponentInUse('');
    } else {
      setComponentInUse(componentType);
    }
  };
  
  // Función para manejar el final de la reproducción
  export const handleEnded = (isRepeatMedia, playMedia, handleNextMedia, setCurrentTimeMedia) => {
    if (isRepeatMedia) {
      playMedia();
    } else {
      handleNextMedia();
    }
    setCurrentTimeMedia(0);
  };
  
  // Función para manejar la actualización del tiempo
  export const handleTimeUpdate = (mediaRef, setCurrentTimeMedia) => {
    if (mediaRef.current) {
      setCurrentTimeMedia(mediaRef.current.currentTime);
    }
  };
  
  // Función para manejar la carga de metadatos
  export const handleLoadedMetadata = (mediaRef, setDuration) => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };
  
  // Función para manejar la búsqueda en la barra de progreso
  export const handleSeek = (e, mediaRef, setCurrentTimeMedia) => {
    if (mediaRef.current) {
      const seekTime = parseFloat(e.target.value);
      mediaRef.current.currentTime = seekTime;
      setCurrentTimeMedia(seekTime);
    }
  };
  
  // Función para manejar el cambio de volumen
  export const handleVolumeChange = (e, setVolumeMedia, mediaRef, isMutedMedia, setIsMutedMedia) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeMedia(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
    if (isMutedMedia && newVolume > 0) {
      setIsMutedMedia(false);
    }
  };
  
  // Función para alternar el silencio
  export const toggleMute = (mediaRef, isMutedMedia, setIsMutedMedia) => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMutedMedia;
      setIsMutedMedia(!isMutedMedia);
    }
  };
  
  // Función para alternar el modo shuffle
  export const toggleShuffle = (isShuffleMedia, setIsShuffleMedia, isRepeatMedia, setIsRepeatMedia) => {
    if (isRepeatMedia) {
      setIsRepeatMedia(false);
    }
    setIsShuffleMedia(!isShuffleMedia);
  };
  
  // Función para alternar el modo repeat
  export const toggleRepeat = (isShuffleMedia, setIsShuffleMedia, isRepeatMedia, setIsRepeatMedia) => {
    if (isShuffleMedia) {
      setIsShuffleMedia(false);
    }
    setIsRepeatMedia(!isRepeatMedia);
  };
  
  // Función para obtener el siguiente elemento (canción o video)
  export const getNextMedia = (allMediaProjects, currentIndex, isShuffleMedia) => {
    if (allMediaProjects.length === 0) return null;
    if (isShuffleMedia) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allMediaProjects.length);
      } while (randomIndex === currentIndex);
      return allMediaProjects[randomIndex];
    } else {
      const nextIndex = (currentIndex + 1) % allMediaProjects.length;
      return allMediaProjects[nextIndex];
    }
  };
  
  // Función para obtener el elemento anterior (canción o video)
  export const getPreviousMedia = (allMediaProjects, currentIndex, isShuffleMedia) => {
    if (allMediaProjects.length === 0) return null;
    if (isShuffleMedia) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * allMediaProjects.length);
      } while (randomIndex === currentIndex);
      return allMediaProjects[randomIndex];
    } else {
      const previousIndex = (currentIndex - 1 + allMediaProjects.length) % allMediaProjects.length;
      return allMediaProjects[previousIndex];
    }
  };
  
  // Función para formatear el tiempo en minutos y segundos
  export const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };