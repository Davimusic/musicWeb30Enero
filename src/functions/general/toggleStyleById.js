export default function toggleStyleById(id, styleProperty, styleValue, isAddStyle) {
    const element = document.getElementById(id);
    if (element) {
        if (isAddStyle) {
            element.style[styleProperty] = styleValue;
        } else {
            element.style[styleProperty] = '';
        }
    } else {
        console.error(`Element with id ${id} not found.`);
    }
}


