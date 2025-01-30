//import React, { useState, useEffect, useRef } from 'react';
'../../estilos/general/general.css'
import importAllFunctions from '@/functions/general/importAllLocalFunctions';
import RenderElement from '@/functions/renderElement';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import ReactDOM from 'react-dom';

let functions = importAllFunctions()

const items= 
    {
        type: 'Container',
        style: {display: 'flex'},
        className: ['scroll'],
        children: [
            {
                type: 'Text',
                text: 'Item 1',
                style: { backgroundColor: 'red', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' },
                className: 'rotate'
            },
            {
                type: 'Text',
                text: 'Item 2',
                style: { backgroundColor: 'green', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Text',
                text: 'Item 3',
                style: { backgroundColor: 'blue', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' },
                onClick: () => alert('si')
            },
            {
                type: 'Text',
                text: 'Item 4',
                style: { backgroundColor: 'yellow', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Text',
                text: 'Texto de ejemplo',
                style: { backgroundColor: 'lightgrey', height: '45vh', width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Image',
                src: 'https://res.cloudinary.com/dplncudbq/image/upload/v1657563380/mias/h19_wgstaq.jpg',
                alt: 'Placeholder',
                width: '1000',
                height: '1000',
                style: { width: '100%', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Video',
                src: 'https://res.cloudinary.com/dplncudbq/video/upload/v1657988838/mias/y5_hjj0uv.mp4',
                style: { height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
            }
        ]
    }

let slide={
    "type": "Container",
    "id": 1,
    'style': {'height': '73vh'},
    "className": ['color1', 'scroll'],
    onClick: `() => alert('conat')`,
    "children": [
        {
            "type": "Container",
            "className": ["center", "color3"],
            "id": 2,
            "style": {
                "width": "100%",
                "height": "80vh"
            },
            "children": [
                {
                    "type": "Container",
                    "id": 3,
                    "className": ["center", "scroll"],
                    "style": {
                        "width": "80%",
                        "height": "65vh"
                    },
                    "children": [
                        {
                            "type": "Container",
                            "id": 4,
                            "className": [],
                            "children": [
                                {
                                    "type": "Container",
                                    "id": 5,
                                    "className": [],
                                    "style": {
                                        "display": "flex",
                                        "alignItems": "center",
                                        "justifyContent": "center",
                                        "width": "100%",
                                        "height": "max-content"
                                    },
                                    "children": [
                                        {
                                            "type": "Container",
                                            "id": 6,
                                            "style": {
                                                "flex": 1,
                                                "maxWidth": "100%",
                                                "maxHeight": "100%",
                                                "border": "none",
                                                "borderRadius": "10px",
                                                "display": "flex",
                                                "alignItems": "center",
                                                "justifyContent": "center",
                                                "overflow": "hidden"
                                            },
                                            "className": [],
                                            "children": [
                                                {
                                                    "type": "Container",
                                                    "id": 7,
                                                    "className": [],
                                                    "style": {
                                                        "display": "flex",
                                                        "width": '`${100 * functions.childrens.length / visibleCount}%`',
                                                        "transform": `translateX(-${functions.currentIndex * (100 / functions.visibleCount)}%)`,
                                                        "transition": "transform 0.9s ease"
                                                    },
                                                    "children": [{
                                                        'type': 'Container',
                                                        'id': 'ChildrenArray',
                                                        "className": [],
                                                        "children": []
                                                    }]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: 'Text',
            text: 'Item 4',
            id:'a1',
            style: { backgroundColor: 'yellow', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
        },
        {
            type: 'Text',
            text: 'Texto de ejemplo',
            id:'a2',
            style: { backgroundColor: 'lightgrey', height: '45vh', width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', objectFit: 'cover', margin: '0 auto' }
        },
        {
            type: 'Image',
            className: ['center'],
            id:'a3',
            src: 'https://res.cloudinary.com/dplncudbq/image/upload/v1657563380/mias/h19_wgstaq.jpg',
            alt: 'Placeholder',
            width: '1000',
            height: '1000',
            style: { width: '100%', objectFit: 'cover', margin: '0 auto' }
        },
        {
            type: 'Video',
            id:'a4',
            src: 'https://res.cloudinary.com/dplncudbq/video/upload/v1657988838/mias/y5_hjj0uv.mp4',
            style: { height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
        }
    ]
}

functions.localStorageAcces('POST', 'multifunctions', slide)

  function injectLabelIntoJSON(json) {
    console.log(json);
    
    // Función recursiva para buscar el elemento con id = "ChildrenArray"
    function findAndInject(node) {
        if (node.id === "ChildrenArray") {
            node.children.push(items);
        } else if (node.children) {
            node.children.forEach(child => findAndInject(child));
        }
    }

    // Clonar el JSON para no modificar el original
    const clonedJson = JSON.parse(JSON.stringify(json));
    findAndInject(clonedJson);
    return clonedJson;
}

export default function SlideGallery({ children, visibleCount2, autoScroll = false, interval = 3000, showNavigationButtons2 = true, showNavigationPoints2 = true, autoScrollAfterClick = true, timeToReactivateAutoScrollAfterClick = 3000 }) {
    const [body, setBody] = useState({});
    const [isInjected, setIsInjected] = useState(false);

    useEffect(() => {
        functions.convertStringFunctionsToOperables('multifunctions', functions, setBody)
    }, []);

    useEffect(() => {
        if (Object.keys(body).length !== 0) { 
            if (!isInjected) {
                console.log(body);
                setBody(injectLabelIntoJSON(body));
                setIsInjected(true);
            }
        }
    }, [body, isInjected]);

    return RenderElement(body)
}











/*useEffect(() => {
        if (autoScroll) {
            autoScrollRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + visibleCount) % children.length);
            }, interval);
        }
        return () => clearInterval(autoScrollRef.current);
    }, [autoScroll, interval, visibleCount, children.length]);

    const stopAutoScroll = () => {
        if (autoScrollRef.current) {
            clearInterval(autoScrollRef.current);
            autoScrollRef.current = null;
            console.log('Movimiento del slide detenido');
        }

        if(autoScrollAfterClick === true){
            setTimeout(() => {
                autoScrollRef.current = setInterval(() => {
                    setCurrentIndex((prevIndex) => (prevIndex + visibleCount) % children.length);
                }, interval);
                console.log('Movimiento del slide reactivado');
            }, timeToReactivateAutoScrollAfterClick);
        }
    };

    const handleNext = () => {
        stopAutoScroll();
        setCurrentIndex((prevIndex) => (prevIndex + visibleCount) % children.length);
    };

    const handleBefore = () => {
        stopAutoScroll();
        setCurrentIndex((prevIndex) => (prevIndex - visibleCount + children.length) % children.length);
    };

    const handleIndicatorClick = (index) => {
        stopAutoScroll();
        setCurrentIndex(index * visibleCount);
    };

    const totalSlides = Math.ceil(children.length / visibleCount);

    return (
        <>
            <div className='center' style={{ width: '100%', height: '80vh' }}>
                <div className='center scroll' style={{ width: '80%', height: '65vh' }}>
                    <div className=''>
                        <div className='' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 'max-content' }}>
                            <div
                                style={{
                                    flex: 1,
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    border: 'none',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ display: 'flex', width: `${100 * children.length / visibleCount}%`, transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`, transition: 'transform 0.9s ease' }}>
                                    {children.map((child, index) => (
                                        <div className='center' key={index} style={{ flex: `0 0 ${100 / visibleCount}%` }}>
                                            {child}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showNavigationPoints && (
                <div className='center padding1'>
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleIndicatorClick(index)}
                            style={{
                                backgroundColor: currentIndex / visibleCount === index ? '#007bff' : '#ccc',
                                border: 'none',
                                borderRadius: '50%',
                                width: '10px',
                                height: '10px',
                                margin: '0 5px',
                                cursor: 'pointer'
                            }}
                        />
                    ))}
                </div>
            )}
            {showNavigationButtons && (
                <div className='center padding1'>
                    <button
                        onClick={handleBefore}
                        style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            cursor: 'pointer',
                            margin: '0 10px'
                        }}
                    >
                        Before
                    </button>
                    <button
                        onClick={handleNext}
                        style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            cursor: 'pointer',
                            margin: '0 10px'
                        }}
                    >
                        After
                    </button>
                </div>
            )}
        </>
    );*/




/*export default function slideGalery(children){
    return {
        "type": "Container",
        "style": {
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "center"
        },
        "children": [
            {
                "type": "Button",
                "onClick": "() => functions.alert('next')",
                "style": {
                    "backgroundColor": "#007bff",
                    "color": "white",
                    "border": "none",
                    "padding": "10px",
                    "cursor": "pointer",
                    "margin": "0 10px"
                },
                "children": []
            },
            {
                "type": "Container",
                "style": {
                    "maxWidth": "600px",
                    "maxHeight": "400px",
                    "border": "2px solid #ddd",
                    "borderRadius": "10px",
                    "display": "flex",
                    "alignItems": "center",
                    "justifyContent": "center"
                },
                "children": children
            },
            {
                "type": "Button",
                "onClick": "() => functions.alert('before')",
                "style": {
                    "backgroundColor": "#007bff",
                    "color": "white",
                    "border": "none",
                    "padding": "10px",
                    "cursor": "pointer",
                    "margin": "0 10px"
                },
                "children": []
            }
        ]
    }    
}*/


