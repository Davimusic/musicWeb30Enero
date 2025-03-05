import VideoIcon from "./videoIcon";
import AudioIcon from "./audioIcon";
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

export default function ShowComponentButton({ setShowComponent, showComponent, isHybridView }) {
    const router = useRouter();
    const { type } = router.query;
    const [IconComponent, setIconComponent] = useState(null);

    useEffect(() => {
        if (type === 'hybridView') {
            setShowComponent('audio');
            setIconComponent(() =>
                showComponent === 'audio' ? VideoIcon : AudioIcon
            );
        }
    }, [type,]);

    return null

    if (type === 'hybridView' && IconComponent) {
        const CurrentIcon = IconComponent;
        return (
            <CurrentIcon
                size={40}
                onClick={() =>
                    setShowComponent(showComponent === 'audio' ? 'video' : 'audio')
                }
            />
        );
    }

    return null;
}








