export default function removeStringFromArray(arr, str) {
    // Crear una copia del arreglo
    const newArr = [...arr];
    const index = newArr.indexOf(str);
    if (index !== -1) {
        newArr.splice(index, 1);
    }
    return newArr;
}