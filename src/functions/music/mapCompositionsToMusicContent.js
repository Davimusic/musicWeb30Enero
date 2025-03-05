export default function mapCompositionsToMusicContent(compositions) {
    //console.log(compositions);
    
    return compositions.map(composition => {
        const archivos = composition.archivos || [];

        // Filtra los archivos por tipo
        const imageFiles = archivos.filter(file => file.tipo === 'image');
        const audioFiles = archivos.filter(file => file.tipo === 'audio');
        const midiFiles = archivos.filter(file => file.tipo === 'midi');
        const pdfFiles = archivos.filter(file => file.tipo === 'pdf');
        const videoFiles = archivos.filter(file => file.tipo === 'video');

        // Encuentra los archivos principales
        const imagePrincipal = composition.imagen_principal || imageFiles.find(file => file.es_principal) || imageFiles[0];
        const audioPrincipal = composition.audio_principal || audioFiles.find(file => file.es_principal) || audioFiles[0];
        const videoPrincipal = composition.video_principal || videoFiles.find(file => file.es_principal) || videoFiles[0];

        // Mapea los archivos a la estructura deseada
        const images = imageFiles.map((file, index) => ({
            className: [],
            style: { backgroundColor: "transparent", borderRadius: '50%' },
            alt: composition.titulo,
            width: 50,
            height: 50,
            id: `image_${composition._id}_${index}`,
            src: file.url_cloudinary,
            informationFile: file.texto_explicativo,
            esPrincipal: file === imagePrincipal // Indica si es el archivo principal
        }));

        const audios = audioFiles.map((file, index) => ({
            id: `audio_${composition._id}_${index}`,
            src: file.url_cloudinary,
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
            width: "100%",
            informationFile: file.texto_explicativo,
            esPrincipal: file === audioPrincipal // Indica si es el archivo principal
        }));

        const midis = midiFiles.map((file, index) => ({
            id: `midi_${composition._id}_${index}`,
            src: file.url_cloudinary,
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
            width: "100%",
            informationFile: file.texto_explicativo
        }));

        const pdfs = pdfFiles.map((file, index) => ({
            id: `pdf_${composition._id}_${index}`,
            src: file.url_cloudinary,
            width: "100%",
            height: "auto",
            informationFile: file.texto_explicativo
        }));

        const videos = videoFiles.map((file, index) => ({
            id: `video_${composition._id}_${index}`,
            src: file.url_cloudinary,
            width: "100%",
            height: "auto",
            controls: true,
            autoPlay: false,
            loop: false,
            informationFile: file.texto_explicativo,
            esPrincipal: file === videoPrincipal // Indica si es el archivo principal
        }));

        return {
            image: images, // Arreglo de imágenes
            text: {
                id: `text_${composition._id}`,
                textDescripcion: composition.descripcion,
                textTitle: composition.titulo,
                style: {},
                className: []
            },
            audio: audios, // Arreglo de audios
            midi: midis, // Arreglo de midis
            pdf: pdfs, // Arreglo de pdfs
            video: videos, // Arreglo de videos
            imagePrincipal: imagePrincipal ? {
                id: `image_principal_${composition._id}`,
                src: imagePrincipal.url_cloudinary,
                className: [],
                style: { backgroundColor: "transparent", borderRadius: '50%' },
                alt: composition.titulo,
                width: 50,
                height: 50,
                informationFile: imagePrincipal.texto_explicativo
            } : null,
            audioPrincipal: audioPrincipal ? {
                id: `audio_principal_${composition._id}`,
                src: audioPrincipal.url_cloudinary,
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
                width: "100%",
                informationFile: audioPrincipal.texto_explicativo
            } : null,
            videoPrincipal: videoPrincipal ? {
                id: `video_principal_${composition._id}`,
                src: videoPrincipal.url_cloudinary,
                width: "100%",
                height: "auto",
                controls: true,
                autoPlay: false,
                loop: false,
                informationFile: videoPrincipal.texto_explicativo
            } : null,
            idObjeto: composition._id,
            etiquetas: composition.etiquetas, // Incluye las etiquetas
            estadisticas: composition.estadisticas, // Incluye las estadísticas
            fechaCreacion: composition.fecha_creacion // Incluye la fecha de creación
        };
    });
}








