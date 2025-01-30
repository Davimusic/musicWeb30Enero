const handleMultipleFunctions = (...functions) => {
    return () => {
        functions.forEach(func => {
            if (typeof func === 'function') {
                func();
            } else {
                console.error('Expected a function, but received:', func);
            }
        });
    };
};

export default handleMultipleFunctions;
