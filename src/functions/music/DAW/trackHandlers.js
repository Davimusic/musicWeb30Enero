export const updateTrackVolume = (trackId, volume, setTracks) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          track.audio.volume = volume;
          return { ...track, volume };
        }
        return track;
      })
    );
  };
  
  export const updateTrackMuted = (trackId, muted, setTracks) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          track.audio.muted = muted;
          return { ...track, muted };
        }
        return track;
      })
    );
  };
  
  export const updateTrackPanning = (trackId, panning, setTracks) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          track.pannerNode.pan.value = panning / 50;
          return { ...track, panning };
        }
        return track;
      })
    );
  };
  
  export const deleteTrack = (trackId, setTracks) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId));
  };
  
  export const muteAllExceptThis = (trackId, setTracks) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          return { ...track, isSolo: !track.isSolo };
        }
        return { ...track, muted: track.isSolo ? false : true };
      })
    );
  };