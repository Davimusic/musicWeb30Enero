import VideoIcon from "./videoIcon";
import AudioIcon from "./audioIcon";
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

export default function ShowComponentButton({ setShowComponent, showComponent, isHybridView }) {
    const router = useRouter();
    const { type } = router.query;
    const [IconComponent, setIconComponent] = useState(<VideoIcon size={30} onClick={() => setShowComponent(showComponent === 'audio' ? 'video' : 'audio')}/>);

    useEffect(() => {
        // Actualiza el icono basado en el valor de `showComponent`
        setIconComponent(showComponent === 'audio' ? <VideoIcon size={30} onClick={() => setShowComponent(showComponent === 'audio' ? 'video' : 'audio')}/> : <AudioIcon size={30} onClick={() => setShowComponent(showComponent === 'audio' ? 'video' : 'audio')}/>);
    }, [showComponent]);

    if (type === 'hybridView') {
        return IconComponent
    }

    return null;
}








