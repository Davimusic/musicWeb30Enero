export default function extractArrayContentToStrings(array) {
    if (Array.isArray(array)) {
        return array.join(' ');
    } else {
        return ''
    }
}
