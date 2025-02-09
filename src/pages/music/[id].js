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

    // Función para manejar el clic en un item
    const handleItemClick = (item) => {
        setContent([item]); // Actualiza el estado `content` con el item seleccionado
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
                setMusicContent(mapCompositionsToMusicContent(data.compositions))
                
                } else {
                console.error(data.message);
                }
            })
            .catch(error => {
                console.error('Error al obtener las composiciones:', error);
            });
    }, []);

    

    return (
        <div style={{ height: '100vh', background: 'black', display: 'flex', flexDirection: 'column' }}>
        {/* Contenedor del contenido superior con scroll */}
        <div style={{ flex: 1, overflowY: 'auto', margin: '2%' }}>
            <ImageAndText content={musicContent} onItemClick={handleItemClick} />
        </div>

        {/* Contenedor fijo en la parte inferior */}
        <div style={{ backgroundColor: '#1e1e1e', padding: '10px' }}>
            <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <ImageAndText content={content} onItemClick={handleItemClick} />
                <MidiAndPdf content={content} onItemClick={handleItemClick} />
                {content && content.length > 0 && content[0].audio ? (
                    <div>
                        <Video id={content[0].video.id} src={content[0].video.src} style={{ width: '100px', height: '100px' }} className={[]} onClick={() => console.log('Video clicked')} />
                    </div>
                ) : (
                    console.log("Esperando datos en 'content video'...")
                )}
            </div>
            {content && content.length > 0 && content[0].audio ? (
            <>
                {console.log("Contenido de 'content':", content)}
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
            </>
            ) : (
            console.log("Esperando datos en 'content'...")
            )}
        </div>
        </div>
    );
}