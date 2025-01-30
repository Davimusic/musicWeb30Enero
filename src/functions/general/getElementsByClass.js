export default function getElementsByClass(className) {
    return Array.from(document.getElementsByClassName(className));
}