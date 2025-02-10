export default function mapCompositionsToMusicContent(data) {
    const compositions = data[0].compositions; // Accede al array de composiciones dentro del objeto

    return compositions.map(composition => {
        const archivos = composition.archivos || [];

        const imageFile = archivos.find(file => file.tipo === 'imagen');
        const audioFile = archivos.find(file => file.tipo === 'audio');
        const midiFile = archivos.find(file => file.tipo === 'midi');
        const pdfFile = archivos.find(file => file.tipo === 'pdf');
        const videoFile = archivos.find(file => file.tipo === 'video'); // Nuevo: Busca el archivo de video

        return {
            image: {
                className: [],
                style: { backgroundColor: "transparent", borderRadius: '50%' },
                alt: composition.titulo,
                width: 50,
                height: 50,
                id: `image_${composition._id}`,
                src: imageFile ? imageFile.url_cloudinary : ''
            },
            text: {
                id: `text_${composition._id}`,
                textDescripcion: composition.descripcion,
                textTitle: composition.titulo,
                style: {},
                className: []
            },
            audio: {
                id: `audio_${composition._id}`,
                src: audioFile ? audioFile.url_cloudinary : '',
                autoPlay: false,
                loop: false,
                controlsList: true,
                backgroundColor: "#1e1e1e",
                buttonColor: "#ffffff",
                sliderEmptyColor: "#444",
                sliderFilledColor: "#1db954",
                showPlayButton: true,
                showVolumeButton: true,
                playIcon: "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/play_slnrjf.png",
                pauseIcon: "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/pause_h2cozi.png",
                volumeIcon: "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/volumeup_qodl3n.png",
                width: "100%"
            },
            midi: {
                id: `midi_${composition._id}`,
                src: midiFile ? midiFile.url_cloudinary : '',
                autoPlay: false,
                loop: false,
                controlsList: true,
                backgroundColor: "#1e1e1e",
                buttonColor: "#ffffff",
                sliderEmptyColor: "#444",
                sliderFilledColor: "#1db954",
                showPlayButton: true,
                showVolumeButton: true,
                playIcon: "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/play_slnrjf.png",
                pauseIcon: "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/pause_h2cozi.png",
                volumeIcon: "https://res.cloudinary.com/dplncudbq/image/upload/v1738190812/volumeup_qodl3n.png",
                width: "100%"
            },
            pdf: {
                id: `pdf_${composition._id}`,
                src: pdfFile ? pdfFile.url_cloudinary : '',
                width: "100%",
                height: "auto"
            },
            video: { // Nuevo: Agrega el objeto de video
                id: `video_${composition._id}`,
                src: videoFile ? videoFile.url_cloudinary : '',
                width: "100%",
                height: "auto",
                controls: true,
                autoPlay: false,
                loop: false
            }
        };
    });
}


