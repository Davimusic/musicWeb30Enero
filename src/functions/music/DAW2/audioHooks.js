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

export const useAutoScroll = (tracks, isPlaying, currentTime, pixelsPerSecond) => {
  const scrollContainerRef = useRef(null);
  const tracksContainerRef = useRef(null);

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
      const firstTrack = tracks[0];
      if (!firstTrack?.audio) return;

      const currentTime = firstTrack.audio.currentTime;
      const duration = firstTrack.audio.duration;
      const maxScroll = container.scrollWidth - container.offsetWidth;
      const scrollPosition = Math.min(currentTime * pixelsPerSecond, maxScroll);

      container.scrollTo({
        left: scrollPosition,
        behavior: "auto",
      });

      animationFrame = requestAnimationFrame(updateTime);
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, tracks, pixelsPerSecond]);

  return { scrollContainerRef, tracksContainerRef };
};