export default function findObjectById(obj, id) {
    //const clonedObj = JSON.parse(JSON.stringify(obj));

    function search(obj, id) {
        if (obj.id === id) {
            return obj;
        }

        if (obj.children && obj.children.length > 0) {
            for (let child of obj.children) {
                const result = search(child, id);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }

    return search({...obj}, id);
}


