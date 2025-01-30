import React, { useState, useEffect } from 'react';

export default function isSmallScreen(num){
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < num);
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isSmallScreen
}

