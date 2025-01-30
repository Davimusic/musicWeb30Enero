const getFilteredKeysArray = (obj, excludePattern) => {
    return Object.keys(obj).filter(key => !key.startsWith(excludePattern));
};

export default getFilteredKeysArray;
