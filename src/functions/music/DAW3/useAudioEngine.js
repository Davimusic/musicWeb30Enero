import { useRef, useState, useEffect, useCallback } from "react";



const useAudioEngine = () => {
    const audioContextRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    
    // Referencias existentes
    const scrollRefs = useRef({ container: null, tracks: null });
    const isPlayingRef = useRef(isPlaying);
    const filterNodesRef = useRef({});
    const currentTimeRef = useRef(currentTime);
    const mediaRecorderRef = useRef(mediaRecorder);
    const tracksRef = useRef(tracks);
    const audioNodesRef = useRef({});
    
    // Referencias para Drum Machine
    const sequencerBuffers = useRef(new Map());
    const scheduledEvents = useRef(new Set());
    const schedulerRef = useRef(null);
    const lastScheduledTimeRef = useRef(0);
    const workerRef = useRef(null);
    const transportStartTimeRef = useRef(0);
    const activeEventsMapRef = useRef(new Map()); // Nuevo: para control de eventos activos

    // Constantes para el drum machine
    const DRUM_MACHINE_BPM = 120;
    const DRUM_PULSES_PER_MEASURE = 4;
    const DRUM_DEFAULT_SUBDIVISions = 4;
    const DRUM_DEFAULT_SUBDIVISIONS = 2;
    const DRUM_MEASURES_TO_RENDER = 4;
    const DRUM_ADDITIONAL_COLUMNS = 2;
    const DRUM_TOTAL_PULSES = DRUM_MEASURES_TO_RENDER * DRUM_PULSES_PER_MEASURE + DRUM_ADDITIONAL_COLUMNS;
    const DRUM_TOTAL_ELEMENTS = DRUM_TOTAL_PULSES * DRUM_DEFAULT_SUBDIVISions;

    // Worker optimizado para evitar duplicados
    const createDrumMachineWorker = useCallback(() => {
        const workerCode = `
          const MAX_LOOKAHEAD = 0.1; // 100ms lookahead
          const activeEvents = new Map();
          
          self.onmessage = function(e) {
            const { pattern, transportTime, bpm, subdivisions } = e.data;
            const stepDuration = 60 / bpm / subdivisions;
            
            const schedule = [];
            const startStep = Math.floor((transportTime - 0.001) / stepDuration);
            const endStep = Math.ceil((transportTime + MAX_LOOKAHEAD) / stepDuration);
      
            for (let step = startStep; step <= endStep; step++) {
              const stepTime = step * stepDuration;
              const stepIndex = step % pattern.steps.length;
              
              if (!activeEvents.has(stepTime)) {
                pattern.steps[stepIndex].activeSounds.forEach(sound => {
                  schedule.push({
                    time: stepTime,
                    sound,
                    stepIndex
                  });
                });
                activeEvents.set(stepTime, true);
              }
            }
      
            // Limpieza de eventos antiguos
            const cleanupTime = transportTime - (stepDuration * 2);
            activeEvents.forEach((_, time) => {
              if (time < cleanupTime) activeEvents.delete(time);
            });
      
            self.postMessage(schedule);
          };
        `;
      
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
      }, []);

    // Precargar samples (sin cambios)
    const preloadSequencerSamples = useCallback(async () => {
        try {
            const samples = [
                { name: 'uno', url: '/uno.mp3' },
                { name: 'dos', url: '/dos.mp3' },
                { name: 'tres', url: '/tres.mp3' }
            ];
            
            await Promise.all(samples.map(async ({name, url}) => {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
                sequencerBuffers.current.set(name, audioBuffer);
            }));
        } catch (error) {
            console.error('Error loading drum samples:', error);
        }
    }, []);

    // Inicialización optimizada del worker
    const initializeDrumMachine = useCallback(() => {
        workerRef.current = createDrumMachineWorker();
        
        workerRef.current.onmessage = (e) => {
            const schedule = e.data;
            const ctx = audioContextRef.current;
            const now = ctx.currentTime;
            
            schedule.forEach(({ time, sounds, stepIndex }) => {
                const playTime = now + (time - currentTimeRef.current);
                const eventPrefix = `drum-${stepIndex}-${time.toFixed(4)}-`;
                
                sounds.forEach(sound => {
                    const eventId = `${eventPrefix}${sound}`;
                    
                    if (!scheduledEvents.current.has(eventId)) {
                        const buffer = sequencerBuffers.current.get(sound);
                        if (buffer) {
                            const source = ctx.createBufferSource();
                            source.buffer = buffer;
                            
                            const trackId = `drum-${sound}`;
                            if (audioNodesRef.current[trackId]) {
                                source.connect(audioNodesRef.current[trackId].gainNode);
                            } else {
                                source.connect(ctx.destination);
                            }
                            
                            source.start(playTime);
                            scheduledEvents.current.add(eventId);
                            
                            source.onended = () => {
                                scheduledEvents.current.delete(eventId);
                            };
                        }
                    }
                });
            });
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Schedule mejorado con sincronización de tiempo
    // Schedule mejorado sin recursión infinita
    const scheduleDrumMachine = useCallback(() => {
        if (!isPlayingRef.current || !tracksRef.current) return;
      
        tracksRef.current.forEach(track => {
          if (track.type === 'drum' && workerRef.current) {
            const ctx = audioContextRef.current;
            const transportTime = ctx.currentTime - transportStartTimeRef.current;
            
            workerRef.current.postMessage({
              pattern: track.drumPattern.patterns[track.drumPattern.currentPattern],
              transportTime: transportTime,
              bpm: track.drumPattern.BPM,
              subdivisions: track.drumPattern.subdivisions
            });
          }
        });
      
        schedulerRef.current = setTimeout(
          scheduleDrumMachine, 
          50 // Mantener 50ms de lookahead
        );
      }, []);

    // Inicio de transporte (sin cambios)
    const startTransport = useCallback(() => {
        if (audioContextRef.current && !isPlayingRef.current) {
            transportStartTimeRef.current = audioContextRef.current.currentTime - currentTimeRef.current;
            setIsPlaying(true);
        }
    }, []);

    // Limpieza más frecuente
    const cleanupDrumSources = useCallback(() => {
        if (!audioContextRef.current) return;
        
        const now = audioContextRef.current.currentTime;
        const toDelete = [];
        
        scheduledEvents.current.forEach(id => {
            const time = parseFloat(id.split('-')[2]);
            if (now > time + 0.5) { // Reducido a 0.5 segundos
                toDelete.push(id);
            }
        });

        toDelete.forEach(id => scheduledEvents.current.delete(id));
    }, []);

    // Efectos (sin cambios)
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        initializeDrumMachine();
        preloadSequencerSamples();
        
        const cleanupInterval = setInterval(cleanupDrumSources, 500); // Limpieza más frecuente
        
        return () => {
            audioContextRef.current?.close();
            workerRef.current?.terminate();
            clearTimeout(schedulerRef.current);
            clearInterval(cleanupInterval);
        };
    }, [initializeDrumMachine, preloadSequencerSamples, cleanupDrumSources]);

    useEffect(() => {
        if (isPlaying) {
            lastScheduledTimeRef.current = audioContextRef.current?.currentTime || 0;
        } else {
            clearTimeout(schedulerRef.current);
            cancelAnimationFrame(schedulerRef.current);
            lastScheduledTimeRef.current = 0;
            scheduledEvents.current.clear();
        }
    }, [isPlaying]);

    // Actualizadores de referencia (sin cambios)
    useEffect(() => { tracksRef.current = tracks; }, [tracks]);
    useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
    useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);
    useEffect(() => { mediaRecorderRef.current = mediaRecorder; }, [mediaRecorder]);

    // Retorno (sin cambios)
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
        scheduledEvents,
        scheduleDrumMachine,
        schedulerRef,
        preloadSequencerSamples,
        startTransport,
        drumMachineConstants: {
            BPM: DRUM_MACHINE_BPM,
            pulsesPerMeasure: DRUM_PULSES_PER_MEASURE,
            defaultSubdivisions: DRUM_DEFAULT_SUBDIVISions,
            totalElements: DRUM_TOTAL_ELEMENTS
        }
    };
};

