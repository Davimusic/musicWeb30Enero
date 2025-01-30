export default function removeDocumentClass(className) {
    const elements = document.querySelectorAll('.' + className);
    
    if (elements.length) {
        elements.forEach(element => element.classList.remove(className));
    } else {
        console.error('No se encontraron elementos con la clase ' + className);
    }
}

