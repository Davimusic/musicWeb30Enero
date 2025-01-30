import udpateBodies from "./udpateBodies";
import deepClone from "@/functions/general/deepClone";

export default function deleteComponent(id, component, setIsReinjected, setBody, setBodyEdit, setBodyTest, bodyTest, isUdpateBodies) {
    const obj = {...component}
    const objTest = {...bodyTest}

    function removeComponentById(id, obj) {
        if (obj.id === id) {
            return null;
        }
        if (obj.children) {
            obj.children = obj.children
                .map(child => removeComponentById(id, child))
                .filter(child => child !== null);
        }
        return obj;
    }

    if(isUdpateBodies){
        let editObj = removeComponentById(id, deepClone(obj))
        let testObj = removeComponentById(id, deepClone(objTest))
        udpateBodies(editObj, testObj, true, setIsReinjected, setBody, setBodyEdit, setBodyTest)
    }
}