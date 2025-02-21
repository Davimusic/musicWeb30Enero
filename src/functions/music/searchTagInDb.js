import mapCompositionsToMusicContent from "./mapCompositionsToMusicContent";


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
                    setTags(returnOnlyTags(compositions))
                    const mappedCompositions = mapCompositionsToMusicContent(compositions.reverse());//el reverse asegura que lo nuevo se verà de primeras en lo mostrado al usuario
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