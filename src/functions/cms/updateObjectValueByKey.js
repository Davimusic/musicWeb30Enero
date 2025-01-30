import deepClone from "../general/deepClone";

export default function updateObjectValueByKey(key, newValue, body, bodyTest, udpateBodies, setIsReinjected, setBody, setBodyEdit, setBodyTest, targetId) {
    console.log(key);
    console.log(newValue);
    console.log(body);
    console.log(setBody);
    console.log(targetId);

    function update(obj) {
        if (obj.id === targetId) {
            if (obj[key] !== undefined) {
                obj[key] = newValue;
            }
        } else if (obj.children) {
            obj.children = obj.children.map(child => update(child));
        }
        return obj;
    }

    let testObj = update(deepClone(body))
    console.log(testObj);

    setBody(testObj)
}