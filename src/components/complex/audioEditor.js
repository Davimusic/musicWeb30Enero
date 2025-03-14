"use client";

import { useState, useRef, useEffect, memo } from "react";
import "../../estilos/music/audioEditor.css";
import "../../estilos/general/general.css";
import TogglePlayPause from "./TogglePlayPause";
import RecordIcon from "./recordIcon";
import StopIcon from "./stopIcon";
import TrashIcon from "./trashIcon";

const AudioEditor = () => {
  const [tracks, setTracks] = useState([]); // Cada track: { id, url, audio, duration, … }
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(0);

  const containerRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const baseSeconds = 10; // Ajusta según necesidad
    const pps = (containerWidth / baseSeconds) * zoomLevel;
    setPixelsPerSecond(pps);
  }, [containerWidth, zoomLevel]);

  useEffect(() => {
    if (isPlaying && autoScroll && tracks.length > 0 && containerRef.current) {
      let animationFrameId;
      const maxDurationTrack = tracks.reduce((prev, curr) =>
        curr.duration > prev.duration ? curr : prev
      );
      const duration = maxDurationTrack.duration;
      const tol = 0.1;

      const animate = () => {
        if (!isPlaying || !autoScroll) return;
        const currentTime = maxDurationTrack.audio.currentTime;

        if (currentTime >= duration - tol) {
          const maxScroll = duration * pixelsPerSecond - containerWidth;
          containerRef.current.scrollLeft = maxScroll;
          tracks.forEach((track) => track.audio.pause());
          setHasEnded(true);
          return;
        }

        const scrollPosition = currentTime * pixelsPerSecond;
        const maxScroll = duration * pixelsPerSecond - containerWidth;
        containerRef.current.scrollLeft = Math.min(scrollPosition, maxScroll);
        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrameId);
    }
  }, [isPlaying, autoScroll, pixelsPerSecond, tracks, containerWidth]);

  const handleUserScroll = () => {
    if (!autoScroll && containerRef.current) {
      const newTime = containerRef.current.scrollLeft / pixelsPerSecond;
      tracks.forEach((track) => {
        track.audio.currentTime = newTime;
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => {
      const newState = !prev;
      if (newState) {
        if (hasEnded) {
          tracks.forEach((track) => {
            track.audio.currentTime = 0;
          });
          if (containerRef.current) containerRef.current.scrollLeft = 0;
          setHasEnded(false);
        }
        setAutoScroll(true);
        tracks.forEach((track) => {
          track.audio.play();
        });
      } else {
        tracks.forEach((track) => track.audio.pause());
      }
      return newState;
    });
  };

  const handleStop = () => {
    setIsPlaying(false);
    setHasEnded(false);
    tracks.forEach((track) => {
      track.audio.pause();
      track.audio.currentTime = 0;
    });
    if (containerRef.current) containerRef.current.scrollLeft = 0;
  };

  const deleteTrack = (id) => {
    setTracks((prevTracks) => prevTracks.filter((track) => track.id !== id));
  };

  const handleRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/wav" });
          const url = URL.createObjectURL(blob);
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const duration = audioBuffer.duration;
          const audio = new Audio(url);
          await new Promise((resolve) => {
            audio.onloadedmetadata = resolve;
          });
          setTracks((prev) => [
            ...prev,
            {
              id: Date.now(),
              url,
              audio,
              duration,
              volume: 1,
              muted: false,
            },
          ]);
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error al grabar:", error);
        alert("Revisa los permisos del micrófono.");
      }
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const Track = memo(({ track, deleteTrack }) => {
    const canvasRef = useRef(null);
    const trackWidth = isFinite(track.duration) ? track.duration * pixelsPerSecond : 0;

    useEffect(() => {
      if (!canvasRef.current || !track.duration) return;
      const canvas = canvasRef.current;
      canvas.width = trackWidth;
      canvas.style.width = `${trackWidth}px`;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, trackWidth, canvas.height);
      (async () => {
        try {
          const response = await fetch(track.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const data = audioBuffer.getChannelData(0);
          const samplesPerPixel = Math.max(1, Math.ceil(data.length / (trackWidth * 0.5)));
          const maxVal = data.reduce((acc, s) => {
            const abs = Math.abs(s);
            return abs > acc ? abs : acc;
          }, 0);
          const scaleFactor = canvas.height / (2 * maxVal);
          ctx.beginPath();
          for (let x = 0; x < trackWidth; x++) {
            const startIndex = x * samplesPerPixel;
            const endIndex = Math.min(startIndex + samplesPerPixel, data.length);
            const segment = data.slice(startIndex, endIndex);
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
    }, [track.url, track.duration, trackWidth]);

    return (
      <div className="track" style={{ width: trackWidth }}>
        <canvas ref={canvasRef} height="100" />
        <TrashIcon size={20} onClick={() => deleteTrack(track.id)} />
      </div>
    );
  });

  return (
    <div className="editor-container">
      <div
        ref={containerRef}
        className="tracks-container"
        onMouseDown={() => setAutoScroll(false)}
        onTouchStart={() => setAutoScroll(false)}
        onScroll={handleUserScroll}
      >
        {tracks.map((track) => (
          <Track key={track.id} track={track} deleteTrack={deleteTrack} />
        ))}
      </div>
      <div className="controls">
        <RecordIcon size={30} onClick={handleRecord} isRecording={isRecording} />
        <TogglePlayPause size={30} isPlaying={isPlaying} onToggle={handlePlayPause} />
        <StopIcon size={30} onClick={handleStop} />
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default AudioEditor;