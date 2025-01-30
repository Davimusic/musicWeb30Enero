export default function traverseAndStringify(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;

    for (const key in obj) {
        if (typeof obj[key] === 'function') {
            obj[key] = obj[key].toString();
        } else if (typeof obj[key] === 'object') {
            traverseAndStringify(obj[key]);
        }
    }
    return obj;
}