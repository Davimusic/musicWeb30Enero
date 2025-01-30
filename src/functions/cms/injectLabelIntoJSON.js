import deepClone from "@/functions/general/deepClone";

export default function injectLabelIntoJSON(json, items) {
    function findAndInject(node) {
        if (node.id === "ChildrenArray") {
            node.children.push(clonedItems);
        } else if (node.children) {
            node.children.forEach(child => findAndInject(child));
        }
    }

    const clonedJson = deepClone(json);
    const clonedItems = deepClone(items);
    findAndInject(clonedJson);
    return clonedJson;
}
