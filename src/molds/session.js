const [body, setBody] = useState({
    contaninerPadre: {
        type: "Container",
        name: "containerPadre",
        style: {
            margin: "0 auto",
            padding: "20px",
            width: '90vw',
            height: '90vh',
            //backgroundColor: 'red'
            //display: 'block'
        },
        className: 'scroll center',
        children: [
            {
                type: "Container",
                name: "passwordInputContainer",
                className: 'horizontalCenter',//color2
                style: {
                    //backgroundColor: 'blue'
                },
                children: [
                    {
                        type: "Container",
                        name: "passwordInputContainer",
                        className: 'responsiveContainer',//color2
                        style: {},
                        children: [
                            {
                                type: "Container",
                                name: "passwordInputContainer",
                                className: 'halfLengthHorizontalAvailable',
                                style: {},
                                children: [
                                    {
                                        type: "Video",
                                        name: "video",
                                        src: "https://res.cloudinary.com/dplncudbq/video/upload/v1657988513/mias/y1_b0pxvc.mp4",
                                        className:'fixSpace borders1',
                                    },
                                ]
                            },
                            {
                                type: "Container",
                                name: "passwordInputContainer",
                                className: 'halfLengthHorizontalAvailable',
                                style: {diplay: 'block'},
                                children: [
                                    {
                                        type: "Text",
                                        name: "text",
                                        text: "Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha ",
                                        style: {},
                                        onClick: [() => Alert('texto'), () => Alert('texto 2')],
                                        className: 'quarterLengthOfAvailableVerticalSpace padding1  scroll',//color2
                                    },
                                    {
                                        type: "Container",
                                        name: "botonsConatiner",
                                        style: {},
                                        className: ' equalSpace marginTop2',//color3
                                        children: [
                                            {
                                                type: "Button",
                                                name: "submitButton",
                                                style: {
                                                    backgroundColor: "transparent", 
                                                    color: "transparent", 
                                                    border: "none", 
                                                    cursor: "pointer",
                                                    width: '60px',
                                                    height: '60px'
                                                },
                                                onClick: [  () => Alert('atras'), () => Alert('atras 2')],
                                                children: [
                                                    {
                                                        type: 'Image',
                                                        name: 'image1',
                                                        style: {},
                                                        src: 'https://res.cloudinary.com/dplncudbq/image/upload/v1676133407/mias/atras_lfyntg.png',
                                                        alt: 'atras',
                                                        className: 'buttonImage',
                                                        width: '300',
                                                        height: '300',
                                                    }, 
                                                ]
                                            },
                                            {
                                                type: "Button",
                                                name: "submitButton",
                                                style: {
                                                    backgroundColor: "transparent", 
                                                    color: "transparent", 
                                                    border: "none", 
                                                    cursor: "pointer",
                                                    width: '60px',
                                                    height: '60px'
                                                },
                                                onClick: [  () => Alert('siguiente'),
                                                            
                                                    ],
                                                children: [
                                                    {type: 'Image',
                                                        name: 'image2',
                                                        style: {},
                                                        src: 'https://res.cloudinary.com/dplncudbq/image/upload/v1676133410/mias/adelante_ztqvpx.png',
                                                        alt: 'adelante',
                                                        className: 'buttonImage',
                                                        width: '300',
                                                        height: '300'
                                                        }
                                                ]
                                            }
                                            
                                        ]
                                    }
                                ]
                            },
                            
                            
                        ]
                    },
                    
                ]
            },
            
        ],
    }
}


)