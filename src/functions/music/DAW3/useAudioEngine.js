import { useRef, useState, useEffect, useCallback } from "react";
//import { handlePlayPause, handleStop } from "../DAW2/audioHandlers";
import { handlePlayPause, handleStop } from "../DAW/audioHandlers";

const useAudioEngine = () => {
    const audioContextRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    //const [tracksNAme, setMediaRecorder] = useState(null);
    

    const scrollRefs = useRef({ container: null, tracks: null });
    const isPlayingRef = useRef(isPlaying);
    const filterNodesRef = useRef({});
    const currentTimeRef = useRef(currentTime);
    const mediaRecorderRef = useRef(mediaRecorder);
    const tracksRef = useRef(tracks);

    useEffect(() => {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }, []);

    useEffect(() => {
      tracksRef.current = tracks;
    }, [tracks]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
      }, [isPlaying]);

    useEffect(() => {
        currentTimeRef.current = currentTime;
    }, [currentTime]); 

    useEffect(() => {
      mediaRecorderRef.current = mediaRecorder;
  }, [mediaRecorder]); 

    return {
      audioContextRef,
      isPlaying,
      setIsPlaying,
      currentTime,
      setCurrentTime,
      handlePlayPause: useCallback(() => handlePlayPause(audioContextRef, setIsPlaying), []),
      handleStop: useCallback(() => handleStop(audioContextRef, setIsPlaying, setCurrentTime), []),
      scrollRefs,
      tracks,
      setTracks,
      isPlayingRef,
      filterNodesRef,
      currentTimeRef,
      mediaRecorderRef,
      tracksRef
    };
  };
  
  export default useAudioEngine;