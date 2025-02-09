"use client";
import React, { useEffect, useState } from 'react';
import Audio from '@/components/simple/audio';
import ImageAndText from '@/components/complex/imageAndText';
import mapCompositionsToMusicContent from '@/functions/music/mapCompositionsToMusicContent';
import MidiAndPdf from '@/components/complex/midiAndPdf';
import Video from '@/components/simple/video';

export default function Music() {
    const [content, setContent] = useState([]);
    const [musicContent, setMusicContent] = useState([]);

    const handleItemClick = (item) => {
        setContent([item]);
        console.log("Item seleccionado:", item);
    };

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
            <div style={{ height: '100vh', background: 'black', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Capa de fondo con efecto de desenfoque, opacidad, margen oscuro y bordes redondeados */}
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
                    boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)', // Margen oscuro
                    borderRadius: '20px', // Bordes redondeados
                }}></div>

                {/* Contenedor del contenido superior con scroll */}
                <div style={{ flex: 1, overflowY: 'auto', margin: '2%', position: 'relative', zIndex: 2 }}>
                    <ImageAndText content={musicContent} onItemClick={handleItemClick} />
                </div>

                {/* Contenedor fijo en la parte inferior */}
                <div style={{ backgroundColor: '#1e1e1e', padding: '10px', position: 'relative', zIndex: 2, borderRadius: '20px', margin: '10px' }}>
                    <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center'}}>
                        <ImageAndText content={content} onItemClick={handleItemClick} />
                        <MidiAndPdf content={content} onItemClick={handleItemClick} />
                        {content[0].video ? (
                            <div>
                                <Video id={content[0].video.id} src={content[0].video.src} style={{ width: '100px', height: '100px' }} className={[]} onClick={() => console.log('Video clicked')} />
                            </div>
                        ) : (
                            console.log("Esperando datos en 'content video'...")
                        )}
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
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', background: 'black', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
            Cargando contenido...
        </div>
    );
}

