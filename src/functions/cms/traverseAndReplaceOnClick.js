import isEmptyObject from "@/functions/general/isEmptyObject";

export default function traverseAndReplaceOnClick(obj, handleButtonClick, ids) {
    console.log(ids);
    
    if (obj !== undefined && !isEmptyObject(obj)) {
        // If ids array is provided and not empty, apply to specified IDs only
        if (Array.isArray(ids) && ids.length > 0) {
            console.log('entra...');
            
            if (ids.includes(obj.id)) {
                console.log('final...');
                console.log(handleButtonClick);
                
                obj.onClick = (e) => {
                    e.stopPropagation();
                    handleButtonClick(obj.id);
                };
                console.log(obj);
                
            }
        } else {
            // Default behavior for all elements when ids array is empty
            obj.onClick = (e) => {
                e.stopPropagation();
                handleButtonClick(obj.id);
            };
        }
        
        // Traverse children if they exist
        if (obj.children && Array.isArray(obj.children)) {
            obj.children.forEach(child => traverseAndReplaceOnClick(child, handleButtonClick, ids));
        }
    }
    console.log(obj);
    
    return obj;
}






/*import isEmptyObject from "@/functions/general/isEmptyObject";

export default function traverseAndReplaceOnClick(obj, handleButtonClick, id) {
    if (obj !== undefined && !isEmptyObject(obj)) {
        obj.onClick = (e) => {
            e.stopPropagation();
            handleButtonClick(obj.id);
        };

        if (obj.children && Array.isArray(obj.children)) {
            obj.children.forEach(child => traverseAndReplaceOnClick(child, handleButtonClick));
        }
    }
    return obj;
}*/
