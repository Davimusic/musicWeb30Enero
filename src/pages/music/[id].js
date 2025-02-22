"use client";
import React, { useEffect, useState } from 'react';
import Audio from '@/components/simple/audio';
import ImageAndText from '@/components/complex/imageAndText';
import mapCompositionsToMusicContent from '@/functions/music/mapCompositionsToMusicContent';
import MidiAndPdf from '@/components/complex/midiAndPdf';
import Video from '@/components/simple/video';
import ToggleIconOpenAndClose from '@/components/complex/ToggleIconOpenAndClose';
'../../estilos/general/general.css';
import MainLogo from '@/components/complex/mainLogo';
import Modal from '@/components/complex/modal';
import ExpandIcon from '@/components/complex/expandIcon';
import ShrinkIcon from '@/components/complex/shirnkIcon';
import GlassIcon from '@/components/complex/glassIcon';
import SeacrhTagInDb from '@/components/complex/searchTag';
import { searchTagInDb } from '@/functions/music/searchTagInDb';
import MenuIcon from '@/components/complex/menuIcon';
import Menu from '@/components/complex/menu';










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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Nuevo estado para controlar la visibilidad del menú
  
  
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

  useEffect(() => {
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
  }, []);

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
      setIsMenuOpen(!isMenuOpen); // Alternar la visibilidad del menú
  };


  if (content && content.length > 0) {
      return (
          <div className='backgroundColor1' style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Modal isOpen={isModalOpen} onClose={closeModal}>
                  <h2>Contenido Dinámico</h2>
                  <p>Este es un ejemplo de contenido dinámico dentro del modal.</p>
                  <button onClick={closeModal}>Cerrar Modal</button>
              </Modal>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${content[0].imagePrincipal.src})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px)', opacity: '0.5', margin: '20px', zIndex: 1, boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)', borderRadius: '20px' }}></div>
              <div className='spaceTopOnlyPhone' style={{ flex: 1, scrollbarWidth: 'thin', overflowY: 'auto', margin: '2%', position: 'relative', zIndex: 2 }}>
                  <div style={{ width: '100%', textAlign: 'center' }}>
                      <div className="input-container-CellUP backgroundColor2" onClick={(e) => e.stopPropagation()}>
                          <SeacrhTagInDb tags={tags} setTags={setTags} setContent={setContent} setMusicContent={setMusicContent} />
                      </div>
                  </div>
                  <ImageAndText content={musicContent} onItemClick={handleItemClick} />
              </div>
              <div className='backgroundColor2' style={{ padding: '10px', position: 'relative', zIndex: 2, borderRadius: '20px', margin: '10px', maxHeight: '80vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <MenuIcon onClick={toggleMenu} /> {/* Aquí se activa el menú */}
                      <div style={{ maxWidth: '30vw', overflow: 'auto' }}>
                          <ImageAndText content={content} onItemClick={handleItemClick} />
                      </div>
                      <div className="input-container backgroundColor2" onClick={(e) => e.stopPropagation()}>
                          <SeacrhTagInDb tags={tags} setTags={setTags} setContent={setContent} setMusicContent={setMusicContent} />
                      </div>
                      <ToggleIconOpenAndClose size={30} isOpen={isContentVisible} onToggle={toggleContentVisibility} />
                      <div className={isVideoFullScreen ? 'video-fullscreen' : 'video-normal'} style={{ position: isVideoFullScreen ? 'fixed' : 'relative', top: isVideoFullScreen ? '0' : 'auto', left: isVideoFullScreen ? '0' : 'auto', zIndex: isVideoFullScreen ? 9999 : 'auto' }}>
                          <Video tags={tags} setTags={setTags} setCurrentIndex={setCurrentIndex} currentIndex={currentIndex} currentTimeMedia={currentTimeMedia} setCurrentTimeMedia={setCurrentTimeMedia} componentInUse={componentInUse} setComponentInUse={setComponentInUse} id={content[0].videoPrincipal.id} src={content[0].videoPrincipal.src} style={{ width: '100%', height: '100%' }} className={[]} onClick={() => console.log('Video clicked')} setIsLoading={setIsLoading} isVideoFullScreen={isVideoFullScreen} allMusicProyects={musicContent} setContent={setContent} isEndendVideo={isEndedVideo} setIsEndedVideo={setIsEndedVideo} setMusicContent={setMusicContent} />
                          <div onClick={toggleVideoFullScreen} style={{ position: 'absolute', top: '0px', right: '0', zIndex: 10000, cursor: 'pointer', backgroundColor: 'none', padding: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'auto' }}>
                              {isVideoFullScreen ? (
                                  <ShrinkIcon onClick={toggleVideoFullScreen} size={50} />
                              ) : (
                                  <ExpandIcon onClick={toggleVideoFullScreen} size={50} />
                              )}
                          </div>
                      </div>
                  </div>
                  <div style={{ opacity: isContentVisible ? 1 : 0, maxHeight: isContentVisible ? '70vh' : '0', overflow: 'hidden', transition: 'opacity 2s ease, max-height 2s ease', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                      <MidiAndPdf content={content} onItemClick={handleItemClick} />
                  </div>
                  <Audio setCurrentIndex={setCurrentIndex} currentIndex={currentIndex} id={content[0].audioPrincipal.id} src={content[0].audioPrincipal.src} autoPlay={content[0].audioPrincipal.autoPlay} loop={content[0].audioPrincipal.loop} controlsList={content[0].audioPrincipal.controlsList} backgroundColor={content[0].audioPrincipal.backgroundColor} buttonColor={content[0].audioPrincipal.buttonColor} sliderEmptyColor={content[0].audioPrincipal.sliderEmptyColor} sliderFilledColor={content[0].audioPrincipal.sliderFilledColor} showPlayButton={content[0].audioPrincipal.showPlayButton} showVolumeButton={content[0].audioPrincipal.showVolumeButton} playIcon={content[0].audioPrincipal.playIcon} pauseIcon={content[0].audioPrincipal.pauseIcon} volumeIcon={content[0].audioPrincipal.volumeIcon} width={content[0].audioPrincipal.width} allMusicProyects={musicContent} setContent={setContent} setCurrentTimeMedia={setCurrentTimeMedia} currentTimeMedia={currentTimeMedia} setComponentInUse={setComponentInUse} componentInUse={componentInUse} setIsLoading={setIsLoading} isEndedVideo={isEndedVideo} setIsEndedVideo={setIsEndedVideo} />
              </div>
              {/* Menú lateral */}
              <Menu isOpen={isMenuOpen} onClose={toggleMenu} className='backgroundColor2' />
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, opacity: isLoading ? 1 : 0, visibility: isLoading ? 'visible' : 'hidden', transition: 'opacity 0.5s ease, visibility 0.5s ease', }}>
                  <MainLogo animate={true} size={'40vh'} />
              </div>
          </div>
      );
  }

  return (
      <div style={{ height: '100vh', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
          <MainLogo animate={true} size={'40vh'} />
      </div>
  );
}

