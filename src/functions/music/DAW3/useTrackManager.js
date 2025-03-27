// useTrackManager.js
import { useState, useCallback, useRef } from "react";
//import { createTrack, updateTrack } from "@/utils/trackUtils";
import { createTrack, updateTrack } from "../DAW2/audioUtils";

const useTrackManager = (audioContextRef) => {
    const [tracks, setTracks] = useState([]);
    const sidebarRef = useRef(null);
  
    const handleTrackAction = useCallback((action, trackId, value) => {
      setTracks(prev => updateTrack(prev, action, trackId, value));
    }, []);
  
    const handleLoadAudio = useCallback(async (e) => {
      const track = await createTrack(e.target.files[0], audioContextRef.current);
      setTracks(prev => [...prev, track]);
    }, [audioContextRef]);
  
    return {
      tracks,
      handleLoadAudio,
      handleTrackAction,
      trackControls: { sidebarRef }
    };
  };
  
  export default useTrackManager;