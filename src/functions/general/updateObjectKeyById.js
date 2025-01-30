export default function updateNestedObjectById(id, obj, key, newValue) {
    // Crear una copia del objeto original
    const newObj = { ...obj };

    // Función recursiva para buscar y actualizar el objeto
    function recursiveUpdate(currentObj) {
        if (currentObj.id === id) {
            currentObj[key] = newValue;
            return true;
        }
        if (currentObj.children && currentObj.children.length > 0) {
            for (let child of currentObj.children) {
                if (recursiveUpdate(child)) {
                    return true;
                }
            }
        }
        return false;
    }

    recursiveUpdate(newObj);
    return newObj;
}