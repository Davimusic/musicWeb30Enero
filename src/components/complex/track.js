import React, { useRef, useEffect, memo } from "react";
import TrashIcon from "./trashIcon";

const Track = memo(
  ({ track, deleteTrack, zoomLevel, containerWidth, audioContextRef }) => {
    const canvasRef = useRef(null);
    const trackWidth =
      isFinite(track.duration) ? track.duration * 500 * zoomLevel + containerWidth : 0;

    useEffect(() => {
      if (!canvasRef.current || !track.duration) return;
      const canvas = canvasRef.current;
      canvas.width = trackWidth;
      canvas.style.width = `${trackWidth}px`;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, trackWidth, canvas.height);

      (async () => {
        try {
          let audioData;
          if (track.audioBuffer) {
            audioData = track.audioBuffer.getChannelData(0);
          } else {
            const response = await fetch(track.url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            audioData = audioBuffer.getChannelData(0);
          }
          const samplesPerPixel = Math.max(
            1,
            Math.ceil(audioData.length / (trackWidth * 0.5))
          );
          const maxVal = audioData.reduce((acc, s) => {
            const abs = Math.abs(s);
            return abs > acc ? abs : acc;
          }, 0);
          const scaleFactor = canvas.height / (2 * maxVal);

          ctx.beginPath();
          for (let x = 0; x < trackWidth; x++) {
            const startIndex = x * samplesPerPixel;
            const endIndex = Math.min(startIndex + samplesPerPixel, audioData.length);
            const segment = audioData.slice(startIndex, endIndex);
            const amp = segment.reduce((acc, s) => Math.max(acc, Math.abs(s)), 0) * scaleFactor;
            ctx.lineTo(x, canvas.height / 2 - amp);
            ctx.lineTo(x, canvas.height / 2 + amp);
          }
          ctx.strokeStyle = "#2196f3";
          ctx.stroke();
        } catch (error) {
          console.error("Error al dibujar la onda:", error);
        }
      })();
    }, [track.url, track.duration, zoomLevel, trackWidth, track.audioBuffer, audioContextRef]);

    return (
      <div className="track" style={{ width: trackWidth }}>
        <canvas ref={canvasRef} height="100" />
        <TrashIcon size={20} onClick={() => deleteTrack(track.id)} />
      </div>
    );
  }
);

export default Track;
