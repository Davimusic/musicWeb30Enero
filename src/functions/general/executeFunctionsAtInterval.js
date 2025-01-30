export default function executeFunctionsAtCustomIntervals(functionsArray) {
    if (!Array.isArray(functionsArray)) {
        throw new Error('Invalid argument: expected an array of objects.');
    }
    console.log('executeFunctionsAtCustomIntervals');
    
    functionsArray.forEach(item => {
        if (typeof item.function !== 'function' || typeof item.setInterval !== 'number') {
            throw new Error('Invalid object format: expected objects with "function" (function) and "setInterval" (number) properties.');
        }

        setTimeout(item.function, item.setInterval);
    });
}



