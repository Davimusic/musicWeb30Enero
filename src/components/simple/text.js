import React from 'react';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const Text = ({id, text, style, className, onClick}) => {
    return (
        <p id={id} onClick={onClick}  style={style} className={extractArrayContentToStrings(className)}>{text}</p>
    );
};
export default Text;