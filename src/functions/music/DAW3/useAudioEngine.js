import { useRef, useState, useEffect, useCallback } from "react";

const useAudioEngine = () => {
    const audioContextRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    
    const scrollRefs = useRef({ container: null, tracks: null });
    const isPlayingRef = useRef(isPlaying);
    const filterNodesRef = useRef({});
    const currentTimeRef = useRef(currentTime);
    const mediaRecorderRef = useRef(mediaRecorder);
    const tracksRef = useRef(tracks);
    const audioNodesRef = useRef({});
    const sequencerBuffers = useRef(new Map());
    const scheduledEvents = useRef(new Set());

    // Precargar samples para el sequencer
    const preloadSequencerSamples = useCallback(async () => {
        try {
            const samples = [
                { name: 'kick', url: '/uno.mp3' },
                // Agrega más samples aquí
            ];
            
            await Promise.all(samples.map(async ({name, url}) => {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                sequencerBuffers.current.set(name, audioBuffer);
            }));
        } catch (error) {
            console.error('Error loading sequencer samples:', error);
        }
    }, []);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        preloadSequencerSamples();
        
        return () => {
            audioContextRef.current?.close();
        };
    }, [preloadSequencerSamples]);

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
        scrollRefs,
        tracks,
        setTracks,
        isPlayingRef,
        filterNodesRef,
        currentTimeRef,
        mediaRecorderRef,
        tracksRef,
        audioNodesRef,
        sequencerBuffers,
        scheduledEvents
    };
};

export default useAudioEngine;












/*import { useRef, useState, useEffect, useCallback } from "react";
//import { handlePlayPause, handleStop } from "../DAW2/audioHandlers";
//import { handlePlayPause, handleStop } from "../DAW/audioHandlers";

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
    const audioNodesRef = useRef({});



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
      //handlePlayPause: useCallback(() => handlePlayPause(audioContextRef, setIsPlaying), []),
      //handleStop: useCallback(() => handleStop(audioContextRef, setIsPlaying, setCurrentTime), []),
      scrollRefs,
      tracks,
      setTracks,
      isPlayingRef,
      filterNodesRef,
      currentTimeRef,
      mediaRecorderRef,
      tracksRef,
      audioNodesRef
    };
  };
  
  export default useAudioEngine;*/