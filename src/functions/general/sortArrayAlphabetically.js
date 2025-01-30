export default function sortArrayAlphabetically(array) {
    return array.slice().sort((a, b) => a.localeCompare(b));
}