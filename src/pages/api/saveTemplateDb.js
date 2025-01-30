import { connectToDatabase } from "./connectToDatabase";

export default async function saveTemplateDb(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('planFelipeMusical');
    const { templates } = req.body;

    try {
        // Create an update object that maintains the existing structure of the templates field
        let updateFields = {};
        for (let [key, value] of Object.entries(templates)) {
            updateFields[`templates.${key}`] = value;
        }

        // Update only the specific fields within the templates object
        const result = await collection.updateOne(
            { templates: { $exists: true } }, // Filter to update document with 'templates' field
            { $set: updateFields },
            { upsert: false } // Do not create the document if it does not exist
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ success: true, message: 'Templates guardado exitosamente en MongoDB' });
        } else {
            return res.status(404).json({ success: false, message: 'No se encontró un documento con templates existente para actualizar' });
        }
    } catch (error) {
        console.error('Error al guardar los templates en MongoDB:', error);
        return res.status(500).json({ error: 'Error al guardar los templates en MongoDB' });
    }
}











/*import { connectToDatabase } from "./connectToDatabase";

export default async function saveTemplateDb(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('planFelipeMusical');
    
    const { templates } = req.body;  // Obtenemos el objeto con la llave 'templates'

    try {
        const result = await collection.updateOne(
            {},  // Sin filtro específico
            { $set: { templates: templates } },
            { upsert: true }  // Crea el documento si no existe
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            return res.status(200).json({ success: true, message: 'Plantilla guardada exitosamente' });
        } else {
            return res.status(500).json({ success: false, message: 'No se pudo guardar la plantilla' });
        }
    } catch (error) {
        console.error('Error al guardar la plantilla en la base de datos:', error);
        return res.status(500).json({ error: 'Error al guardar la plantilla en la base de datos' });
    }
}*/

