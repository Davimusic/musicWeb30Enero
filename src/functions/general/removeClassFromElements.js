export default function removeClassFromElements(elements, className) {
    const ids = [];
    elements.forEach(element => {
        if (element && element.id) { // Validación para evitar errores
            document.getElementById(element.id).classList.remove(className);
            ids.push(element.id);
        }
    });
    return ids;
}