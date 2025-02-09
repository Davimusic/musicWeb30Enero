import { connectToDatabase } from './connectToDatabase';

export default async function getCompositionsFromDb(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('compositionLibrary');

    try {
        // Obtener todos los documentos en la colección
        const compositions = await collection.find({}).toArray();

        if (compositions.length > 0) {
            return res.status(200).json({ success: true, compositions });
        } else {
            return res.status(404).json({ success: false, message: 'No se encontraron composiciones en MongoDB' });
        }
    } catch (error) {
        console.error('Error al obtener las composiciones en MongoDB:', error);
        return res.status(500).json({ error: 'Error al obtener las composiciones en MongoDB' });
    }
}
