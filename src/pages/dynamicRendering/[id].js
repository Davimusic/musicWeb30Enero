import '../../estilos/general/general.css'
import { Menu } from '@/components/menu';
import React, { useState, useEffect } from "react";
import RenderElement from '@/functions/renderElement';
import importAllLocalFunctions from '@/functions/general/importAllLocalFunctions';
import { useRouter } from 'next/router';
import generalConnector from '@/functions/BackendConnectors/generalConnector';
import colorPalette from '@/functions/cms/colorPalette';
import NotFound from '../404';

const functions = importAllLocalFunctions()

export default function render() {
    const [body, setBody] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const router = useRouter(); 

    useEffect(() => { 
        if (router.isReady) {
            functions.inyectClassNamesToDOM(functions.importClassNames()); 
            fetchTemplates(); 
        } 
    }, [router.isReady]);

    async function fetchTemplates() {
        const { id } = router.query; 
        try {
            const result = await generalConnector('getTemplates', 'GET');
            console.log(result.templates);
            console.log(id);
            if (result.templates[id] === undefined) {
                setNotFound(true);
            } else {
                setBody(result.templates[id]);
            }
        } catch (error) {
            console.error('Error:', error);
            setNotFound(true);
        }
    }

    function traverseAndEval(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        for (const key in obj) {
            if (key === 'onClick' && typeof obj[key] === 'string') {
                let functionString = obj[key];
                if (functionString.includes('{')) {
                    functionString = functionString.replace('()', '(event)').replace('{', '{ event.stopPropagation(); ');
                } else {
                    functionString = `event => { event.stopPropagation(); ${functionString.slice(functionString.indexOf('=>') + 2).trim()}; }`;
                }
                obj[key] = eval(`(${functionString})`);
            } else if (typeof obj[key] === 'object') {
                traverseAndEval(obj[key]);
            }
        }
        console.log(obj);

        return obj;
    }

    if (notFound) {
        return <NotFound />;
    }

    if (body === null) {
        return <div className='center' style={{width: '100vw', height: '100vh', background: colorPalette()['color4']}}>Loading...</div>; // Puedes mostrar un mensaje de carga mientras se obtienen los datos
    }

    return (
        <Menu body={`hola`} className={''} zIndex={'999999999'} backgroundColor={colorPalette()['color4']} imageLink={'https://res.cloudinary.com/dplncudbq/image/upload/v1729800824/menu2_rtbvzo.png'}>
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {RenderElement(traverseAndEval(body))}
            </div>
        </Menu>
    );
}





/**
 const items = [
        <div className='rotate' style={{ backgroundColor: 'red', height: '45vh', width: '90%',objectFit: 'cover', margin: '0 auto'  }}>Item 1</div>,
        <div style={{ backgroundColor: 'green', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>Item 2</div>,
        <div onClick={() => alert('si')} style={{ backgroundColor: 'blue', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>Item 3</div>,
        <div style={{ backgroundColor: 'yellow', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>Item 4</div>,
        <p style={{ backgroundColor: 'lightgrey', height: '45vh', width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', objectFit: 'cover', margin: '0 auto'  }}>Texto de ejemplo</p>,
        <img src="https://res.cloudinary.com/dplncudbq/image/upload/v1657563380/mias/h19_wgstaq.jpg" alt="Placeholder" style={{ width: '100%', objectFit: 'cover', margin: '0 auto' }} />,
        <video controls style={{ height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>
            <source src="https://res.cloudinary.com/dplncudbq/video/upload/v1657988838/mias/y5_hjj0uv.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>,
        <div className='rotate' style={{ backgroundColor: 'red', height: '45vh', width: '90%',objectFit: 'cover', margin: '0 auto'  }}>Item 1</div>,
        <div style={{ backgroundColor: 'green', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>Item 2</div>,
        <div onClick={() => alert('si')} style={{ backgroundColor: 'blue', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>Item 3</div>,
        <div style={{ backgroundColor: 'yellow', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>Item 4</div>,
        <p style={{ backgroundColor: 'lightgrey', height: '45vh', width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', objectFit: 'cover', margin: '0 auto'  }}>Texto de ejemplo</p>,
        <img src="https://res.cloudinary.com/dplncudbq/image/upload/v1657563380/mias/h19_wgstaq.jpg" alt="Placeholder" style={{ width: '100%', objectFit: 'cover', margin: '0 auto' }} />,
        <video controls style={{ height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto'  }}>
            <source src="https://res.cloudinary.com/dplncudbq/video/upload/v1657988838/mias/y5_hjj0uv.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    ];

    return  <Menu>
                <SlideGallery 
                    visibleCount={2} 
                    autoScroll={true} 
                    interval={2000} 
                    showNavigationPoints={true} 
                    showNavigationButtons={true} 
                    autoScrollAfterClick={false} 
                    timeToReactivateAutoScrollAfterClick={1000} 
                    transitionType={'fade'}>                    
                </SlideGallery>
            </Menu>
    
    
    
    return <Menu>{RenderElement(body)}</Menu>
 */



