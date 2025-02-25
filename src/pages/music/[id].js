"use client";
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import '../../estilos/general/general.css';
import ImageAndText from '@/components/complex/imageAndText';
import MidiAndPdf from '@/components/complex/midiAndPdf';
import MainLogo from '@/components/complex/mainLogo';
import Modal from '@/components/complex/modal';
import { searchTagInDb } from '@/functions/music/searchTagInDb';
import getCSSVariableValue from '@/functions/music/getCSSVariableValue';
import Audio from '@/components/simple/audio';
import '../../estilos/music/music.css'




export default function Music() {
  // ============== ESTADOS PRINCIPALES ==============
  const [content, setContent] = useState([]);
  const [musicContent, setMusicContent] = useState([]);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tags, setTags] = useState([]);
  const [dynamicHeight, setDynamicHeight] = useState('60vh');

  // ============== EFECTOS DE DISEÑO ==============
  useLayoutEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const audioPlayerHeight = parseInt(getCSSVariableValue('--audioPlayerHeight'), 10);
      if (!isNaN(audioPlayerHeight)) {
        const remainingHeight = windowHeight - audioPlayerHeight - 30;
        setDynamicHeight(`${remainingHeight}px`);
      }
    };

    const timeoutId = setTimeout(calculateHeight, 100);
    window.addEventListener('resize', calculateHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  // ============== EFECTOS DE DATOS ==============
  useEffect(() => {
    if (content?.length > 0) {
      const idToFind = content[0].idObjeto;
      document.querySelectorAll('.highlight').forEach(element => {
        element.classList.remove('highlight');
      });
      const newElement = document.getElementById(idToFind);
      if (newElement) {
        newElement.classList.add('highlight');
        newElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [content, currentIndex]);

  useEffect(() => {
    searchTagInDb('', setContent, setMusicContent, setTags);
  }, []);

  // ============== FUNCIONES DE INTERFAZ ==============
  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  const handleItemClick = item => {
    setContent([item]);
    const index = musicContent.findIndex(c => c.idObjeto === item.idObjeto);
    if (index !== -1) setCurrentIndex(index);
  };

  // ============== RENDERIZADO ==============
  return (
    <div className='music-container backgroundColor1'>
      
      {/* Fondo difuminado */}
      {content[0]?.imagePrincipal?.src && (
        <div className='background-blur' style={{ backgroundImage: `url(${content[0].imagePrincipal.src})` }} > <div className='background-overlay' /></div>
      )}

      {/* Lista de contenido */}
      <div className='content-list spaceTopOnlyPhone'>
        <div 
          className='content-list-inner' 
          style={{ height: dynamicHeight }}
        >
          <ImageAndText content={musicContent} onItemClick={handleItemClick} />
        </div>
      </div>

      {/* Reproductor de audio */}
      {content[0]?.audioPrincipal?.src && (
        <Audio
          src={content[0].audioPrincipal.src}
          allMusicProyects={musicContent}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          setContent={setContent}
          tags={tags}
          setTags={setTags}
          setMusicContent={setMusicContent}
          isContentVisible={isContentVisible}
          toggleContentVisibility={toggleContentVisibility}
        />
      )}

      {/* Overlay de carga */}
      {isLoading && (
        <div className='loading-overlay'>
          <MainLogo animate={true} size={'40vh'} />
        </div>
      )}
    </div>
  );
}