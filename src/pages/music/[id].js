"use client";
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import '../../estilos/general/general.css';
import SearchTagInDb from '@/components/complex/searchTag';
import FullControlMedia from '@/components/complex/fullControlMedia';
import ImageAndText from '@/components/complex/imageAndText';
import MidiAndPdf from '@/components/complex/midiAndPdf';
import MainLogo from '@/components/complex/mainLogo';
import Modal from '@/components/complex/modal';
import { searchTagInDb } from '@/functions/music/searchTagInDb';
import getCSSVariableValue from '@/functions/music/getCSSVariableValue';








export default function Music() {
  // Estados principales
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
  const [quality, setQuality] = useState(25);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioPlayerRef = useRef(null);

  useLayoutEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const audioPlayerHeight = parseInt(getCSSVariableValue('--audioPlayerHeight'), 10);
      if (!isNaN(audioPlayerHeight)) {
        const remainingHeight = windowHeight - audioPlayerHeight - 30; // 30 es para que quede un buen espacio
        setDynamicHeight(`${remainingHeight}px`);
      } else {
        console.error('El valor de --audioPlayerHeight no es un número válido.');
      }
    };

    const timeoutId = setTimeout(() => {
      calculateHeight();
    }, 100); // Retraso de 100ms

    window.addEventListener('resize', calculateHeight);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  // Efecto para resaltar elementos
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

  // Efecto para carga inicial
  useEffect(() => {
    searchTagInDb('', setContent, setMusicContent, setTags);
  }, []);

  // Funciones para manejar el reproductor
  const togglePlayPause = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setCurrentTime(audioPlayerRef.current.currentTime);
      setCurrentTimeMedia(audioPlayerRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioPlayerRef.current) {
      setDuration(audioPlayerRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioPlayerRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioPlayerRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = newVolume;
    }
    if (isMuted && newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.muted = !audioPlayerRef.current.muted;
      setIsMuted(audioPlayerRef.current.muted);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEndedVideo(true);
    if (isRepeat && audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.play();
    } else {
      handleNextSong();
    }
  };

  const toggleShuffle = () => {
    if (isRepeat) {
      setIsRepeat(false); 
    }
    setIsShuffle(!isShuffle); 
  };

  const toggleRepeat = () => {
    if (isShuffle) {
      setIsShuffle(false); 
    }
    setIsRepeat(!isRepeat); 
  };

  const getNextSong = () => {
    if (musicContent.length === 0) return null;
    let nextIndex;
    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * musicContent.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = (currentIndex + 1) % musicContent.length;
    }
    return musicContent[nextIndex];
  };

  const getPreviousSong = () => {
    if (musicContent.length === 0) return null;
    let prevIndex;
    if (isShuffle) {
      do {
        prevIndex = Math.floor(Math.random() * musicContent.length);
      } while (prevIndex === currentIndex);
    } else {
      prevIndex = (currentIndex - 1 + musicContent.length) % musicContent.length;
    }
    return musicContent[prevIndex];
  };

  const handleNextSong = () => {
    const nextSong = getNextSong();
    if (nextSong && audioPlayerRef.current) {
      setContent([nextSong]);
      setCurrentIndex(musicContent.findIndex(song => song.idObjeto === nextSong.idObjeto));
      audioPlayerRef.current.src = `${nextSong.audioPrincipal.src}?quality=${quality}`;
      audioPlayerRef.current.load();
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePreviousSong = () => {
    alert(isShuffle)
    const prevSong = getPreviousSong();
    if (prevSong && audioPlayerRef.current) {
      setContent([prevSong]);
      setCurrentIndex(musicContent.findIndex(song => song.idObjeto === prevSong.idObjeto));
      audioPlayerRef.current.src = `${prevSong.audioPrincipal.src}?quality=${quality}`;
      audioPlayerRef.current.load();
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const toggleContentVisibility = () => {
    setIsContentVisible(!isContentVisible);
    openModal();
    setContentModal(<MidiAndPdf content={content} onItemClick={handleItemClick} />);
  };

  const handleItemClick = (item) => {
    setContent([item]);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = item.audioPrincipal.src;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  if (!content || content.length === 0) {
    return (
      <div style={{ 
        height: '97vh', 
        background: 'black', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        color: 'white', 
        borderRadius: '0.7em' 
      }}>
        <MainLogo animate={true} size={'40vh'} />
      </div>
    );
  }

  return (
    <div className='backgroundColor1' style={{ height: '97vh', display: 'block', borderRadius: '20px' }}>
      <Modal isOpen={isModalOpen} onClose={closeModal} children={contentModal} className={'backgroundColor3'} />
      
      {/* Fondo difuminado */}
      <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundImage: `url(${content[0].imagePrincipal.src})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          filter: 'blur(8px)', 
          opacity: '0.5', 
          margin: '20px', 
          zIndex: 1, 
          borderRadius: '20px',
          overflow: 'hidden'
      }}>
          <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0.6) 70%, rgba(255, 255, 255, 0.1) 100%)',
              zIndex: 2
          }}></div>
      </div>

      {/* Contenido principal */}
      <div className='spaceTopOnlyPhone' style={{ 
        scrollbarWidth: 'thin', 
        position: 'relative', 
        zIndex: 2 
      }}>
        <div style={{ height: dynamicHeight, overflow: 'auto' }}>
          <ImageAndText content={musicContent} onItemClick={handleItemClick} />
        </div>
      </div>

      {/* Reproductor de audio */}
      <FullControlMedia
        ref={audioPlayerRef}
        src={content[0].audioPrincipal.src}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        setIsShuffle={setIsShuffle}
        isShuffle={isShuffle}
        toggleShuffle={toggleShuffle}
        setIsRepeat={setIsRepeat}
        isRepeat={isRepeat}
        toggleRepeat={toggleRepeat}
        handleNextSong={handleNextSong}
        handlePreviousSong={handlePreviousSong}
        handleTimeUpdate={handleTimeUpdate}
        handleLoadedMetadata={handleLoadedMetadata}
        handleSeek={handleSeek}
        handleVolumeChange={handleVolumeChange}
        toggleMute={toggleMute}
        handleEnded={handleEnded}
        formatTime={formatTime}
        currentTime={currentTime}
        duration={duration}
        isMuted={isMuted}
        volume={volume}
        buttonColor={'white'}
        showPlayButton={true}
        showVolumeButton={true}
        isModalOpen={isModalOpen}
        openQualityModal={() => setIsModalOpen(true)}
        closeQualityModal={() => setIsModalOpen(false)}
        handleQualityChange={(newQuality) => {
          setQuality(newQuality);
          setIsModalOpen(false);
        }}
        quality={quality}
        tags={tags}
        setTags={setTags}
        setContent={setContent}
        setMusicContent={setMusicContent}
        setIsModalOpen={setIsModalOpen}
        setContentModal={setContentModal}
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        content={content}
        handleItemClick={handleItemClick}
        toggleContentVisibility={toggleContentVisibility}
        isContentVisible={isContentVisible}
      />

      {/* Overlay de carga */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backdropFilter: 'blur(10px)', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 9999, 
        opacity: isLoading ? 1 : 0, 
        visibility: isLoading ? 'visible' : 'hidden', 
        transition: 'opacity 0.5s ease, visibility 0.5s ease' 
      }}>
        <MainLogo animate={true} size={'40vh'} />
      </div>
    </div>
  );
}