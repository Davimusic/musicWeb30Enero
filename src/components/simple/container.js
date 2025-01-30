import React from 'react';
import '../../estilos/general/general.css'
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const Container = ({ children, onClick, className, style, id }) => {
    return (
        <div id={id} onClick={onClick} className={extractArrayContentToStrings(className)} style={style}>
            {children}
        </div>
    );
};

export default Container;
