const items= 
    {
        type: 'Container',
        id: 'ex1',
        style: {display: 'flex'},
        className: ['scroll'],
        children: [
            {
                type: 'Text',
                id: 'ex2',
                text: 'Item 1',
                style: { backgroundColor: 'red', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' },
                "className": ['rotate'],
            },
            {
                type: 'TextArea',
                id: 'ex3',
                text: 'Item 2',
                "className": [],
                style: { backgroundColor: 'green', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Text',
                id: 'ex4',
                text: 'Item 3',
                "className": [],
                style: { backgroundColor: 'blue', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' },
                onClick: () => alert('si')
            },
            {
                type: 'Text',
                id: 'ex5',
                text: 'Item 4',
                "className": [],
                style: { backgroundColor: 'yellow', height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Text',
                id: 'ex6',
                text: 'Texto de ejemplo',
                "className": [],
                style: { backgroundColor: 'lightgrey', height: '45vh', width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'center', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Image',
                id: 'ex7',
                "className": [],
                src: 'https://res.cloudinary.com/dplncudbq/image/upload/v1657563380/mias/h19_wgstaq.jpg',
                alt: 'Placeholder',
                width: '1000',
                height: '1000',
                style: { width: '100%', objectFit: 'cover', margin: '0 auto' }
            },
            {
                type: 'Video',
                id: 'ex8',
                "className": [],
                src: 'https://res.cloudinary.com/dplncudbq/video/upload/v1657988838/mias/y5_hjj0uv.mp4',
                style: { height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
            }
        ]
}

const i2 = {
    type: 'Container',
    id: 'ex1',
    style: {display: 'flex'},
    className: ['scroll'],
    children: [
        {
            type: 'Image',
            id: 'ex7',
            "className": [],
            src: 'https://res.cloudinary.com/dplncudbq/image/upload/v1657563380/mias/h19_wgstaq.jpg',
            alt: 'Placeholder',
            width: '1000',
            height: '1000',
            style: { width: '50%', objectFit: 'cover', margin: '0 auto' },
            onClick:()=> console.log('hola mundo')
            
        }, {
            type: 'TextArea',
            id: 'ex3',
            value: 'Item 2',
            "className": [],
            style: { backgroundColor: 'white', color: 'white',  height: '45vh', width: '90%', objectFit: 'cover', margin: '0 auto' }
        }
        ]
    }

export default i2