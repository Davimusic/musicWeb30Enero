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
import ShowComponentButton from '@/components/complex/showComponentButton';
import Video from '@/components/simple/video';
import BackgroundGeneric from '@/components/complex/backgroundGeneric';
import RotatingContentLoader from '@/components/complex/rotatingContentLoader';


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



  const messages = [
    'Tuning the strings of the universe...',
    'Composing the melody of your experience...',
    'Harmonizing the beats of your journey...',
    'Creating symphonies of possibilities...',
    'Orchestrating the perfect harmony for you...'
  ];

  function changeStateMenu(){
    setIsMenuOpen(!isMenuOpen)
  }


  useEffect(() => {
    console.log(isMenuOpen);
  }, [isMenuOpen]);


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
      console.log('llega');
      
      setIsLoading(false)
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
    searchTagInDb('', setContent, setMusicContent, setTags)
  }, []);

  useEffect(() => {
    console.log(qualityMedia);
  }, [qualityMedia]);

  useEffect(() => {
    console.log(`showComponent: ${showComponent}`);
    if(componentInUse !== ''){
      setComponentInUse(showComponent)
    }
  }, [showComponent]);

  useEffect(() => {
    console.log(`componentInUse: ${componentInUse}`);
  }, [componentInUse]);




  // ============== FUNCIONES DE INTERFAZ ==============
  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
  };

  const handleItemClick = item => {
    setContent([item]);
    const index = musicContent.findIndex(c => c.idObjeto === item.idObjeto);
    if (index !== -1) setCurrentIndex(index);
    setComponentInUse('audio')
    setCurrentTimeMedia(0)
  };

  

  // ============== RENDERIZADO ==============
  return (
    <>
      {isLoading ? (
        <BackgroundGeneric isLoading={true} style={{width: '100vw', height: '100hv'}} className={'background-container'}>
        <div style={{ textAlign: 'center' }}>
          <MainLogo animate={true} size={'40vh'} />
          <RotatingContentLoader className={'text-container'} contents={messages} isLoading={true} intervalTime={1000}/>
        </div>
      </BackgroundGeneric>
      ) : (
        <div className='music-container backgroundColor1'>
          {/* Contenedor para Audio */}
          {showComponent === 'audio' && content[0]?.audioPrincipal?.src && (
            <>
              {content[0]?.imagePrincipal?.src && (
                <div className='background-blur' style={{ backgroundImage: `url(${content[0].imagePrincipal.src})` }}>
                  <div className='background-overlay' />
                </div>
              )}
              <div className='content-list spaceTopOnlyPhone'>
                <div className='content-list-inner' style={{ height: dynamicHeight }}>
                  <ImageAndText content={musicContent} onItemClick={handleItemClick} />
                </div>
              </div>
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
                componentInUse={componentInUse}
                setComponentInUse={setComponentInUse}
                isFirstTimeLoading={isFirstTimeLoading}
                setIsFirstTimeLoading={setIsFirstTimeLoading}
                setShowComponent={setShowComponent}
                showComponent={showComponent}
                setCurrentTimeMedia={setCurrentTimeMedia}
                currentTimeMedia={currentTimeMedia}
                changeStateMenu={changeStateMenu}
                isMenuOpen={isMenuOpen}
                setVolumeMedia={setVolumeMedia}
                volumeMedia={volumeMedia}
                setQualityMedia={setQualityMedia}
                qualityMedia={qualityMedia}
                setIsRepeatMedia={setIsRepeatMedia}
                isRepeatMedia={isRepeatMedia}
                setIsShuffleMedia={setIsShuffleMedia}
                isShuffleMedia={isShuffleMedia}
                setIsMutedMedia={setIsMutedMedia}
                isMutedMedia={isMutedMedia}
              />
            </>
          )}
  
          {/* Contenedor para Video */}
          {showComponent === 'video' && content[0]?.videoPrincipal?.src && (
            <Video
              src={content[0].videoPrincipal.src}
              allMusicProyects={musicContent}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              setContent={setContent}
              tags={tags}
              setTags={setTags}
              setMusicContent={setMusicContent}
              isContentVisible={isContentVisible}
              toggleContentVisibility={toggleContentVisibility}
              componentInUse={componentInUse}
              setComponentInUse={setComponentInUse}
              setIsLoading={setIsLoading}
              isVideoFullScreen={false}
              isEndendVideo={false}
              setIsModalOpen={setIsModalOpen}
              isModalOpen={isModalOpen}
              content={content}
              handleItemClick={handleItemClick}
              setShowComponent={setShowComponent}
              showComponent={showComponent}
              setCurrentTimeMedia={setCurrentTimeMedia}
              currentTimeMedia={currentTimeMedia}
              changeStateMenu={changeStateMenu}
              isMenuOpen={isMenuOpen}
              setVolumeMedia={setVolumeMedia}
              volumeMedia={volumeMedia}
              setQualityMedia={setQualityMedia}
              qualityMedia={qualityMedia}
              setIsRepeatMedia={setIsRepeatMedia}
              isRepeatMedia={isRepeatMedia}
              setIsShuffleMedia={setIsShuffleMedia}
              isShuffleMedia={isShuffleMedia}
              setIsMutedMedia={setIsMutedMedia}
              isMutedMedia={isMutedMedia}
            />
          )}
        </div>
      )}
    </>
  );
  
}