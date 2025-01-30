// useHandleImageClick.js
import { useCallback } from 'react';

const useHandleImageClick = (setSong, setContent) => {
    const handleImageClick = useCallback((newSong, newImageSrc, newText) => {
        // Actualizar la canción
        setSong(newSong);

        // Actualizar el contenido dinámicamente
        setContent(prevContent => {
            return prevContent.map(item => {
                // Buscar el objeto que tiene el id específico y actualizar sus propiedades
                if (item.image.id === "imageAudioPlayer1") {
                    return {
                        ...item,
                        image: {
                            ...item.image,
                            src: newImageSrc // Actualizar la URL de la imagen
                        },
                        text: {
                            ...item.text,
                            text: newText // Actualizar el texto
                        }
                    };
                }
                return item;
            });
        });
    }, [setSong, setContent]);

    return handleImageClick;
};

export default useHandleImageClick;