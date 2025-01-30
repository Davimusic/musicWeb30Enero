export default function addElementToArray(array, element) {
    let clone = [...array];
    clone.push(element);
    return clone;
}