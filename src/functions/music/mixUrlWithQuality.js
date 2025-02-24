export default function mixUrlWithQuality(url, quality) {
    // Validar quality
    const validQualities = [25, 50, 75, 100];
    if (!validQualities.includes(quality)) {
        throw new Error("Quality debe ser 25, 50, 75 o 100.");
    }

    // Mapeo de ajustes exagerados (para notar diferencias)
    const qualitySettings = {
        25: { q: 25, br: "100k", width: 320, fps: 10 }, // Calidad extremadamente baja
        50: { q: 50, br: "300k", width: 480, fps: 15 }, // Calidad baja
        75: { q: 75, br: "800k", width: 720, fps: 24 }, // Calidad media
        100: { q: 100, br: "2000k", width: 1080, fps: 30 }, // Calidad máxima
    };

    // Obtener ajustes
    const settings = qualitySettings[quality];

    // Construir transformaciones
    const transformations = [
        `q_${settings.q}`,
        `br_${settings.br}`,
        `w_${settings.width}`,
        `fps_${settings.fps}`
    ].join(",");

    // Insertar transformaciones en la URL (después de /upload/)
    const parts = url.split("/upload/");
    const newUrl = `${parts[0]}/upload/${transformations}/${parts[1]}`;

    //console.log("URL modificada:", newUrl);
    return newUrl;
}






/*export default function mixUrlWithQuality (url, quality){
    const urlObj = new URL(url);
    urlObj.searchParams.set('q', quality);
    console.log(urlObj.toString()); //aqui se puede ver la calidad a exportar
    return urlObj.toString();
};*/

