import { connectToDatabase } from './connectToDatabase';

export default async function saveCompositionToDb(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('compositionLibrary');
    const { composition } = req.body;

    try {
        // Agregar el nuevo objeto de composición al final del arreglo en el documento correspondiente
        const result = await collection.updateOne(
            {}, // Filtro para actualizar cualquier documento en la colección (puedes ajustar según tus necesidades)
            { $push: { compositions: composition } },
            { upsert: true } // Crear el documento si no existe
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ success: true, message: 'Composición guardada exitosamente en MongoDB' });
        } else {
            return res.status(404).json({ success: false, message: 'No se encontró un documento para actualizar' });
        }
    } catch (error) {
        console.error('Error al guardar la composición en MongoDB:', error);
        return res.status(500).json({ error: 'Error al guardar la composición en MongoDB' });
    }
}
