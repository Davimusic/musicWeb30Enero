import React, { useEffect, useRef } from 'react';
import '../../estilos/general/general.css';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const Video = ({ id, src, onClick, style, className }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();  
        }
    }, [src]);  

    return (
        <video ref={videoRef} id={id} onClick={onClick} controls style={style} className={extractArrayContentToStrings(className)}>
            <source src={src} type="video/mp4" />
            Tu navegador no admite el elemento de video.
        </video>
    );
};

export default Video;

