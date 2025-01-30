import React from 'react';
import RenderElement from '@/functions/renderElement';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const Button = ({ onClick, children, style, className, id }) => {
    console.log(children);
    
    return (
        <button id={id} className={extractArrayContentToStrings(className)} onClick={onClick} style={style}>
            {Array.isArray(children) ? children.map((child, index) => (
                <React.Fragment key={index}>
                    {RenderElement(child)}
                </React.Fragment>
            )) : RenderElement(children)}
        </button>
    );
};

export default Button;

