const playerMusic = [
    {
        image: {
            className: [],
            style: { backgroundColor: "transparent" },
            alt: "Imagen 1",
            width: 50,
            height: 50,
            id: "imageAudioPlayer1",
            src: "https://res.cloudinary.com/dplncudbq/image/upload/v1693680649/video_u9gl6j.png"
        },
        text: {
            id: "textAudioPlayer1",
            text: "Texto 1",
            style: {},
            className: []
        }
    }
];

const musicContent = (handleImageClick) => [
    {
        image: {
            onClick: () => handleImageClick(
                'https://res.cloudinary.com/dplncudbq/video/upload/v1699541461/n11_dcpomq.mp3', // URL de la canción
                'https://res.cloudinary.com/dplncudbq/image/upload/v1696908663/f3_w6ble7_6_11zon_r9zfj1.webp', // Nueva URL de la imagen
                'Texto 1 de prueba gsgsgsgsg' // Nuevo texto
            ),
            className: [],
            style: { backgroundColor: "transparent" },
            alt: "Imagen 1",
            width: 50,
            height: 50,
            id: "imageAudioPlayer2",
            src: "https://res.cloudinary.com/dplncudbq/image/upload/v1696908663/f3_w6ble7_6_11zon_r9zfj1.webp"
        },
        text: {
            id: "textAudioPlayer2",
            text: "Texto 1 de prueba gsgsgsgsg",
            style: {},
            className: []
        }
    },
    {
        image: {
            className: [],
            style: { backgroundColor: "transparent" },
            alt: "Imagen 2",
            width: 50,
            height: 50,
            id: "imageAudioPlayer3",
            src: "https://res.cloudinary.com/dplncudbq/image/upload/v1696908664/f4_a6b89j_7_11zon_y00zoz.webp",
            onClick: () => handleImageClick(
                'https://res.cloudinary.com/dplncudbq/video/upload/v1699541446/n12_sk8ytz.mp3', // URL de la canción
                'https://res.cloudinary.com/dplncudbq/image/upload/v1696908664/f4_a6b89j_7_11zon_y00zoz.webp', // Nueva URL de la imagen
                'Texto 2 de la d' // Nuevo texto
            )
        },
        text: {
            id: "textAudioPlayer2",
            text: "Texto 2 de la d",
            style: {},
            className: []
        }
    },
    {
        image: {
            className: [],
            style: { backgroundColor: "transparent" },
            alt: "Imagen 2",
            width: 50,
            height: 50,
            id: "imageAudioPlayer3",
            src: "https://res.cloudinary.com/dplncudbq/image/upload/v1696908664/f4_a6b89j_7_11zon_y00zoz.webp",
            onClick: () => handleImageClick(
                'https://res.cloudinary.com/dplncudbq/video/upload/v1699541446/n12_sk8ytz.mp3', // URL de la canción
                'https://res.cloudinary.com/dplncudbq/image/upload/v1696908664/f4_a6b89j_7_11zon_y00zoz.webp', // Nueva URL de la imagen
                'Texto 2 de la d' // Nuevo texto
            )
        },
        text: {
            id: "textAudioPlayer2",
            text: "Texto 2 de la d 3",
            style: {},
            className: []
        }
    },
    {
        image: {
            className: [],
            style: { backgroundColor: "transparent" },
            alt: "Imagen 2",
            width: 50,
            height: 50,
            id: "imageAudioPlayer3",
            src: "https://res.cloudinary.com/dplncudbq/image/upload/v1696908664/f4_a6b89j_7_11zon_y00zoz.webp",
            onClick: () => handleImageClick(
                'https://res.cloudinary.com/dplncudbq/video/upload/v1699541446/n12_sk8ytz.mp3', // URL de la canción
                'https://res.cloudinary.com/dplncudbq/image/upload/v1696908664/f4_a6b89j_7_11zon_y00zoz.webp', // Nueva URL de la imagen
                'Texto 2 de la d' // Nuevo texto
            )
        },
        text: {
            id: "textAudioPlayer2",
            text: "Texto 2 de la d 4",
            style: {},
            className: []
        }
    }
];

// Exportar los datos
const dataMusic = (handleImageClick) => ({
    playerMusic,
    musicContent: musicContent(handleImageClick)
});

export default dataMusic;