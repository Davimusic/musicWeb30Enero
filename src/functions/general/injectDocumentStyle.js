export default function injectDocumentStyle(className, styles) {
    const style = document.createElement('style');
    style.innerHTML = `
        .${className} {
            ${styles}
        }
    `;
    document.head.appendChild(style);
}
