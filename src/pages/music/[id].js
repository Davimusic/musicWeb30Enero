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


    useEffect(() => {
        console.log(musicContent);
    }, [musicContent]);

    useEffect(() => {
        console.log(componentInUse);
    }, [componentInUse]);

    useEffect(() => {
        //console.log(currentTimeMedia);
    }, [currentTimeMedia]);

    useEffect(() => {
        console.log(componentInUse);
    }, [componentInUse]);

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
        fetch('/api/getCompositionsFromDb', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.compositions);
            
            console.log(mapCompositionsToMusicContent(data.compositions));
            
            if (data.success) {
                setContent([mapCompositionsToMusicContent(data.compositions)[0]]);
                setMusicContent(mapCompositionsToMusicContent(data.compositions));
            } else {
                console.error(data.message);
            }
        })
        .catch(error => {
            console.error('Error al obtener las composiciones:', error);
        });
    }, []);

    if (content && content.length > 0) {
        return (
            <div className='backgroundColor1' style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Modal isOpen={isModalOpen} onClose={closeModal}>
                    <h2>Contenido Dinámico</h2>
                    <p>Este es un ejemplo de contenido dinámico dentro del modal.</p>
                    <button onClick={closeModal}>Cerrar Modal</button>
                </Modal>
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
                    boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)',
                    borderRadius: '20px',
                }}></div>

                <div style={{ flex: 1, overflowY: 'auto', margin: '2%', position: 'relative', zIndex: 2 }}>
                    <ImageAndText content={musicContent} onItemClick={handleItemClick} />
                </div>

                <div className='backgroundColor2' style={{padding: '10px', position: 'relative', zIndex: 2, borderRadius: '20px', margin: '10px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <ImageAndText content={content} onItemClick={handleItemClick} />
                        
                        <ToggleIconOpenAndClose
                            size={30}
                            isOpen={isContentVisible}
                            onToggle={toggleContentVisibility}
                        />
                    
                        <div 
                            className={isVideoFullScreen ? 'video-fullscreen' : 'video-normal'}
                            style={{
                                position: isVideoFullScreen ? 'fixed' : 'relative',
                                top: isVideoFullScreen ? '0' : 'auto',
                                left: isVideoFullScreen ? '0' : 'auto',
                                zIndex: isVideoFullScreen ? 9999 : 'auto',
                            }}
                        >
                            
                            <Video
                                currentTimeMedia={currentTimeMedia}
                                setCurrentTimeMedia={setCurrentTimeMedia}
                                componentInUse={componentInUse}
                                setComponentInUse={setComponentInUse}
                                id={content[0].videoPrincipal.id}
                                src={content[0].videoPrincipal.src}
                                style={{ width: '100%', height: '100%' }}
                                className={[]}
                                onClick={() => console.log('Video clicked')}
                                setIsLoading={setIsLoading}
                                isVideoFullScreen={isVideoFullScreen}
                                allMusicProyects={musicContent}
                                setContent={setContent}
                                setIsEndedVideo={setIsEndedVideo}
                            />
                            {/* Íconos de expandir/reducir */}
                            <div
                                onClick={toggleVideoFullScreen}
                                style={{
                                    position: 'absolute',
                                    top: '0px',
                                    right: '0', 
                                    zIndex: 10000,
                                    cursor: 'pointer',
                                    backgroundColor: 'none',
                                    padding: '0px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width:  'auto'
                                }}
                            >
                            {isVideoFullScreen ? (
                                <ShrinkIcon onClick={toggleVideoFullScreen} size={50} />
                            ) : (
                                <ExpandIcon onClick={toggleVideoFullScreen} size={50} />
                            )}
                        </div>




                        </div>
                    </div>

                    
                    

                    <div 
                        style={{ 
                            opacity: isContentVisible ? 1 : 0,
                            maxHeight: isContentVisible ? '70vh' : '0',
                            overflow: 'hidden',
                            transition: 'opacity 2s ease, max-height 2s ease',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}
                    >
                        
                        <MidiAndPdf content={content} onItemClick={handleItemClick} />
                    </div>

                    <Audio
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
                    />
                </div>

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
                    transition: 'opacity 0.5s ease, visibility 0.5s ease',
                }}>
                    <MainLogo animate={true} size={'40vh'}/>
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



/**
 * "use client";
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

export default function Music() {
    const [content, setContent] = useState([]);
    const [musicContent, setMusicContent] = useState([]);
    const [isContentVisible, setIsContentVisible] = useState(true);
    const [currentTimeMedia, setCurrentTimeMedia] = useState(0);
    const [componentInUse, setComponentInUse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(null); // Para almacenar el temporizador
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        console.log(currentTimeMedia);
    }, [currentTimeMedia]);

    useEffect(() => {
        console.log(componentInUse);
    }, [componentInUse]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);


    const handleItemClick = (item) => {
        setContent([item]);
        console.log("Item seleccionado:", item);
    };

    const toggleContentVisibility = () => {
        setIsContentVisible(!isContentVisible);
    };

    // Función para iniciar la carga
    const startLoading = () => {
        // Iniciar un temporizador de 500 ms
        const timeout = setTimeout(() => {
            setIsLoading(true); // Activar el estado de carga solo si pasan 500 ms
        }, 500);
        setLoadingTimeout(timeout); // Guardar el temporizador en el estado
    };

    // Función para detener la carga
    const stopLoading = () => {
        if (loadingTimeout) {
            clearTimeout(loadingTimeout); // Cancelar el temporizador si la carga termina antes
        }
        setIsLoading(false); // Desactivar el estado de carga
    };

    useEffect(() => {
        // Simular el inicio de la carga (por ejemplo, al hacer clic en un botón o cargar un recurso)
        startLoading();

        // Simular la finalización de la carga después de un tiempo aleatorio
        const loadTime = Math.random() * 1000; // Tiempo de carga entre 0 y 1000 ms
        setTimeout(() => {
            stopLoading();
        }, loadTime);

        // Limpiar el temporizador al desmontar el componente
        return () => {
            if (loadingTimeout) {
                clearTimeout(loadingTimeout);
            }
        };
    }, []); // Ejecutar solo al montar el componente

    useEffect(() => {
        fetch('/api/getCompositionsFromDb', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data.compositions);
                console.log([mapCompositionsToMusicContent(data.compositions)[0]]);
                console.log(mapCompositionsToMusicContent(data.compositions));
                setContent([mapCompositionsToMusicContent(data.compositions)[0]]);
                setMusicContent(mapCompositionsToMusicContent(data.compositions));
            } else {
                console.error(data.message);
            }
        })
        .catch(error => {
            console.error('Error al obtener las composiciones:', error);
        });
    }, []);

    if (content && content.length > 0) {
        return (
            <div className='backgroundColor1' style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Contenido Dinámico</h2>
        <p>Este es un ejemplo de contenido dinámico dentro del modal.</p>
        <button onClick={closeModal}>Cerrar Modal</button>
      </Modal>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${content[0].image.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(8px)',
                    opacity: '0.5',
                    margin: '20px',
                    zIndex: 1,
                    boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)',
                    borderRadius: '20px',
                }}></div>

                <div style={{ flex: 1, overflowY: 'auto', margin: '2%', position: 'relative', zIndex: 2 }}>
                    <ImageAndText content={musicContent} onItemClick={handleItemClick} />
                </div>

                <div className='backgroundColor2' style={{padding: '10px', position: 'relative', zIndex: 2, borderRadius: '20px', margin: '10px', maxHeight: '80vh', overflowY: 'auto' }}>
                    <ToggleIconOpenAndClose
                        size={30}
                        isOpen={isContentVisible}
                        onToggle={toggleContentVisibility}
                        style={{
                            position: 'sticky',
                            top: '10px',
                            right: '10px',
                            zIndex: 3,
                            borderRadius: '50%',
                            padding: '5px',
                        }}
                    />

<button onClick={openModal}>Abrir Modal</button>
{content[0].video ? (
                            <Video  
                                currentTimeMedia={currentTimeMedia} 
                                setCurrentTimeMedia={setCurrentTimeMedia} 
                                componentInUse={componentInUse} 
                                setComponentInUse={setComponentInUse} 
                                id={content[0].video.id} 
                                src={content[0].video.src} 
                                style={{ width: '50px', height: '50px' }} 
                                className={[]} 
                                onClick={() => console.log('Video clicked')} 
                                setIsLoading={setIsLoading}
                            />
                            //crea boton para expandir video a pantalla completa
                        ) : (
                            console.log("Esperando datos en 'content video'...")
                        )}

                    <div 
                        style={{ 
                            opacity: isContentVisible ? 1 : 0,
                            maxHeight: isContentVisible ? '70vh' : '0',
                            overflow: 'hidden',
                            transition: 'opacity 2s ease, max-height 2s ease',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        }}
                    >
                        <ImageAndText content={content} onItemClick={handleItemClick} />
                        <MidiAndPdf content={content} onItemClick={handleItemClick} />
                        
                        
                    </div>

                    <Audio
                        id={content[0].audio.id}
                        src={content[0].audio.src}
                        autoPlay={content[0].audio.autoPlay}
                        loop={content[0].audio.loop}
                        controlsList={content[0].audio.controlsList}
                        backgroundColor={content[0].audio.backgroundColor}
                        buttonColor={content[0].audio.buttonColor}
                        sliderEmptyColor={content[0].audio.sliderEmptyColor}
                        sliderFilledColor={content[0].audio.sliderFilledColor}
                        showPlayButton={content[0].audio.showPlayButton}
                        showVolumeButton={content[0].audio.showVolumeButton}
                        playIcon={content[0].audio.playIcon}
                        pauseIcon={content[0].audio.pauseIcon}
                        volumeIcon={content[0].audio.volumeIcon}
                        width={content[0].audio.width}
                        allMusicProyects={musicContent}
                        setContent={setContent}
                        setCurrentTimeMedia={setCurrentTimeMedia}
                        currentTimeMedia={currentTimeMedia}
                        setComponentInUse={setComponentInUse}
                        componentInUse={componentInUse}
                        setIsLoading={setIsLoading}
                    />
                </div>

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
                    transition: 'opacity 0.5s ease, visibility 0.5s ease',
                }}>
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
 */