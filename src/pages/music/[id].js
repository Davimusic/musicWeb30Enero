"use client";
import React, { useEffect, useState, useRef } from 'react';
import Audio from '@/components/simple/audio';
import ImageAndText from '@/components/complex/imageAndText';
import mapCompositionsToMusicContent from '@/functions/music/mapCompositionsToMusicContent';
import MidiAndPdf from '@/components/complex/midiAndPdf';
import Video from '@/components/simple/video';
import DownloadIcon from '@/components/complex/downloadIcon';
'../../estilos/general/general.css';
import MainLogo from '@/components/complex/mainLogo';
import Modal from '@/components/complex/modal';
import ExpandIcon from '@/components/complex/expandIcon';
import SeacrhTagInDb from '@/components/complex/searchTag';
import { searchTagInDb } from '@/functions/music/searchTagInDb';
import MenuIcon from '@/components/complex/menuIcon';
import Menu from '@/components/complex/menu';
import ImageAndHeart from '@/components/complex/imageAndHeart';











export default function Music() {
  const [content, setContent] = useState([]);
  const [musicContent, setMusicContent] = useState([]);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [currentTimeMedia, setCurrentTimeMedia] = useState(0);
  const [componentInUse, setComponentInUse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoFullScreen, setIsVideoFullScreen] = useState(false);
  const [isEndedVideo, setIsEndedVideo] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tags, setTags] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dynamicHeight, setDynamicHeight] = useState('60vh');
  const [contentModal, setContentModal] = useState('');
  const [isFirstTimeLoading, setIsFirstTimeLoading] = useState(true);
  const audioPlayerRef = useRef(null); // Referencia para el reproductor de audio

  useEffect(() => {
    const calculateHeight = () => {
      if (audioPlayerRef.current) {
        const windowHeight = window.innerHeight;
        const audioPlayerHeight = audioPlayerRef.current.offsetHeight;
        const remainingHeight = windowHeight - audioPlayerHeight - 20;//el 20 es padding top
        setDynamicHeight(`${remainingHeight}px`);
      }
    };

    calculateHeight(); // Calcula la altura inicial
    window.addEventListener('resize', calculateHeight); // Recalcula en cada resize

    return () => {
      window.removeEventListener('resize', calculateHeight); // Limpia el listener
    };
  }, []);

  useEffect(() => {
    if (content && content.length > 0) {
      const idToFind = content[0].idObjeto;
      const highlightedElements = document.querySelectorAll('.highlight');
      highlightedElements.forEach(element => {
        element.classList.remove('highlight');
      });
      const newElement = document.getElementById(idToFind);
      if (newElement) {
        newElement.classList.add('highlight');
        newElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [content]);

  useEffect(() => {
    console.log(tags);
  }, [tags]);

  useEffect(() => {
    console.log(componentInUse);
  }, [componentInUse]);

  useEffect(() => {
    console.log(currentIndex);
  }, [currentIndex]);

  /*useEffect(() => {
    startLoading();
    const loadTime = Math.random() * 1000;
    setTimeout(() => {
      stopLoading();
    }, loadTime);

    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, []);*/

  useEffect(() => {
    searchTagInDb('', setContent, setMusicContent, setTags);
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleItemClick = (item) => {
    setContent([item]);
    console.log("Item seleccionado:", item);
  };

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
    openModal()
    setContentModal(<MidiAndPdf content={content} onItemClick={handleItemClick}/>)
  };

  const startLoading = () => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
    }, 500);
    setLoadingTimeout(timeout);
  };

  const stopLoading = () => {
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }
    setIsLoading(false);
  };

  const toggleVideoFullScreen = () => {
    const newFullScreenState = !isVideoFullScreen;
    setIsVideoFullScreen(newFullScreenState);
    setComponentInUse(newFullScreenState ? 'video' : 'audio');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (content && content.length > 0) {
    return (
      <div className='backgroundColor1' style={{ height: '100vh', display: 'block' }}>
        <Modal isOpen={isModalOpen} onClose={closeModal} children={contentModal} className={'backgroundColor3'}/>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${content[0].imagePrincipal.src})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px)', opacity: '0.5', margin: '20px', zIndex: 1, boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)', borderRadius: '20px' }}></div>
        <div className='spaceTopOnlyPhone' style={{ scrollbarWidth: 'thin', position: 'relative', zIndex: 2 }}>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div className="input-container-CellUP backgroundColor2" onClick={(e) => e.stopPropagation()}>
              <SeacrhTagInDb setIsModalOpen={setIsModalOpen} setContentModal={setContentModal} tags={tags} setTags={setTags} setContent={setContent} setMusicContent={setMusicContent} />
            </div>
          </div>
          <div style={{paddingTop: '20px'}}></div>
          <div style={{height: dynamicHeight, overflow: 'auto' }}>
            <ImageAndText content={musicContent} onItemClick={handleItemClick} />
          </div>
        </div>
        <div 
          ref={audioPlayerRef} // Asignamos la referencia aquí
          className='backgroundColor2 audioPLayerContent' 
          style={{ 
            padding: '10px', 
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            zIndex: 2, 
            borderRadius: '20px',
            margin: '10px', 
            maxHeight: '80vh', 
            boxShadow: '0px -5px 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <MenuIcon onClick={toggleMenu} />
            <div style={{ maxWidth: '30vw', overflowY: 'auto'}}>
              <ImageAndHeart content={content} onItemClick={handleItemClick} />
            </div>
            <div className="input-container backgroundColor2" onClick={(e) => e.stopPropagation()}>
              <SeacrhTagInDb setIsModalOpen={setIsModalOpen} setContentModal={setContentModal} tags={tags} setTags={setTags} setContent={setContent} setMusicContent={setMusicContent} />
            </div>
            <DownloadIcon size={30} isOpen={isContentVisible} onToggle={toggleContentVisibility} />
            <div className={isVideoFullScreen ? 'video-fullscreen' : 'video-normal'} style={{ position: isVideoFullScreen ? 'fixed' : 'relative', top: isVideoFullScreen ? '0' : 'auto', left: isVideoFullScreen ? '0' : 'auto', zIndex: isVideoFullScreen ? 9999 : 'auto' }}>
              <Video 
                tags={tags} 
                setTags={setTags} 
                setCurrentIndex={setCurrentIndex} 
                currentIndex={currentIndex} 
                currentTimeMedia={currentTimeMedia} 
                setCurrentTimeMedia={setCurrentTimeMedia} 
                componentInUse={componentInUse} 
                setComponentInUse={setComponentInUse} 
                id={content[0].videoPrincipal.id} 
                src={content[0].videoPrincipal.src} 
                style={{ width: '100%', height: '100%', borderRadius: isVideoFullScreen ? '0em' : '0.7em' }} 
                className={[]} 
                onClick={() => console.log('Video clicked')} 
                setIsLoading={setIsLoading} 
                isVideoFullScreen={isVideoFullScreen} 
                allMusicProyects={musicContent} 
                setContent={setContent} 
                isEndendVideo={isEndedVideo} 
                setIsEndedVideo={setIsEndedVideo} 
                setMusicContent={setMusicContent} 
                setIsModalOpen={setIsModalOpen}
                isModalOpen={isModalOpen} 
                setContentModal={setContentModal}
              />
              <div onClick={toggleVideoFullScreen} style={{ position: 'absolute', top: '0px', right: '0', zIndex: 10000, cursor: 'pointer', backgroundColor: 'none', padding: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto' }}>
                <ExpandIcon onClick={toggleVideoFullScreen} size={50} />
                
              </div>
            </div>
          </div>
          <Audio 
            setCurrentIndex={setCurrentIndex} 
            currentIndex={currentIndex} 
            id={content[0].audioPrincipal.id} 
            src={content[0].audioPrincipal.src} 
            autoPlay={content[0].audioPrincipal.autoPlay} 
            loop={content[0].audioPrincipal.loop} 
            controlsList={content[0].audioPrincipal.controlsList} 
            backgroundColor={content[0].audioPrincipal.backgroundColor} 
            buttonColor={content[0].audioPrincipal.buttonColor} 
            sliderEmptyColor={content[0].audioPrincipal.sliderEmptyColor} 
            sliderFilledColor={content[0].audioPrincipal.sliderFilledColor} 
            showPlayButton={content[0].audioPrincipal.showPlayButton} 
            showVolumeButton={content[0].audioPrincipal.showVolumeButton} 
            playIcon={content[0].audioPrincipal.playIcon} 
            pauseIcon={content[0].audioPrincipal.pauseIcon} 
            volumeIcon={content[0].audioPrincipal.volumeIcon} 
            width={content[0].audioPrincipal.width} 
            allMusicProyects={musicContent} 
            setContent={setContent} 
            setCurrentTimeMedia={setCurrentTimeMedia} 
            currentTimeMedia={currentTimeMedia} 
            setComponentInUse={setComponentInUse} 
            componentInUse={componentInUse} 
            setIsLoading={setIsLoading} 
            isEndedVideo={isEndedVideo} 
            setIsEndedVideo={setIsEndedVideo} 
            isFirstTimeLoading={isFirstTimeLoading}
            setIsFirstTimeLoading={setIsFirstTimeLoading}
          />
        </div>
        <Menu isOpen={isMenuOpen} onClose={toggleMenu} className='backgroundColor2' />
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, opacity: isLoading ? 1 : 0, visibility: isLoading ? 'visible' : 'hidden', transition: 'opacity 0.5s ease, visibility 0.5s ease', }}>
          <MainLogo animate={true} size={'40vh'} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
      <MainLogo animate={true} size={'40vh'}/>
    </div>
  );
}

