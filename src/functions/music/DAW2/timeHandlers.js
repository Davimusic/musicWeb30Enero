export const getPixelsPerSecond = (zoomLevel) => {
    const BASE_PIXELS_PER_SECOND = 100;
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
  
    const maxScroll = container.scrollWidth - container.offsetWidth;
    const scrollPosition = Math.min(selectedTime * pixelsPerSecond, maxScroll);
  
    container.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  
    tracks.forEach((track) => {
      if (track.audio) {
        track.audio.currentTime = selectedTime;
        if (isPlaying) track.audio.play();
      }
    });
  
    setCurrentTime(selectedTime);
  };