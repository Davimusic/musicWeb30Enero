'use client';
import { useState, useEffect } from 'react';

const MusicTheoryCalculator = () => {
  // Datos musicales
  const notasMusicales = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const tiposEscalas = {
    mayor: [2, 2, 1, 2, 2, 2, 1],
    menorNatural: [2, 1, 2, 2, 1, 2, 2],
    menorArmonica: [2, 1, 2, 2, 1, 3, 1],
    menorMelodica: { ascendente: [2, 1, 2, 2, 2, 2, 1], descendente: [2, 1, 2, 2, 1, 2, 2] },
    dobleArmonica: [1, 3, 1, 2, 1, 3, 1],
    jonica: [2, 2, 1, 2, 2, 2, 1],
    dorica: [2, 1, 2, 2, 2, 1, 2],
    frigia: [1, 2, 2, 2, 1, 2, 2],
    lidia: [2, 2, 2, 1, 2, 2, 1],
    mixolidia: [2, 2, 1, 2, 2, 1, 2],
    eolica: [2, 1, 2, 2, 1, 2, 2],
    locria: [1, 2, 2, 1, 2, 2, 2]
  };

  const tiposAcordes = {
    mayor: { intervalos: [0, 4, 7], tensiones: ['9', '#11', '13'] },
    menor: { intervalos: [0, 3, 7], tensiones: ['9', '11', '13'] },
    aumentado: { intervalos: [0, 4, 8], tensiones: ['9', '#11'] },
    disminuido: { intervalos: [0, 3, 6], tensiones: ['b9', '11'] },
    '7': { intervalos: [0, 4, 7, 10], tensiones: ['b9', '#9', '#11', 'b13'] },
    mayor7: { intervalos: [0, 4, 7, 11], tensiones: ['9', '#11', '13'] },
    menor7: { intervalos: [0, 3, 7, 10], tensiones: ['9', '11', '13'] },
    disminuido7: { intervalos: [0, 3, 6, 9], tensiones: [] },
    semiDisminuido7: { intervalos: [0, 3, 6, 10], tensiones: ['11', 'b13'] },
    aumentado7: { intervalos: [0, 4, 8, 10], tensiones: ['#9', '#11'] },
    menor7mayor7: { intervalos: [0, 3, 7, 11], tensiones: ['9', '13'] },
    '9': { intervalos: [0, 4, 7, 10, 14], tensiones: ['#11', '13'] },
    mayor9: { intervalos: [0, 4, 7, 11, 14], tensiones: ['#11', '13'] },
    menor9: { intervalos: [0, 3, 7, 10, 14], tensiones: ['11', '13'] },
    '11': { intervalos: [0, 4, 7, 10, 14, 17], tensiones: ['13'] },
    '13': { intervalos: [0, 4, 7, 10, 14, 17, 21], tensiones: [] },
    alterado: { intervalos: [0, 4, 6, 10, 13, 15], tensiones: [] },
    '7b5': { intervalos: [0, 4, 6, 10], tensiones: ['b9', '#9'] },
    '7#5': { intervalos: [0, 4, 8, 10], tensiones: ['b9', '#9'] },
    '6/9': { intervalos: [0, 4, 7, 9, 14], tensiones: [] },
    hendrix: { intervalos: [0, 7, 10, 14, 15], tensiones: [] }
  };

  // Estados
  const [notaSeleccionada, setNotaSeleccionada] = useState('C');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('escala');
  const [subtipoSeleccionado, setSubtipoSeleccionado] = useState('mayor');
  const [tensionesSeleccionadas, setTensionesSeleccionadas] = useState([]);
  const [resultado, setResultado] = useState([]);
  const [direccionEscala, setDireccionEscala] = useState('ascendente');

  // Calcular resultado cuando cambian las dependencias
  useEffect(() => {
    const calcular = () => {
      const indiceTonica = notasMusicales.indexOf(notaSeleccionada);
      if (indiceTonica === -1) return [];

      if (tipoSeleccionado === 'escala') {
        let patron;
        if (subtipoSeleccionado === 'menorMelodica') {
          patron = tiposEscalas.menorMelodica[direccionEscala];
        } else {
          patron = tiposEscalas[subtipoSeleccionado];
        }

        if (!patron) return [];
        
        let escala = [notasMusicales[indiceTonica]];
        let indiceActual = indiceTonica;

        for (const intervalo of patron) {
          indiceActual = (indiceActual + intervalo) % 12;
          escala.push(notasMusicales[indiceActual]);
        }

        return escala;
      } else {
        const acorde = tiposAcordes[subtipoSeleccionado];
        if (!acorde) return [];
        
        let notas = acorde.intervalos.map(intervalo => 
          notasMusicales[(indiceTonica + intervalo) % 12]
        );

        tensionesSeleccionadas.forEach(t => {
          if (acorde.tensiones.includes(t)) {
            let valorTension;
            switch(t.replace(/[b#]/, '')) {
              case '9': valorTension = 14; break;
              case '11': valorTension = 17; break;
              case '13': valorTension = 21; break;
              default: valorTension = 0;
            }
            if (t.includes('b')) valorTension -= 1;
            if (t.includes('#')) valorTension += 1;
            
            const notaTension = notasMusicales[(indiceTonica + valorTension) % 12];
            if (!notas.includes(notaTension)) {
              notas.push(notaTension);
            }
          }
        });

        return notas;
      }
    };

    setResultado(calcular());
  }, [notaSeleccionada, tipoSeleccionado, subtipoSeleccionado, tensionesSeleccionadas, direccionEscala]);

  // Manejadores de cambios
  const handleNotaChange = (e) => setNotaSeleccionada(e.target.value);
  
  const handleTipoChange = (e) => {
    const nuevoTipo = e.target.value;
    setTipoSeleccionado(nuevoTipo);
    setSubtipoSeleccionado(nuevoTipo === 'escala' ? 'mayor' : 'mayor');
    setTensionesSeleccionadas([]);
  };

  const handleSubtipoChange = (e) => setSubtipoSeleccionado(e.target.value);

  const handleTensionChange = (tension) => {
    setTensionesSeleccionadas(prev => 
      prev.includes(tension) 
        ? prev.filter(t => t !== tension) 
        : [...prev, tension]
    );
  };

  const handleDireccionChange = () => {
    setDireccionEscala(prev => prev === 'ascendente' ? 'descendente' : 'ascendente');
  };

  // Funciones auxiliares
  const getNombreCompleto = () => {
    if (tipoSeleccionado === 'escala') {
      let nombre = `${notaSeleccionada} ${subtipoSeleccionado}`;
      if (subtipoSeleccionado === 'menorMelodica') {
        nombre += ` (${direccionEscala})`;
      }
      return nombre;
    } else {
      let nombre = `${notaSeleccionada}${subtipoSeleccionado}`;
      if (tensionesSeleccionadas.length > 0) {
        nombre += ` (${tensionesSeleccionadas.join(', ')})`;
      }
      return nombre;
    }
  };

  const getSubtipos = () => {
    return tipoSeleccionado === 'escala' 
      ? Object.keys(tiposEscalas) 
      : Object.keys(tiposAcordes);
  };

  const getTensionesDisponibles = () => {
    return tipoSeleccionado === 'acorde' 
      ? tiposAcordes[subtipoSeleccionado]?.tensiones || [] 
      : [];
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Calculadora Musical</h1>
      
      <div className="space-y-4">
        {/* Selector de nota */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nota:</label>
          <select
            value={notaSeleccionada}
            onChange={handleNotaChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            {notasMusicales.map(nota => (
              <option key={nota} value={nota}>{nota}</option>
            ))}
          </select>
        </div>

        {/* Selector de tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo:</label>
          <select
            value={tipoSeleccionado}
            onChange={handleTipoChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            <option value="escala">Escala</option>
            <option value="acorde">Acorde</option>
          </select>
        </div>

        {/* Selector de subtipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {tipoSeleccionado === 'escala' ? 'Tipo de Escala' : 'Tipo de Acorde'}:
          </label>
          <select
            value={subtipoSeleccionado}
            onChange={handleSubtipoChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            {getSubtipos().map(subtipo => (
              <option key={subtipo} value={subtipo}>
                {subtipo}
              </option>
            ))}
          </select>
        </div>

        {/* Dirección de escala (solo para melódica) */}
        {tipoSeleccionado === 'escala' && subtipoSeleccionado === 'menorMelodica' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Dirección:</label>
            <button
              onClick={handleDireccionChange}
              className="mt-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200"
            >
              {direccionEscala === 'ascendente' ? 'Ascendente' : 'Descendente'}
            </button>
          </div>
        )}

        {/* Selector de tensiones (solo para acordes) */}
        {tipoSeleccionado === 'acorde' && getTensionesDisponibles().length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Tensiones:</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {getTensionesDisponibles().map(tension => (
                <button
                  key={tension}
                  type="button"
                  onClick={() => handleTensionChange(tension)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    tensionesSeleccionadas.includes(tension)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {tension}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultado */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">{getNombreCompleto()}</h2>
          <div className="flex flex-wrap gap-2">
            {resultado.map((nota, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full"
              >
                {nota}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicTheoryCalculator;












/*import React from "react";
import QRGenerator from "@/components/complex/QRGenerator";

export default function HomePage() {
  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Generador de Código QR Personalizable</h1>
      <QRGenerator 
        value="https://app.brevo.com/contact/list"  // Valor o URL a codificar
        width={500}
        height={500}
        image="https://res.cloudinary.com/dplncudbq/image/upload/v1740088605/exclusiveMusicForExclusivePeople/tik5d_20250220_165649/xahzj2sgmlra6u7cnhhb.jpg"    // Si no tienes un logo en ruta, dejarlo vacío. Sino, provee un path accesible.
        dotsColor="back"            // Color personalizado para los puntos
        bgColor="red"              // Color personalizado para el fondo
        dotsType="classy"              // Por ej.: "classy", "rounded", classy-rounded etc.
        cornersType="dot"              // Por ej.: "dot", "square", extra-rounded etc.
      />
    </div>
  );
}*/










/*import ImageSlider from "@/components/complex/imageSlider";
import '../estilos/general/general.css'

export default function Home() {
  const images = [
    "https://res.cloudinary.com/dplncudbq/image/upload/v1740088605/exclusiveMusicForExclusivePeople/tik5d_20250220_165649/xahzj2sgmlra6u7cnhhb.jpg",
    "https://res.cloudinary.com/dplncudbq/image/upload/v1740088487/exclusiveMusicForExclusivePeople/tik3_20250220_165447/u7orq2vc0pwiewoxiagi.jpg",
    "https://res.cloudinary.com/dplncudbq/image/upload/v1739834151/exclusiveMusicForExclusivePeople/saul_20250217_181549/bhir7pnxzcdt0tomyjcj.png",
  ];

  return (
    <div className="fullscreen-floating">
      otra infohghghghg
      hghghg
      ghghgg
      <div style={{width: '100%'}}>
      <ImageSlider
  images={images}
  showControls={true}
  controls={{
    showPrevious: true,
    showPlayPause: true,
    showNext: true,
    showShuffle: true,
    showEffects: true
  }}
  timeToShow = {5000}
/>

      </div>
    </div>
  );
}*/






/*import React, { useState, useEffect } from 'react';

const FileGroupsDisplay = () => {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/blackBlaze/listAllPublicSamples');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setGroups(data.groups);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  if (loading) return <div>Cargando archivos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Grupos de Archivos</h1>
      {Object.entries(groups).map(([folderPath, files]) => (
        <div
          key={folderPath}
          style={{
            marginBottom: '2rem',
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '4px'
          }}
        >
          <h2>{folderPath}</h2>
          {files.map(file => (
            <div key={file.fileName} style={{ marginBottom: '1rem' }}>
              <p>
                <strong>
                  {file.fileName.split('/').pop()} 
                </strong> ({file.contentLength} bytes)
              </p>
              <audio controls src={file.signedUrl}>
                Tu navegador no soporta el elemento de audio.
              </audio>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FileGroupsDisplay;*/
