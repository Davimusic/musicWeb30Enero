import React from 'react';
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa'; // Importa los íconos que necesites

const Icon = ({ iconType, style }) => {
    const icons = {
        FaGoogle: <FaGoogle style={style} />,
        FaFacebook: <FaFacebook style={style} />,
        FaTwitter: <FaTwitter style={style} />
    };

    return icons[iconType] || null;
};

export default Icon;