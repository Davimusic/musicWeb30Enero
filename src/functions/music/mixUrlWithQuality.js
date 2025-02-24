export default function mixUrlWithQuality(url, quality) {
    // Validar quality
    const validQualities = [25, 50, 75, 100];
    if (!validQualities.includes(quality)) {
        throw new Error("Quality debe ser 25, 50, 75 o 100.");
    }

    // Mapeo de ajustes mejorados
    const qualitySettings = {
        25: { q: 50, br: "400k", width: 480, fps: 24 },  // Calidad baja pero decente
        50: { q: 70, br: "800k", width: 720, fps: 24 },  // Calidad media
        75: { q: 85, br: "1200k", width: 1080, fps: 30 }, // Calidad alta
        100: { q: 100, br: "2500k", width: 1080, fps: 60 }, // Calidad máxima
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

