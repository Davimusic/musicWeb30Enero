import { useEffect, useRef } from "react";

export const useAudioContext = () => {
  const audioContextRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 48000 });
        document.addEventListener(
          "click",
          () => audioContextRef.current.resume(),
          { once: true }
        );
      }
    };
    init();
  }, []);

  return { audioContextRef };
};



export const useAutoScroll = (
    tracks,
    isPlaying,
    currentTimeRef, // <-- Recibe currentTimeRef
    pixelsPerSecond,
    setCurrentTime
  ) => {
    const scrollContainerRef = useRef(null);
    const tracksContainerRef = useRef(null);
    const isScrollingManually = useRef(false);
    const lastScrollTimeout = useRef(null);
  
    // Efecto para el scroll automático
    useEffect(() => {
      let rafId;
  
      const updateScroll = () => {
        if (!isPlaying || !scrollContainerRef.current || isScrollingManually.current) return;
  
        // Usar currentTimeRef.current para el scroll
        const scrollPos = currentTimeRef.current * pixelsPerSecond;
        const maxScroll = scrollContainerRef.current.scrollWidth - 
                         scrollContainerRef.current.offsetWidth;
  
        scrollContainerRef.current.scrollLeft = Math.min(scrollPos, maxScroll);
  
        rafId = requestAnimationFrame(updateScroll);
      };
  
      if (isPlaying) rafId = requestAnimationFrame(updateScroll);
      return () => cancelAnimationFrame(rafId);
    }, [isPlaying]); // <-- Dependencia solo de isPlaying
  
    // Efecto para el scroll manual
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
  
      const handleScroll = () => {
        // Activar el flag de scroll manual
        isScrollingManually.current = true;
  
        // Calcular el tiempo manualmente
        const manualTime = container.scrollLeft / pixelsPerSecond;
        setCurrentTime(manualTime);
  
        // Resetear el flag después de 500ms de inactividad
        clearTimeout(lastScrollTimeout.current);
        lastScrollTimeout.current = setTimeout(() => {
          isScrollingManually.current = false;
        }, 500);
      };
  
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        clearTimeout(lastScrollTimeout.current); // Limpiar timeout
      };
    }, [isPlaying]);
  
    return { 
      scrollContainerRef, 
      tracksContainerRef 
    };
  };