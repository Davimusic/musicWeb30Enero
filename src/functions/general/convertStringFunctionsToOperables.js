import localStorageAcces from "../security/localStorageAcces";

export default function convertStringFunctionsToOperables(path, functions, setBody) {
    if (typeof window !== 'undefined') {
        const storedObject = localStorageAcces('GET', path)//JSON.parse(localStorage.getItem(path));

        if (storedObject) {
            const traverseAndEval = (obj) => {
                if (obj.onClick) {
                    obj.onClick = eval(`(${obj.onClick})`);
                }
                if (obj.onValueChange) {
                    obj.onValueChange = eval(`(${obj.onValueChange})`);
                }
                if (obj.children && Array.isArray(obj.children)) {
                    obj.children.forEach(child => traverseAndEval(child));
                }
            };

            traverseAndEval(storedObject);
            //console.log(storedObject);
            
            setBody(storedObject);
        }
    }
}


