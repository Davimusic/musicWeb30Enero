"use client";
import React, { useEffect, useState } from 'react';
import Audio from '@/components/simple/audio';
import ImageAndText from '@/components/complex/imageAndText';
import dataMusic from '@/functions/soloDePrueba/music';
import getFolderContents from '@/functions/utils/getFolderContents';
import FileBrowser from '@/functions/cms/fileBrowser';

export default function Music() {
    const [content, setContent] = useState([]); // Inicialmente vacío
    const { musicContent } = dataMusic();

    

    // Función para manejar el clic en un item
    const handleItemClick = (item) => {
        setContent([item]); // Actualiza el estado `content` con el item seleccionado
        console.log("Item seleccionado:", item);
    };

    // Inicializa `content` con el primer elemento de `musicContent`
    useState(() => {
        if (musicContent && musicContent.length > 0) {
        setContent([musicContent[0]]);
        console.log("Inicializando content:", musicContent[0]);
        }
    }, [musicContent]);

    // Log para verificar cambios en `content`
    useEffect(() => {
        console.log("Contenido actualizado:", content);
    }, [content]);

    return (
        <div style={{ height: '100vh', background: 'black', display: 'flex', flexDirection: 'column' }}>
        {/* Contenedor del contenido superior con scroll */}
        <div style={{ flex: 1, overflowY: 'auto', margin: '2%' }}>
            <ImageAndText content={musicContent} onItemClick={handleItemClick} />
        </div>

        {/* Contenedor fijo en la parte inferior */}
        <div style={{ backgroundColor: '#1e1e1e', padding: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <ImageAndText content={content} onItemClick={handleItemClick} />
            <FileBrowser onPathChange={'exclusiveMusicForExclusivePeople'} type={'image'} showControls={false} actionFunction={''} path={'exclusiveMusicForExclusivePeople'} />
        
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