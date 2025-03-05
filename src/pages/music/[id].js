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
import '../../estilos/music/music.css';
import ShowComponentButton from '@/components/complex/showComponentButton';
import Video from '@/components/simple/video';
import BackgroundGeneric from '@/components/complex/backgroundGeneric';
import RotatingContentLoader from '@/components/complex/rotatingContentLoader';
import QualitySelectorModal from '@/components/complex/qualitySelectorModal';
import FullScreenMedia from '@/components/complex/fullScreenMedia';
import ColorPicker from '@/components/complex/colorPicker';
import InternetStatus from '@/components/complex/internetStatus';
import { useRouter } from 'next/router';
import { Collection } from 'mongoose';


export default function Music() {
  // ============== ESTADOS PRINCIPALES ==============
  const [content, setContent] = useState([]);
  const [musicContent, setMusicContent] = useState([]);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTimeMedia, setCurrentTimeMedia] = useState(0);
  const [tags, setTags] = useState([]);
  const [dynamicHeight, setDynamicHeight] = useState('60vh');
  const [componentInUse, setComponentInUse] = useState('');
  const [isFirstTimeLoading, setIsFirstTimeLoading] = useState(true);
  const [showComponent, setShowComponent] = useState('audio');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para controlar la clase de transición
  const [volumeMedia, setVolumeMedia] = useState(1);
  const [qualityMedia, setQualityMedia] = useState(25);
  const [isRepeatMedia, setIsRepeatMedia] = useState(false);
  const [isShuffleMedia, setIsShuffleMedia] = useState(false);
  const [isMutedMedia, setIsMutedMedia] = useState(false);
  const [modalContent, setModalContent] = useState(<MidiAndPdf content={content[0]} />);
  const [isVisible, setIsVisible] = useState(false);
  const [isRenderingLoader, setIsRenderingLoader] = useState(false); // Nuevo estado para controlar el renderizado del loader
  const [isLike, setIsLike] = useState([]);
  const [isHybridView , setIsHybridView] = useState(true);
  const [componentNameUsingModal, setComponentNameUsingModal] = useState('');

  const router = useRouter();
  const { id, type, quality } = router.query;

  const messages = [
    'Tuning the strings of the universe...',
    'Composing the melody of your experience...',
    'Harmonizing the beats of your journey...',
    'Creating symphonies of possibilities...',
    'Orchestrating the perfect harmony for you...'
  ];

  useEffect(() => {
    if(type){
      console.log(type);
      if(type === 'hybridView'){
        setShowComponent('audio')
      } else if(type === 'audio' || type === 'video'){
        setShowComponent(type)
      }
    }
  }, []);



  function changeStateMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  useEffect(() => {
    if (isLoadingMedia || isLoading) {
      // Si isLoadingMedia es true, hacer visible el componente
      setIsVisible(true);
      setIsRenderingLoader(true); // Asegurarse de que el loader esté en el DOM
    } else {
      // Si isLoadingMedia es false, esperar un momento antes de ocultar el componente
      setIsVisible(false);
      const timeout = setTimeout(() => {
        setIsRenderingLoader(false); // Ocultar el loader después de que la animación termine
      }, 800); // Retraso de 800ms para que el fade-out se complete
      return () => clearTimeout(timeout);
    }
  }, [isLoadingMedia, isLoading]);

  useEffect(() => {
    if (musicContent && musicContent.length > 0) {
      const initialLikes = musicContent.map(() => ({ audio: false, video: false }));
      setIsLike(initialLikes);
    }
  }, [musicContent]);

  useEffect(() => {
    //console.log(isLike);
  }, [isLike]);

  useEffect(() => {
    if (isModalOpen === false) {
      setComponentNameUsingModal('');
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (componentNameUsingModal === 'download') {
      toggleContentVisibility();
    }
  }, [content]);

  // ============== EFECTOS DE DISEÑO ==============
  useLayoutEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const audioPlayerHeight = parseInt(getCSSVariableValue('--audioPlayerHeight'), 10);
      if (!isNaN(audioPlayerHeight)) {
        const remainingHeight = windowHeight - audioPlayerHeight - 80;
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
      console.log('llega');
      setIsLoading(false);
      const idToFind = content[0].idObjeto;
      document.querySelectorAll('.highlight').forEach(element => {
        element.classList.remove('highlight');
      });

      setTimeout(() => {
        const newElement = document.getElementById(idToFind);
        if (newElement) {
          newElement.classList.add('highlight');
          newElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [content, currentIndex, musicContent, componentInUse]);

  /*useEffect(() => {
    searchTagInDb('', setContent, setMusicContent, setTags);
  }, []);*/

  
  useEffect(() => {
    console.log('ID:', id);
    console.log('Type:', type);
    console.log('Quality:', quality);
  
    if (id) {
      if (id.includes('id=') || id.includes('globalCollections=') || id.includes('tag=')) {
        searchTagInDb('', setContent, setMusicContent, setTags, id, setModalContent, setIsModalOpen, setIsLoading, setIsLoadingMedia);
      } 
    }
  }, [id]);

  useEffect(() => {
    if (type === 'audio' || type === 'video' || type === 'hybridView') {
      //setComponentInUse(type)
      setShowComponent(type)
    }
  }, [type, quality]);

  useEffect(() => {
    console.log(qualityMedia);
  }, [qualityMedia]);

  useEffect(() => {
    console.log(`showComponent: ${showComponent}`);
    if (componentInUse !== '') {
      setComponentInUse(showComponent);
    }
  }, [showComponent]);

  useEffect(() => {
    console.log(`componentInUse: ${componentInUse}`);
  }, [componentInUse]);

  // ============== FUNCIONES DE INTERFAZ ==============
  const toggleContentVisibility = () => {
    setIsModalOpen(true);
    setModalContent(<MidiAndPdf content={content[0]} />);
    setComponentNameUsingModal('download');
  };

  const handleQualityChange = (newQuality) => {
    setQualityMedia(newQuality);
    setIsModalOpen(false);
  };

  const openQualityModal = () => {
    setModalContent(
      <QualitySelectorModal
        isOpen={true}
        onClose={() => setIsModalOpen(false)}  // Aquí pasas una función anónima
        onQualityChange={handleQualityChange}
        quality={qualityMedia}
      />
    );
    setIsModalOpen(true);
  };

  const openUpdateBackgroundColor = () =>{
    setModalContent(<ColorPicker onClose={() => setIsMenuOpen(false)}/>)
    setIsModalOpen(true);
  }

  const handleItemClick = item => {
    setContent([item]);
    const index = musicContent.findIndex(c => c.idObjeto === item.idObjeto);
    if (index !== -1) setCurrentIndex(index);
    setComponentInUse('audio');
    setCurrentTimeMedia(0);
  };

  

  // ============== Variables comunes entre Audio y Video ==============
  const commonProps = {
    allMusicProyects: musicContent,
    currentIndex: currentIndex,
    setCurrentIndex: setCurrentIndex,
    setContent: setContent,
    tags: tags,
    setTags: setTags,
    setMusicContent: setMusicContent,
    isContentVisible: isContentVisible,
    toggleContentVisibility: toggleContentVisibility,
    componentInUse: componentInUse,
    setComponentInUse: setComponentInUse,
    setShowComponent: setShowComponent,
    showComponent: showComponent,
    setCurrentTimeMedia: setCurrentTimeMedia,
    currentTimeMedia: currentTimeMedia,
    changeStateMenu: changeStateMenu,
    setIsMenuOpen: setIsMenuOpen,
    isMenuOpen: isMenuOpen,
    setVolumeMedia: setVolumeMedia,
    volumeMedia: volumeMedia,
    setQualityMedia: setQualityMedia,
    qualityMedia: qualityMedia,
    setIsRepeatMedia: setIsRepeatMedia,
    isRepeatMedia: isRepeatMedia,
    setIsShuffleMedia: setIsShuffleMedia,
    isShuffleMedia: isShuffleMedia,
    setIsMutedMedia: setIsMutedMedia,
    isMutedMedia: isMutedMedia,
    openQualityModal: openQualityModal,
    openUpdateBackgroundColor: openUpdateBackgroundColor,
    content: content,
    setIsLoadingMedia: setIsLoadingMedia,
    handleItemClick: handleItemClick,
    isHybridView: isHybridView
  };

  // ============== RENDERIZADO ==============
  return (
    <>
      {/* Capa de carga para isLoadingMedia o isLoading */}
      {isRenderingLoader && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semitransparente
            backdropFilter: 'blur(10px)', // Efecto de distorsión
            zIndex: 1000, // Asegura que esté por encima del contenido
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isVisible ? 1 : 0, // Controla la opacidad basada en isVisible
            transition: 'opacity 0.8s ease-in-out', // Transición suave
            pointerEvents: isVisible ? 'auto' : 'none', // Permite o bloquea la interacción
          }}
          className={isVisible ? 'fade-in' : 'fade-out'} // Aplica fade-in o fade-out
        >
          {/* Contenido centrado con animación */}
          <div style={{ textAlign: 'center' }}>
            <MainLogo animate={true} size={'10vh'} /> {/* Logo animado */}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {!isLoading && (
        <FullScreenMedia
          showComponent={showComponent}
          content={content}
          musicContent={musicContent}
          dynamicHeight={dynamicHeight}
          isFirstTimeLoading={isFirstTimeLoading}
          setIsFirstTimeLoading={setIsFirstTimeLoading}
          setIsLoading={setIsLoading}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          modalContent={modalContent}
          tags={tags}
          setTags={setTags}
          setContent={setContent}
          setMusicContent={setMusicContent}
          setContentModal={setModalContent}
          setCurrentTimeMedia={setCurrentTimeMedia}
          commonProps={commonProps}
          handleItemClick={handleItemClick}
          setIsLike={setIsLike} 
          isLike={isLike}
          isHybridView={isHybridView}
        />
      )}

      <InternetStatus setModalContent={setModalContent} setIsModalOpen={setIsModalOpen}/>
    </>
  );
}