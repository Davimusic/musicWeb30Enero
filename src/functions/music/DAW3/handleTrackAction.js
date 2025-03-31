import { updateAudioNode } from "./audioManager";


const handleTrackAction = (actionType, trackId, setTracks, audioNodesRef, tracks, ...args) => {
    console.log(trackId);
    console.log(tracks);
    
    
  switch (actionType) {
    case "setStartTime":
      const [startTime] = args;
      setTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? {...track, startTime} : track
        )
      );
      break;
      
    case "addFilter":
      const [newFilter] = args;
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === trackId 
            ? {...track, filters: [...(track.filters || []), newFilter]} 
            : track
        )
      );
      break;
      
    case "removeFilter":
      const [filterIndex] = args;
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === trackId
            ? {
                ...track,
                filters: track.filters.filter((_, i) => i !== filterIndex)
              }
            : track
        )
      );
      break;
      
    case "updateFilter":
      const [index, newParams] = args;
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === trackId
            ? {
                ...track,
                filters: track.filters.map((filter, i) =>
                  i === index ? {...filter, params: newParams} : filter
                )
              }
            : track
        )
      );
      break;
      
      case "volume":
        const [volume] = args;
        setTracks(prevTracks =>
          prevTracks.map(track => {
            if (track.id === trackId) {
              // Actualizar último volumen si no está muteado
              if (!track.muted && audioNodesRef.current?.[trackId]) {
                audioNodesRef.current[trackId].lastVolume = volume;
              }
              return {...track, volume: volume};
            }
            return track;
          })
        );
        
        // Verificar si el nodo de audio existe y no está muteado
        const currentTrack = tracks.find(t => t.id === trackId);
        if (currentTrack && !currentTrack.muted && audioNodesRef.current?.[trackId]?.gainNode) {
            updateAudioNode('volume', trackId, audioNodesRef, volume);
        }
        break;
      
    case "pan":
      const [panValue] = args;
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === trackId ? {...track, panning: panValue} : track
        )
      );
      
      updateAudioNode('pan', trackId, audioNodesRef, panValue);
      break;
      
      case "mute":
    const [isMuted] = args;
    setTracks(prevTracks =>
        prevTracks.map(track => {
            if (track.id === trackId) {
                // Guardar último volumen antes de mutear
                if (isMuted && !track.muted && audioNodesRef.current[trackId]) {
                    // Get the gainNode from audioNodesRef
                    const nodeData = audioNodesRef.current[trackId];
                    if (nodeData && nodeData.gainNode) {
                        // Store the exact current volume
                        nodeData.lastVolume = nodeData.gainNode.gain.value;
                        console.log("Saved volume for unmute:", nodeData.gainNode.gain.value);
                    }
                }
                return {...track, muted: isMuted};
            }
            return track;
        })
    );
    
    updateAudioNode('mute', trackId, audioNodesRef, isMuted);
    break;
      
    case "solo":
      setTracks(prevTracks => {
        const newTracks = prevTracks.map(track => ({
          ...track,
          solo: track.id === trackId ? !track.solo : false
        }));
    
        const anySolo = newTracks.some(t => t.solo);
        
        newTracks.forEach(track => {
          const nodeData = audioNodesRef.current[track.id];
          if (nodeData?.gainNode) {
            const shouldMute = anySolo && !track.solo;
            
            // Nueva lógica para preservar mute manual
            const muteParams = {
              forcedMute: shouldMute,
              userMute: track.muted
            };
            
            updateAudioNode('mute', track.id, audioNodesRef, muteParams);
            
            // Actualizar referencia de mute forzado
            nodeData.forcedMute = shouldMute;
          }
        });
        
        return newTracks;
      });
      break;
      
    case "delete":
      setTracks(prevTracks => {
        const newTracks = prevTracks.filter(track => track.id !== trackId);
        
        // Limpiar nodos de audio
        if (audioNodesRef.current[trackId]) {
          audioNodesRef.current[trackId].gainNode.disconnect();
          audioNodesRef.current[trackId].pannerNode.disconnect();
          delete audioNodesRef.current[trackId];
        }
        
        return newTracks;
      });
      break;
      
    case "updateName":
      const [newName] = args;
      setTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? {...track, name: newName} : track
        )
      );
      break;
      
    case "updateColor":
      const [newColor] = args;
      setTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? {...track, backgroundColorTrack: newColor} : track
        )
      );
      break;
      
    case "updateOffset":
      const [offset] = args;
      setTracks(prevTracks =>
        prevTracks.map(track =>
          track.id === trackId ? {...track, offset} : track
        )
      );
      break;
      
    case "redrawWaveform":
      // Lógica para redibujar la forma de onda
      break;
      
    default:
      console.warn(`Acción no reconocida: ${actionType}`);
  }
};

export default handleTrackAction;