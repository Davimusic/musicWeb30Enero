export default async function getClassNamesFromPathCSS(filePath) {
    try {
      const response = await fetch(filePath);
      const cssContent = await response.text();
  
      const classNamesSet = new Set();
      const classNames = cssContent.match(/\.[a-zA-Z0-9_-]+/g);
  
      if (classNames) {
        classNames.forEach(className => {
          classNamesSet.add(className.slice(1));
        });
      }
  
      return Array.from(classNamesSet);
    } catch (error) {
      console.error('Error fetching CSS file:', error);
      return [];
    }
  }



/*export default function getClassNamesFromPathCSS() {
    // Crear un Set para almacenar las clases únicas
    const clases = new Set();

    // Obtener todos los elementos del documento
    const elementos = document.querySelectorAll('*');

    // Iterar sobre cada elemento
    elementos.forEach(elemento => {
        // Obtener la lista de clases del elemento
        const listaClases = elemento.classList;

        // Añadir cada clase al Set
        listaClases.forEach(clase => clases.add(clase));
    });

    // Convertir el Set a un arreglo
    return Array.from(clases);
}*/

