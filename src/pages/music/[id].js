"use client";
import React, {useEffect, useState, useCallback } from 'react';
import Audio from '@/components/simple/audio';
import ImageAndText from '@/components/complex/imageAndText';
import importAllFunctions from '@/functions/general/importAllLocalFunctions';
import useHandleImageClick from '@/functions/specialized/music/handleImageClick';
import dataMusic from '@/functions/soloDePrueba/music';


export default function Music() {
    // Inicializar los estados primero
    const [song, setSong] = useState('https://res.cloudinary.com/dplncudbq/video/upload/v1692977795/mias/relax7_orxvbj.mp3');
    const [content, setContent] = useState([]); // Inicialmente vacío

    // Usar el custom hook después de inicializar los estados
    const handleImageClick = useHandleImageClick(setSong, setContent);

    // Obtener los datos con handleImageClick
    const { playerMusic, musicContent } = dataMusic(handleImageClick);

    // Actualizar el estado de `content` con `test1` después de que se inicialice
    useState(() => {
        setContent(playerMusic);
    }, [playerMusic]);

    return (
        <div style={{ height: '100vh', background: 'black', display: 'flex', flexDirection: 'column' }}>
            {/* Contenedor del contenido superior con scroll */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <ImageAndText content={musicContent} />
            </div>

            {/* Contenedor fijo en la parte inferior */}
            <div style={{ backgroundColor: '#1e1e1e', padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <ImageAndText content={content} />
                </div>
                <Audio
                    id={'1'}
                    src={song}
                    autoPlay={false}
                    loop={false}
                    controlsList={true}
                    backgroundColor="#1e1e1e"
                    buttonColor="#ffffff"
                    sliderEmptyColor="#444"
                    sliderFilledColor="#1db954"
                    showPlayButton={true}
                    showVolumeButton={true}
                    playIcon="https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/play_slnrjf.png"
                    pauseIcon="https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/pause_h2cozi.png"
                    volumeIcon="https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/volumeup_qodl3n.png"
                    width="100%"
                />
            </div>
        </div>
    );
}


