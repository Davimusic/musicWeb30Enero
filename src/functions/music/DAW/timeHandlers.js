// src/functions/music/DAW/timeHandlers.js

export const getPixelsPerSecond = (zoomLevel) => {
    const BASE_PIXELS_PER_SECOND = 100; // 100px por segundo en zoom 1
    return BASE_PIXELS_PER_SECOND * zoomLevel;
  };


  export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };
  
  export const handleTimeSelect = (
    selectedTime,
    tracks,
    isPlaying,
    scrollContainerRef,
    setCurrentTime,
    pixelsPerSecond
  ) => {
    const container = scrollContainerRef.current;
    if (!container) return;
  
    // Calcular posición para mostrar el final completo
    const maxScroll = container.scrollWidth - container.offsetWidth;
    const scrollPosition = Math.min(
      selectedTime * pixelsPerSecond, // Posición normal
      maxScroll // Límite máximo
    );
  
    console.log('Parámetros de navegación:');
    console.log('Tiempo seleccionado:', selectedTime, 'segundos');
    console.log('Posición de scroll calculada:', scrollPosition, 'px');
    console.log('Ancho visible del contenedor:', container.offsetWidth, 'px');
    console.log('Scroll máximo posible:', maxScroll, 'px');
  
    // Mover el scroll a la posición calculada
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
  
    // Actualizar el tiempo de reproducción en todos los tracks
    tracks.forEach((track) => {
      if (track.audio) {
        track.audio.currentTime = selectedTime;
        if (isPlaying) track.audio.play();
      }
    });
  
    // Actualizar el estado del tiempo actual
    setCurrentTime(selectedTime);
  };