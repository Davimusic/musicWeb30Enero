const updateBody = (setBody, id, newProperties) => {
    setBody(prevBody => {
        const updateElementById = (element) => {
            if (element.id === id) {
                const updatedElement = { ...element };

                // Iterar sobre las nuevas propiedades y actualizar el objeto
                for (const key in newProperties) {
                    if (newProperties.hasOwnProperty(key)) {
                        if (typeof newProperties[key] === 'object' && !Array.isArray(newProperties[key])) {
                            updatedElement[key] = {
                                ...element[key],
                                ...newProperties[key]
                            };
                        } else {
                            updatedElement[key] = newProperties[key];
                        }
                    }
                }

                return updatedElement;
            }

            if (element.children && Array.isArray(element.children)) {
                return {
                    ...element,
                    children: element.children.map(updateElementById)
                };
            }

            return element;
        };

        return updateElementById(prevBody);
    });
};

export default updateBody;

