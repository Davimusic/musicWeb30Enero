export default async function saveTemplate(bodyTest, route, objectMolds, setObjectMoldsDb, objectMoldsDb, setIsModalOpen, setModalContent, setObjectMoldsInUse) {
    const body = JSON.parse(bodyTest);
    setIsModalOpen(true)

    for (let u = 0; u < objectMolds.length; u++) {
        if (objectMolds[u] === route) {
            return alert('nombre de template ya existente, cambialo por otro');
        }
    }
    setModalContent('uploading file......')
    try {
        const response = await fetch('/api/saveTemplateDb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                templates: { 
                    [route]: body 
                }
            })
        });

        if (!response.ok) {
            setModalContent(`HTTP error! status: ${response.status}`)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const cloneObjectMoldsDb = {...objectMoldsDb}
        cloneObjectMoldsDb[route] = body
        setObjectMoldsDb(cloneObjectMoldsDb)
        console.log(`saveTemplate: ${route}, guardado exitosamente: ${result}`);
        setIsModalOpen(false)
        setObjectMoldsInUse(route)
    } catch (error) {
        console.error('Error:', error);
    }
}