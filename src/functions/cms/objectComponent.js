export default function objectComponent(type) {
    const id = `new_${Date.now()}`;

    const obj = {
        'Container': {
            "type": "Container",
            "className": ["center", "color3"],
            "id": id,
            "style": {
                "width": "100%",
                "height": "80vh"
            },
            'onClick': () => alert('conat'),
            "children": []
        },
        'Text': {
            "type": "Text",
            "className": ["center", "color3"],
            "id": id,
            "style": {
                'color': 'white'
            },
            'text': 'hola mundo',
            'onClick': () => console.log(`text`)
        },
        'TextArea': {
            "type": "TextArea",
            "className": ["center", "color3"],
            "id": id,
            "style": {
                'color': 'white'
            },
            'text': 'text area',
            'onClick': () => console.log(`text area`)
        },
        'Image': {
            "type": "Image",
            "className": ["center", "color3"],
            "id": id,
            "style": {
                width: '100px',
                height: '100px'
            },
            'src': 'https://res.cloudinary.com/dplncudbq/image/upload/v1676133410/mias/adelante_ztqvpx.png',
            'onClick': () => console.log(`img`),
            'width': '30',
            'height': '30',
            'alt': 'image'

        },
        'Audio': {
            "type": "Audio",
            "id": id,
            "src": 'https://res.cloudinary.com/dplncudbq/video/upload/v1692977795/mias/relax7_orxvbj.mp3',
            'autoPlay': false,
            'loop': false,
            'controlsList': []//'nodownload', 'nofullscreen', 'noremoteplayback', 'noplaybackrate'

        },
        'Button': {
            "type": "Button",
            "id": id,
            "className": ["color1"],
            "style": {
                backgroundColor: 'blue',
                color: 'white'
            },
            "onClick": () => console.log('Button clicked'),
            "children": [
                {
                    "type": "Text",
                    "className": ["center", "color3"],
                    "id": `${id}button`,
                    "style": {
                        'color': 'white'
                    },
                    'text': 'button',
                    'onClick': () => console.log(`text inside button`)
                }
            ]
        },
        'Input': {
            "type": "Input",
            "inputType": "text",
            "id": id,
            "style": {
                border: '1px solid #ccc',
                padding: '10px'
            },
            "required": true,
            "onValueChange": (newValue) => console.log(`Input value changed to: ${newValue}`),
            "value": 'Input content',
            "name": 'inputName',
            "className": ["color2"]
        },
        'Label': {
            "type": "Label",
            "id": id,
            "name": `${id}name`,
            "value": "Texto de ejemplo",
            "onValueChange": (newValue) => console.log(`Label value changed to: ${newValue}`),
            "className": ["center", "color3"],
            "style": {
                color: 'black',
                width: '100%',
                padding: '12px 20px',
                margin: '8px 0',
                boxSizing: 'border-box',
                borderRadius: '4px',
                transition: '0.5s',
                outline: 'none',
                display: 'block'
            }
        },
        'Link': {
            "type": "Link",
            "id": id,
            "href": "https://example.com",
            "className": ["center", "color3"],
            "style": {
                        'color': 'white'
                    },
            'text': 'link'
        },
        'Select': {
            "type": "Select",
            "id": id,
            "name": "selectName",
            "value": "option1",
            "options": ["option1", "option2", "option3"],
            "event": (event) => console.log(`Selected value: ${event.target.value}`),
            "style": {
                fontSize: '3.5vh'
            },
            "className": ["select-moderno", "resaltar"]
        },
        'Video': {
            "type": "Video",
            "id": id,
            "src": "https://res.cloudinary.com/dplncudbq/video/upload/v1692931660/mias/v4_mhcssu.mp4",
            "onClick": () => console.log('Video clicked'),
            "style": {
                width: '640px',
                height: '360px'
            },
            "className": ["color2"]
        }
    };    

    return obj[type] || null;
}
