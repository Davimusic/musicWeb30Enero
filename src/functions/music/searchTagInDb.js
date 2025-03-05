import mapCompositionsToMusicContent from "./mapCompositionsToMusicContent";

export const searchTagInDb = async (
    searchTerm,
    setContent,
    setMusicContent,
    setTags,
    id = null, // Este es el parámetro que debes usar
    setModalContent,
    setIsModalOpen,
    setIsLoading,
    setIsLoadingMedia
) => {




    function returnOnlyTags(arr) {
        let onlyTags = [];
        for (let u = 0; u < arr.length; u++) {
            onlyTags.push(arr[u].etiquetas);
        }
        let uniqueTags = [...new Set(onlyTags.flat())];
        uniqueTags = uniqueTags.filter(tag => tag !== "");
        return uniqueTags;
    }

    try {
        // Usar el parámetro `id` en la URL de búsqueda
        const url = `/api/getCompositionsFromDb?${id}` ;
        console.log(url);
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            console.log('Datos recibidos:', data); // Depuración
            const compositions = data.compositions;



            if (compositions.length === 0) {
                setIsLoading(false);
                setIsLoadingMedia(false);
                setModalContent('Nooo! The path does not exist.');
                setIsModalOpen(true);
                return false;
            } else {
                setTags(returnOnlyTags(compositions));
                const mappedCompositions = mapCompositionsToMusicContent(compositions.reverse());
                //console.log('Composiciones mapeadas:', mappedCompositions); // Depuración
                setContent([mappedCompositions[0]]);
                setMusicContent(mappedCompositions);
                return true;
            }
        } else {
            console.error('Error en la respuesta del backend:', data.message);
            setIsLoading(false);
            setIsLoadingMedia(false);
            setModalContent('Error al obtener los datos.');
            setIsModalOpen(true);
            return false;
        }
    } catch (error) {
        console.error('Error al buscar:', error);
        setIsLoading(false);
        setIsLoadingMedia(false);
        setModalContent('Error al conectar con el servidor.');
        setIsModalOpen(true);
        return false;
    }
};






/*import mapCompositionsToMusicContent from "./mapCompositionsToMusicContent";


export const searchTagInDb = async (searchTerm, setContent, setMusicContent, setTags) => {

    function returnOnlyTags(arr){
        let onlyTags = []
        for (let u = 0; u < arr.length; u++) {
            onlyTags.push(arr[u].etiquetas)
        }
        let uniqueTags = [...new Set(onlyTags.flat())];
        uniqueTags = uniqueTags.filter(tag => tag !== "");   
        return uniqueTags                 
    }

    try {
        const response = await fetch(`/api/getCompositionsFromDb?tag=${encodeURIComponent(searchTerm.trim())}&limit=50`);
        const data = await response.json();

        if (data.success) {
            console.log(data);
            
            if (data.compositions.length === 0) {
                return false
            } else {
                    const compositions = data.compositions;
                    //console.log(compositions)
                    setTags(returnOnlyTags(compositions))
                    const mappedCompositions = mapCompositionsToMusicContent(compositions.reverse());//el reverse asegura que lo nuevo se verà de primeras en lo mostrado al usuario
                    console.log(mappedCompositions)
                    setContent([mappedCompositions[0]]); 
                    setMusicContent(mappedCompositions); 
                    return true
            }
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error al buscar:', error);
    }
};*/