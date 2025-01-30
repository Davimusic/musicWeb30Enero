// Simple function to move an element
function move(obj, distance, direction) {
    if (obj) {
        console.log(`Moving element ${obj.id} ${direction} by ${distance}px`);
        obj.style.position = 'relative';
        
        const currentLeft = parseInt(window.getComputedStyle(obj).left, 10) || 0;
        const newLeft = direction === 'left' ? currentLeft - distance : currentLeft + distance;
        obj.style.left = `${newLeft}px`;
    }
}

function moveGallery(obj, direction) {
    if (obj) { const currentLeft = parseInt(window.getComputedStyle(obj).left, 10) || 0; const distance = obj.offsetWidth; 
        const newLeft = direction === 'left' ? currentLeft + distance : currentLeft - distance; obj.style.transition = 'all 0.5s ease'; 
        obj.style.left = `${newLeft}px`; } 
} 

// Dictionary to map function names to simple functions
const functionDictionary = {
    'changeStyle': changeStyle,
    'move': move,
    'moveGallery': moveGallery
};

export default function importRemoteFunctions(functionName, elementId, ...params) {
    const obj = elementId ? getElement(elementId) : null;

    if (functionDictionary[functionName]) {
        if (obj) {
            return functionDictionary[functionName](obj, ...params);
        } else {
            return functionDictionary[functionName](...params);
        }
    } else {
        console.error(`Function ${functionName} not found`);
    }
}


function getElement(elementId) {
    return document.getElementById(elementId);
}


function changeStyle(obj, styles) {
    if (obj) {
        for (const [property, value] of Object.entries(styles)) {
            if (value !== null) {
                obj.style[property] = value;
            } else {
                obj.style.removeProperty(property);
            }
        }
    }
}








