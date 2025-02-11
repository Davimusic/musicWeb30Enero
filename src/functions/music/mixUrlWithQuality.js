export default function mixUrlWithQuality (url, quality){
    const urlObj = new URL(url);
    urlObj.searchParams.set('q', quality);
    //console.log(urlObj.toString()); //aqui se puede ver la calidad a exportar
    return urlObj.toString();
};

