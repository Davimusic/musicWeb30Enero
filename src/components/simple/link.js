import React from 'react';
import Link from 'next/link'; 
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';


const Link = ({id, href, className, text, style }) => {
    return (
        <Link href={href}>
            <a id={id} className={extractArrayContentToStrings(className)} style={style}>
                {text}
            </a>
        </Link>
    );
};

export default Link;
