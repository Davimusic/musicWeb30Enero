const generateShareableLink = (resourceType, id, params = {}) => {
    const baseUrl = window.location.origin; // Obtiene la URL base (http://localhost:3000)
  
    // Construir la URL base con el tipo de recurso y el ID
    let url = `${baseUrl}/${resourceType}/id=${id}`;
  
    // Agregar parámetros adicionales si existen
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }
  
    return url;
};

export default generateShareableLink