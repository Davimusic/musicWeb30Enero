export const updateAudioNode = (nodeType, trackId, audioNodesRef, value) => {
    const nodeData = audioNodesRef.current[trackId];
    if (!nodeData) {
        console.error(`No se encontraron nodos de audio para el track ${trackId}`);
        return;
    }

    const { gainNode, pannerNode, context } = nodeData;
    const currentTime = context?.currentTime || 0;

    switch(nodeType) {
        case 'volume':
            if (!gainNode) {
                console.error('GainNode no encontrado');
                return;
            }

            // Convertir valor de porcentaje (0-100) a rango de ganancia (0-1)
            const volumeValue = typeof value === 'number' ? 
                Math.min(1, Math.max(0, value / 100)) : 
                value;

            try {
                gainNode.gain.cancelScheduledValues(currentTime);
                
                // Usamos linearRamp para cambios más predecibles
                gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
                gainNode.gain.linearRampToValueAtTime(
                    Math.max(0.0001, volumeValue), // Usa el valor calculado del input range
                    currentTime + 0.05
                );
                

                console.log('Valor del volumen:', gainNode.gain.value);
                
                // Guardar último volumen para función mute
                if (volumeValue > 0.0001) {
                    nodeData.lastVolume = volumeValue;
                }
            } catch (error) {
                console.error('Error al actualizar volumen:', error);
            }
            break;

        case 'pan':
            if (!pannerNode) {
                console.error('PannerNode no encontrado');
                return;
            }

            try {
                console.log(value);
                const finalValue = Math.min(Math.max(value / 50, -1), 1); // Divide entre 50 y limita a -1/1
                pannerNode.pan.cancelScheduledValues(currentTime);
                pannerNode.pan.setValueAtTime(
                    finalValue,
                    currentTime
                );
            } catch (error) {
                console.error('Error al actualizar pan:', error);
            }
            break;

        case 'mute':
            if (!gainNode) {
                console.error('GainNode no encontrado');
                return;
            }

            try {
                gainNode.gain.cancelScheduledValues(currentTime);
                
                if (value) { // Mute activado
                    // Guardar volumen actual antes de mutear
                    if (gainNode.gain.value > 0.0001) {
                        nodeData.lastVolume = gainNode.gain.value;
                    }
                    
                    gainNode.gain.setTargetAtTime(
                        0.0001,
                        currentTime,
                        0.03 // Suavizado rápido
                    );
                } else { // Mute desactivado
                    gainNode.gain.setTargetAtTime(
                        Math.max(0.0001, nodeData.lastVolume || 0.7),
                        currentTime,
                        0.03
                    );
                }
            } catch (error) {
                console.error('Error al actualizar mute:', error);
            }
            break;

        default:
            console.warn(`Tipo de nodo no reconocido: ${nodeType}`);
    }
};
  
  
  
  export const cleanupAudioNodes = (trackId, audioNodesRef) => {
    const nodes = audioNodesRef.current[trackId];
    if (nodes) {
      nodes.sourceNode?.stop();
      nodes.sourceNode?.disconnect();
      nodes.gainNode?.disconnect();
      nodes.pannerNode?.disconnect();
      delete audioNodesRef.current[trackId];
    }
  };