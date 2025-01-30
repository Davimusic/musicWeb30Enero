import React from 'react';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const Audio = ({ src, id, autoPlay, loop, controlsList }) => {
    return (
        <audio 
            controls 
            autoPlay={autoPlay} 
            loop={loop} 
            controlsList={extractArrayContentToStrings(controlsList)}
        >
            <source id={id} src={src} type="audio/mpeg" />
            Tu navegador no admite el elemento de audio.
        </audio>
    );
};

export default Audio;
