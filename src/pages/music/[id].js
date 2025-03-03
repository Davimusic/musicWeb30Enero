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
  const [componentNameUsingModal, setComponentNameUsingModal] = useState('');

  const messages = [
    'Tuning the strings of the universe...',
    'Composing the melody of your experience...',
    'Harmonizing the beats of your journey...',
    'Creating symphonies of possibilities...',
    'Orchestrating the perfect harmony for you...'
  ];

  function changeStateMenu() {
    setIsMenuOpen(!isMenuOpen);
  }

  useEffect(() => {
    console.log(componentNameUsingModal);
  }, [componentNameUsingModal]);

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

  useEffect(() => {
    searchTagInDb('', setContent, setMusicContent, setTags);
  }, []);

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
    content: content
  };

  // ============== RENDERIZADO ==============
  return (
    <>
      {isLoading ? (
        <BackgroundGeneric isLoading={true} style={{ width: '100vw', height: '100vh' }} className={'background-container'}>
          <div style={{ textAlign: 'center' }}>
            <MainLogo animate={true} size={'40vh'} />
            <RotatingContentLoader className={'text-container'} contents={messages} isLoading={true} intervalTime={3000} />
          </div>
        </BackgroundGeneric>
      ) : (
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
          commonProps={commonProps}
          handleItemClick={handleItemClick}
        />
      )}
    </>
  );
}