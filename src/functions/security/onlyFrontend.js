export default function onlyFrontend(func) {
    if (typeof window !== 'undefined') {
        func();
    } else {
        console.log('No se puede usar alert en el servidor');
    }
}

