import { connectToDatabase } from "./connectToDatabase";

export default async function getTemplates(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('planFelipeMusical');

    try {
        // Encuentra el documento que contiene el campo 'templates'
        const document = await collection.findOne({ templates: { $exists: true } });

        if (document) {
            return res.status(200).json({ success: true, templates: document.templates });
        } else {
            return res.status(404).json({ success: false, message: 'No se encontró un documento con templates' });
        }
    } catch (error) {
        console.error('Error al obtener los templates de MongoDB:', error);
        return res.status(500).json({ error: 'Error al obtener los templates de MongoDB' });
    }
}