export default useAudioEngine;
















/*import { useRef, useState, useEffect, useCallback } from "react";

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
    const schedulerRef = useRef(null);
    const lastScheduledTimeRef = useRef(0);

    // Precargar samples para el sequencer
    const preloadSequencerSamples = useCallback(async () => {
        try {
            const samples = [
                { name: 'kick', url: '/uno.mp3' },
                
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

    // Función optimizada para programar eventos de batería
    const scheduleDrumEvents = useCallback(() => {
        if (!isPlayingRef.current || !audioContextRef.current) return;

        const currentAudioTime = audioContextRef.current.currentTime;
        const lookAhead = 0.1; // Programar 100ms adelante
        const scheduleEnd = currentAudioTime + lookAhead;

        // Solo procesar si hemos avanzado en el tiempo
        if (currentAudioTime <= lastScheduledTimeRef.current) {
            schedulerRef.current = setTimeout(scheduleDrumEvents, lookAhead * 500);
            return;
        }

        tracksRef.current.forEach(track => {
            if (track.type === 'drumMachine' && track.drumPattern) {
                const pattern = track.drumPattern.patterns[track.drumPattern.currentPattern];
                const stepDuration = 60 / track.drumPattern.BPM / track.drumPattern.subdivisionsPerPulse;

                // Calcular rango de pasos a programar
                const startStep = Math.floor((lastScheduledTimeRef.current - currentTimeRef.current) / stepDuration);
                const endStep = Math.floor((scheduleEnd - currentTimeRef.current) / stepDuration);

                for (let step = startStep; step <= endStep; step++) {
                    const stepIndex = step % pattern.steps.length; // Para loop
                    const stepTime = currentTimeRef.current + (step * stepDuration);
                    
                    if (stepTime >= lastScheduledTimeRef.current && stepTime < scheduleEnd) {
                        pattern.steps[stepIndex].activeSounds.forEach(sound => {
                            const eventId = `${track.id}-${stepIndex}-${sound}`;
                            
                            if (!scheduledEvents.current.has(eventId)) {
                                const buffer = sequencerBuffers.current.get(sound);
                                if (buffer) {
                                    const source = audioContextRef.current.createBufferSource();
                                    source.buffer = buffer;
                                    
                                    // Conectar a la cadena de efectos del track
                                    if (audioNodesRef.current[track.id]) {
                                        source.connect(audioNodesRef.current[track.id].gainNode);
                                    } else {
                                        source.connect(audioContextRef.current.destination);
                                    }
                                    
                                    source.start(stepTime);
                                    scheduledEvents.current.add(eventId);
                                    source.onended = () => scheduledEvents.current.delete(eventId);
                                }
                            }
                        });
                    }
                }
            }
        });

        lastScheduledTimeRef.current = scheduleEnd;
        schedulerRef.current = setTimeout(scheduleDrumEvents, lookAhead * 500);
    }, []);

    // Limpieza de fuentes de audio inactivas
    const cleanupAudioSources = useCallback(() => {
        const now = audioContextRef.current?.currentTime || 0;
        const toDelete = [];
        
        scheduledEvents.current.forEach(id => {
            const [trackId, stepIndex] = id.split('-');
            const stepDuration = 60 / (tracksRef.current.find(t => t.id === trackId)?.drumPattern?.BPM || 120);
            
            // Asumimos que cada evento dura menos de 1 segundo
            if (now > (currentTimeRef.current + (parseInt(stepIndex) * stepDuration) + 1)) {
                toDelete.push(id);
            }
        });

        toDelete.forEach(id => scheduledEvents.current.delete(id));
    }, []);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        preloadSequencerSamples();
        
        // Configurar limpieza periódica
        const cleanupInterval = setInterval(cleanupAudioSources, 1000);
        
        return () => {
            audioContextRef.current?.close();
            clearTimeout(schedulerRef.current);
            clearInterval(cleanupInterval);
        };
    }, [preloadSequencerSamples, cleanupAudioSources]);

    // Control del scheduler al cambiar el estado de reproducción
    useEffect(() => {
        if (isPlaying) {
            lastScheduledTimeRef.current = audioContextRef.current.currentTime;
            scheduleDrumEvents();
        } else {
            clearTimeout(schedulerRef.current);
            lastScheduledTimeRef.current = 0;
        }
    }, [isPlaying, scheduleDrumEvents]);

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
        scheduledEvents,
        preloadSequencerSamples
    };
};

export default useAudioEngine;*/
















