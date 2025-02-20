import mapCompositionsToMusicContent from "./mapCompositionsToMusicContent";


export const searchTagInDb = async (searchTerm, setContent, setMusicContent) => {
    try {
        const response = await fetch(`/api/getCompositionsFromDb?tag=${encodeURIComponent(searchTerm.trim())}&limit=50`);
        const data = await response.json();

        if (data.success) {
            console.log(data);
            
            if (data.compositions.length === 0) {
                return false
            } else {
                    const compositions = data.compositions;
                    const mappedCompositions = mapCompositionsToMusicContent(compositions);
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
};