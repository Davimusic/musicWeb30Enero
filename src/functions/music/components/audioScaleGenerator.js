'use client';
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

const PianoGenerator = forwardRef((props, ref) => {
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [selectedOctave, setSelectedOctave] = useState(4);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const audioContextRef = useRef(null);
  const sourceNodesRef = useRef([]);
  const masterGainRef = useRef(null);
  const noteBuffersRef = useRef(new Map());
  const baseBufferRef = useRef(null);

  // Generar frecuencias para las 88 notas del piano (A0 a C8)
  const generatePianoFrequencies = () => {
    const notes = [];
    for (let midi = 21; midi <= 108; midi++) {
      const freq = 440 * Math.pow(2, (midi - 69) / 12); // Fórmula MIDI
      const noteName = getNoteName(midi);
      notes.push({
        midi,
        name: noteName,
        frequency: freq,
        playbackRate: Math.pow(2, (midi - 69) / 12) // Ratio basado en A4
      });
    }
    return notes;
  };

  // Convertir número MIDI a nombre de nota (ej. 69 -> "A4")
  const getNoteName = (midiNote) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
  };

  const pianoNotes = generatePianoFrequencies();

  // Exponer métodos y datos al componente padre
  useImperativeHandle(ref, () => ({
    getNoteBuffers: () => noteBuffersRef.current,
    isReady: isReady,
    generateNoteBuffers: async (audioBuffer) => {
      return await generateAllNotes(audioBuffer);
    },
    getBaseBuffer: () => baseBufferRef.current
  }));

  // Inicializar AudioContext y efectos
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 44100,
      latencyHint: 'playback'
    });
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.gain.value = 0.7;
    masterGainRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generar buffers para todas las notas
  const generateAllNotes = async (audioBuffer) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    const buffers = new Map();
    
    try {
      for (let i = 0; i < pianoNotes.length; i++) {
        const note = pianoNotes[i];
        try {
          const buffer = await createPitchShiftedBuffer(audioBuffer, note.playbackRate);
          buffers.set(note.name, buffer);
          setGenerationProgress(Math.round((i / pianoNotes.length) * 100));
        } catch (error) {
          console.error(`Error generating note ${note.name}:`, error);
        }
      }
      
      noteBuffersRef.current = buffers;
      setIsGenerating(false);
      return buffers;
    } catch (error) {
      console.error('Error generating notes:', error);
      setIsGenerating(false);
      throw error;
    }
  };

  // Crear buffer con cambio de tono usando OfflineAudioContext
  const createPitchShiftedBuffer = async (buffer, playbackRate) => {
    const offlineCtx = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length / playbackRate,
      buffer.sampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(offlineCtx.destination);
    source.start();
    
    return await offlineCtx.startRendering();
  };

  // Cargar y procesar archivo de audio
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReady(false);
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Limitar duración del sample
      if (audioBuffer.duration > 3) {
        alert('Usa samples cortos (menos de 3 segundos) para mejor rendimiento');
        return;
      }

      baseBufferRef.current = audioBuffer;
      await generateAllNotes(audioBuffer);
      setIsReady(true);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error al procesar el archivo. Usa formatos WAV o MP3.');
    }
  };

  // Reproducir nota con optimizaciones
  const playNote = (note) => {
    if (!isReady) return;

    stopAllNotes();
    setActiveNote(note.midi);

    // Usar buffer generado si está disponible
    if (noteBuffersRef.current.has(note.name)) {
      const buffer = noteBuffersRef.current.get(note.name);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      
      const gainNode = audioContextRef.current.createGain();
      const now = audioContextRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(1, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      source.connect(gainNode);
      gainNode.connect(masterGainRef.current);
      
      source.start();
      source.stop(now + 1.5);
      
      sourceNodesRef.current.push(source);
      source.onended = () => setActiveNote(null);
      return;
    }

    // Fallback al método de playbackRate si no hay buffer generado
    const source = audioContextRef.current.createBufferSource();
    source.buffer = baseBufferRef.current;
    source.playbackRate.value = note.playbackRate;
    
    const gainNode = audioContextRef.current.createGain();
    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    source.connect(gainNode);
    gainNode.connect(masterGainRef.current);
    
    source.start();
    source.stop(now + 1.5);
    
    sourceNodesRef.current.push(source);
    source.onended = () => setActiveNote(null);
  };

  // Reproducir octava completa
  const playOctave = async () => {
    if (!isReady || isPlaying) return;

    setIsPlaying(true);
    stopAllNotes();

    const octaveNotes = pianoNotes.filter(n => 
      Math.floor(n.midi / 12) - 1 === selectedOctave
    );

    const startTime = audioContextRef.current.currentTime + 0.1;
    
    octaveNotes.forEach((note, index) => {
      // Intentar usar buffer generado primero
      if (noteBuffersRef.current.has(note.name)) {
        const buffer = noteBuffersRef.current.get(note.name);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        
        const gainNode = audioContextRef.current.createGain();
        const noteStart = startTime + index * 0.5;
        
        gainNode.gain.setValueAtTime(0, noteStart);
        gainNode.gain.linearRampToValueAtTime(1, noteStart + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 1);

        source.connect(gainNode);
        gainNode.connect(masterGainRef.current);
        
        source.start(noteStart);
        source.stop(noteStart + 1);
        
        sourceNodesRef.current.push(source);
        return;
      }

      // Fallback al método de playbackRate
      const source = audioContextRef.current.createBufferSource();
      source.buffer = baseBufferRef.current;
      source.playbackRate.value = note.playbackRate;
      
      const gainNode = audioContextRef.current.createGain();
      const noteStart = startTime + index * 0.5;
      
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(1, noteStart + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 1);

      source.connect(gainNode);
      gainNode.connect(masterGainRef.current);
      
      source.start(noteStart);
      source.stop(noteStart + 1);
      
      sourceNodesRef.current.push(source);
    });

    setTimeout(() => setIsPlaying(false), octaveNotes.length * 500);
  };

  // Detener todas las notas
  const stopAllNotes = () => {
    sourceNodesRef.current.forEach(source => {
      try { 
        source.stop(); 
        source.disconnect();
      } catch(e) {}
    });
    sourceNodesRef.current = [];
    setActiveNote(null);
  };

  // Filtrar notas para la octava seleccionada
  const filteredNotes = pianoNotes.filter(note => 
    Math.floor(note.midi / 12) - 1 === selectedOctave
  );

  return (
    <div style={{backgroundColor: 'gray'}} className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Generador de Piano Completo</h1>
        <p className="text-gray-600 mb-6">
          Carga un sample de referencia (A4 440Hz recomendado) para generar las 88 notas del piano
        </p>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de audio de referencia:
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Usa un sample corto (1-2 segundos) de piano, guitarra o voz para mejores resultados
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar octava: {selectedOctave}
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={selectedOctave}
              onChange={(e) => setSelectedOctave(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>A0</span>
              <span>C8</span>
            </div>
          </div>
        </div>

        {isGenerating && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-blue-700">Generando muestras...</span>
              <span className="text-sm font-medium text-blue-700">{generationProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {isReady ? (
          <>
            <div className="mb-6 flex justify-center space-x-4">
              <button
                onClick={playOctave}
                disabled={isPlaying || isGenerating}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${
                  isPlaying || isGenerating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? 'Reproduciendo...' : `Reproducir Octava ${selectedOctave}`}
              </button>
              <button
                onClick={stopAllNotes}
                className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Detener
              </button>
            </div>

            <div className="relative h-32 overflow-x-auto">
              <div className="absolute flex space-x-1">
                {filteredNotes.map((note) => (
                  <button
                    key={note.midi}
                    onClick={() => playNote(note)}
                    className={`w-12 h-32 flex flex-col items-center justify-end pb-2 rounded-b-md border
                      ${note.name.includes('#') 
                        ? 'bg-black text-white h-20 -mx-2 z-10' 
                        : 'bg-white text-gray-800 border-gray-300'}
                      ${activeNote === note.midi ? 'ring-2 ring-blue-500' : ''}
                      hover:brightness-95 transition-all`}
                  >
                    <span className={`text-xs ${note.name.includes('#') ? 'text-white' : 'text-gray-600'}`}>
                      {note.name.replace('#', '♯')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Nota actual:</strong> {activeNote ? pianoNotes.find(n => n.midi === activeNote)?.name : 'Ninguna'}</p>
              <p><strong>Frecuencia:</strong> {activeNote ? pianoNotes.find(n => n.midi === activeNote)?.frequency.toFixed(2) + ' Hz' : '--'}</p>
              <p><strong>Muestras generadas:</strong> {noteBuffersRef.current.size}/88</p>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            {audioFile ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600">Procesando audio...</p>
              </div>
            ) : (
              <p className="text-gray-500">Sube un archivo de audio para generar el piano completo</p>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Consejos profesionales:</h3>
          <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
            <li>Para notas graves, usa samples con buen contenido de bajos</li>
            <li>Las teclas negras muestran sostenidos (♯) en notación musical</li>
            <li>Mantén pulsaciones cortas para mejor rendimiento</li>
            <li>Octava 4 corresponde al rango central del piano</li>
            <li>El proceso de generación puede tardar varios segundos</li>
          </ul>
        </div>
      </div>
    </div>
  );
});

PianoGenerator.displayName = 'PianoGenerator';

export default PianoGenerator;













/*'use client';  para las 88 teclas funciona espectacular
import { useState, useRef, useEffect } from 'react';

const PianoGenerator = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [selectedOctave, setSelectedOctave] = useState(4);
  const audioContextRef = useRef(null);
  const sourceNodesRef = useRef([]);
  const masterGainRef = useRef(null);
  const baseBufferRef = useRef(null);

  // Generar frecuencias para las 88 notas del piano (A0 a C8)
  const generatePianoFrequencies = () => {
    const notes = [];
    for (let midi = 21; midi <= 108; midi++) {
      const freq = 440 * Math.pow(2, (midi - 69) / 12); // Fórmula MIDI
      const noteName = getNoteName(midi);
      notes.push({
        midi,
        name: noteName,
        frequency: freq,
        playbackRate: Math.pow(2, (midi - 69) / 12) // Ratio basado en A4
      });
    }
    return notes;
  };

  // Convertir número MIDI a nombre de nota (ej. 69 -> "A4")
  const getNoteName = (midiNote) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
  };

  const pianoNotes = generatePianoFrequencies();

  // Inicializar AudioContext y efectos
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 44100,
      latencyHint: 'playback'
    });
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.gain.value = 0.7;
    masterGainRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Cargar y procesar archivo de audio
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReady(false);
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Limitar duración del sample
      if (audioBuffer.duration > 3) {
        alert('Usa samples cortos (menos de 3 segundos) para mejor rendimiento');
        return;
      }

      baseBufferRef.current = audioBuffer;
      setIsReady(true);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error al procesar el archivo. Usa formatos WAV o MP3.');
    }
  };

  // Reproducir nota con optimizaciones
  const playNote = (note) => {
    if (!isReady) return;

    stopAllNotes();
    setActiveNote(note.midi);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = baseBufferRef.current;
    
    // Estrategia híbrida para mejor calidad
    source.playbackRate.value = note.playbackRate;
    
    // Configurar envolvente ADSR
    const gainNode = audioContextRef.current.createGain();
    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(1, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    source.connect(gainNode);
    gainNode.connect(masterGainRef.current);
    
    source.start();
    source.stop(now + 1.5);
    
    sourceNodesRef.current.push(source);
    source.onended = () => setActiveNote(null);
  };

  // Reproducir octava completa
  const playOctave = async () => {
    if (!isReady || isPlaying) return;

    setIsPlaying(true);
    stopAllNotes();

    const octaveNotes = pianoNotes.filter(n => 
      Math.floor(n.midi / 12) - 1 === selectedOctave
    );

    const startTime = audioContextRef.current.currentTime + 0.1;
    
    octaveNotes.forEach((note, index) => {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = baseBufferRef.current;
      source.playbackRate.value = note.playbackRate;
      
      const gainNode = audioContextRef.current.createGain();
      const noteStart = startTime + index * 0.5;
      
      gainNode.gain.setValueAtTime(0, noteStart);
      gainNode.gain.linearRampToValueAtTime(1, noteStart + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteStart + 1);

      source.connect(gainNode);
      gainNode.connect(masterGainRef.current);
      
      source.start(noteStart);
      source.stop(noteStart + 1);
      
      sourceNodesRef.current.push(source);
    });

    setTimeout(() => setIsPlaying(false), octaveNotes.length * 500);
  };

  // Detener todas las notas
  const stopAllNotes = () => {
    sourceNodesRef.current.forEach(source => {
      try { 
        source.stop(); 
        source.disconnect();
      } catch(e) {}
    });
    sourceNodesRef.current = [];
    setActiveNote(null);
  };

  // Filtrar notas para la octava seleccionada
  const filteredNotes = pianoNotes.filter(note => 
    Math.floor(note.midi / 12) - 1 === selectedOctave
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Generador de Piano Completo</h1>
        <p className="text-gray-600 mb-6">
          Carga un sample de referencia (A4 440Hz recomendado) para generar las 88 notas del piano
        </p>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo de audio de referencia:
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-2 text-xs text-gray-500">
              Usa un sample corto (1-2 segundos) de piano, guitarra o voz para mejores resultados
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar octava: {selectedOctave}
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={selectedOctave}
              onChange={(e) => setSelectedOctave(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>A0</span>
              <span>C8</span>
            </div>
          </div>
        </div>

        {isReady ? (
          <>
            <div className="mb-6 flex justify-center space-x-4">
              <button
                onClick={playOctave}
                disabled={isPlaying}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${
                  isPlaying ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? 'Reproduciendo...' : `Reproducir Octava ${selectedOctave}`}
              </button>
              <button
                onClick={stopAllNotes}
                className="px-6 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Detener
              </button>
            </div>

            <div className="relative h-32 overflow-x-auto">
              <div className="absolute flex space-x-1">
                {filteredNotes.map((note) => (
                  <button
                    key={note.midi}
                    onClick={() => playNote(note)}
                    className={`w-12 h-32 flex flex-col items-center justify-end pb-2 rounded-b-md border
                      ${note.name.includes('#') 
                        ? 'bg-black text-white h-20 -mx-2 z-10' 
                        : 'bg-white text-gray-800 border-gray-300'}
                      ${activeNote === note.midi ? 'ring-2 ring-blue-500' : ''}
                      hover:brightness-95 transition-all`}
                  >
                    <span className={`text-xs ${note.name.includes('#') ? 'text-white' : 'text-gray-600'}`}>
                      {note.name.replace('#', '♯')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Nota actual:</strong> {activeNote ? pianoNotes.find(n => n.midi === activeNote)?.name : 'Ninguna'}</p>
              <p><strong>Frecuencia:</strong> {activeNote ? pianoNotes.find(n => n.midi === activeNote)?.frequency.toFixed(2) + ' Hz' : '--'}</p>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            {audioFile ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-gray-600">Procesando audio...</p>
              </div>
            ) : (
              <p className="text-gray-500">Sube un archivo de audio para generar el piano completo</p>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Consejos profesionales:</h3>
          <ul className="text-xs text-blue-700 list-disc pl-5 space-y-1">
            <li>Para notas graves, usa samples con buen contenido de bajos</li>
            <li>Las teclas negras muestran sostenidos (♯) en notación musical</li>
            <li>Mantén pulsaciones cortas para mejor rendimiento</li>
            <li>Octava 4 corresponde al rango central del piano</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PianoGenerator;
*/






/*'use client'; perfecto para una sola octaca desde C3
import { useState, useRef, useEffect } from 'react';

const AudioScaleGenerator = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const buffersRef = useRef([]);
  const sourceNodesRef = useRef([]);

  // Escala de Do mayor con frecuencias precisas
  const musicalScale = [
    { name: 'Do', frequency: 261.63, detune: 0 },     // C4
    { name: 'Re', frequency: 293.66, detune: 200 },   // D4 (+2 semitonos)
    { name: 'Mi', frequency: 329.63, detune: 400 },   // E4 (+4 semitonos)
    { name: 'Fa', frequency: 349.23, detune: 500 },   // F4 (+5 semitonos)
    { name: 'Sol', frequency: 392.00, detune: 700 },  // G4 (+7 semitonos)
    { name: 'La', frequency: 440.00, detune: 900 },   // A4 (+9 semitonos)
    { name: 'Si', frequency: 493.88, detune: 1100 },  // B4 (+11 semitonos)
    { name: 'Do (octava)', frequency: 523.25, detune: 1200 } // C5 (+12 semitonos)
  ];

  // Inicializar AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Cargar y procesar archivo de audio
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsReady(false);
    setAudioFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Precargar buffers para cada nota
      buffersRef.current = musicalScale.map(note => {
        const buffer = audioContextRef.current.createBuffer(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        
        // Copiar datos originales
        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
          buffer.getChannelData(channel).set(audioBuffer.getChannelData(channel));
        }
        
        return { buffer, detune: note.detune };
      });

      setIsReady(true);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error al procesar el archivo de audio');
    }
  };

  // Reproducir una nota individual
  const playNote = (index) => {
    if (!isReady || isPlaying) return;

    stopAllNotes();
    
    const { buffer, detune } = buffersRef.current[index];
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.detune.value = detune;
    source.connect(audioContextRef.current.destination);
    source.start();
    
    sourceNodesRef.current.push(source);
  };

  // Reproducir escala completa
  const playScale = async () => {
    if (!isReady || isPlaying) return;

    setIsPlaying(true);
    stopAllNotes();

    const scheduleNote = (index, time) => {
      if (index >= musicalScale.length) {
        setIsPlaying(false);
        return;
      }

      const { buffer, detune } = buffersRef.current[index];
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.detune.value = detune;
      source.connect(audioContextRef.current.destination);
      source.start(time);
      source.stop(time + 0.5); // Duración de 500ms por nota
      
      source.onended = () => scheduleNote(index + 1, time + 0.6); // 600ms entre notas
      sourceNodesRef.current.push(source);
    };

    // Programar primera nota
    scheduleNote(0, audioContextRef.current.currentTime);
  };

  // Detener todas las notas
  const stopAllNotes = () => {
    sourceNodesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourceNodesRef.current = [];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Generador de Escala (Web Audio API)</h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sube un sample de Do (261.63Hz):
          </label>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {isReady ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {musicalScale.map((note, index) => (
                <button
                  key={index}
                  onClick={() => playNote(index)}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300
                    transition-all hover:shadow-md flex flex-col items-center
                    bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-lg font-bold text-gray-800">{note.name}</span>
                  <span className="text-sm text-gray-600">{note.frequency.toFixed(2)} Hz</span>
                </button>
              ))}
            </div>

            <button
              onClick={playScale}
              disabled={isPlaying}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                isPlaying ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isPlaying ? 'Reproduciendo...' : 'Reproducir escala completa'}
            </button>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            {audioFile ? (
              <p className="text-gray-500">Procesando audio...</p>
            ) : (
              <p className="text-gray-500">Sube un archivo de audio para comenzar</p>
            )}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p><strong>Técnica:</strong> Web Audio API con buffers precargados y detune preciso</p>
          <p><strong>Latencia:</strong> ~5ms (óptimo para reproducción inmediata)</p>
        </div>
      </div>
    </div>
  );
};

export default AudioScaleGenerator;*/
