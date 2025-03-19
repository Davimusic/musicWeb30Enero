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

export const useAutoScroll = (tracks, isPlaying, currentTime, pixelsPerSecond, setCurrentTime) => {
    const scrollContainerRef = useRef(null);
    const tracksContainerRef = useRef(null);
    const tracksRef = useRef(tracks); // Ref para tracks
    const prevScrollLeft = useRef(0); // Nueva ref para seguimiento
  
    // Actualizar ref cuando tracks cambie
    useEffect(() => {
      tracksRef.current = tracks;
    }, [tracks]);
  
    useEffect(() => {
      if (!tracksContainerRef.current) return;
      const maxDuration = Math.max(...tracks.map((t) => t.duration)) || 0;
      tracksContainerRef.current.style.width = `${maxDuration * pixelsPerSecond}px`;
    }, [tracks, pixelsPerSecond]);
  
    useEffect(() => {
      let animationFrame;
      const updateTime = () => {
        if (!isPlaying || !scrollContainerRef.current) return;
        
        const container = scrollContainerRef.current;
        const firstTrack = tracksRef.current[0]; // Usar tracksRef
        
        if (!firstTrack?.audio) return;
        
        // Calcular posición de scroll basada en tiempo actual
        const currentTime = firstTrack.audio.currentTime;
        const maxScroll = container.scrollWidth - container.offsetWidth;
        const targetScroll = currentTime * pixelsPerSecond;
        
        // Suavizar el desplazamiento manualmente
        const scrollStep = (targetScroll - prevScrollLeft.current) * 0.3;
        prevScrollLeft.current += scrollStep;
        
        container.scrollLeft = prevScrollLeft.current;
        
        // Continuar animación solo si es necesario
        if (Math.abs(scrollStep) > 0.5) {
          animationFrame = requestAnimationFrame(updateTime);
        }
        setCurrentTime(currentTime);
      };
  
      if (isPlaying) {
        prevScrollLeft.current = scrollContainerRef.current?.scrollLeft || 0;
        animationFrame = requestAnimationFrame(updateTime);
      }
  
      return () => cancelAnimationFrame(animationFrame);
    }, [isPlaying, pixelsPerSecond]); // Eliminar tracks de las dependencias

    /*useEffect(() => {
        if (!scrollContainerRef.current || !isPlaying) return;
      
        const scrollPosition = currentTime * pixelsPerSecond;
        const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.offsetWidth;
        
        scrollContainerRef.current.scrollTo({
          left: Math.min(scrollPosition, maxScroll),
          behavior: 'smooth'
        });
      }, [currentTime, isPlaying]); // Actualiza scroll con cada cambio de currentTime*/
  
      useEffect(() => {
        if (!isPlaying || !scrollContainerRef.current) return;
        
        const scrollPos = currentTime * pixelsPerSecond;
        const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.offsetWidth;
        
        // Scroll suavizado con comportamiento predictivo
        scrollContainerRef.current.scrollTo({
          left: Math.min(scrollPos, maxScroll),
          behavior: 'auto' // Cambiar a 'auto' para mayor precisión
        });
      }, [currentTime]);  


    return { scrollContainerRef, tracksContainerRef };
  };