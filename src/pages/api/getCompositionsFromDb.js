import { connectToDatabase } from './connectToDatabase';

export default async function getCompositionsFromDb(req, res) {
    const db = await connectToDatabase();
    const collection = db.collection('compositionLibrary');
    const { tag, limit = 50 } = req.query;

    try {
        let compositions = [];

        if (tag) {
            // Agregación para filtrar composiciones por tag
            const pipeline = [
                { $unwind: "$compositions" }, // Divide el array en documentos individuales
                { 
                    $match: { 
                        "compositions.etiquetas": { 
                            $regex: tag.trim(), 
                            $options: 'i' // Búsqueda insensible a mayúsculas/minúsculas
                        } 
                    } 
                },
                { 
                    $addFields: { 
                        "esExacto": { 
                            $in: [tag.trim(), "$compositions.etiquetas"] // Marca coincidencias exactas
                        } 
                    } 
                },
                { $sort: { "esExacto": -1 } }, // Prioriza coincidencias exactas primero
                { $limit: parseInt(limit, 10) }, // Limita los resultados
                { $replaceRoot: { newRoot: "$compositions" } } // Devuelve solo el objeto de la composición
            ];

            const result = await collection.aggregate(pipeline).toArray();
            compositions = result;
        } else {
            // Si no hay tag, devolver todas las composiciones (hasta el límite)
            const parentDoc = await collection.findOne({});
            compositions = parentDoc?.compositions || [];
            compositions = compositions.slice(0, limit);
        }

        // Siempre devuelve un array, incluso si está vacío
        return res.status(200).json({ 
            success: true, 
            compositions 
        });

    } catch (error) {
        console.error('Error al obtener las composiciones:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al obtener las composiciones' 
        });
    }
}






/*import { connectToDatabase } from './connectToDatabase';

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
}*/
