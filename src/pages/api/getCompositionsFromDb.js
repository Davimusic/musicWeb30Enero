import { connectToDatabase } from './connectToDatabase';
import { ObjectId } from 'mongodb'; // Importar ObjectId para buscar por _id

export default async function getCompositionsFromDb(req, res) {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('compositionLibrary');
        const { id, globalCollections, tag } = req.query; // Recibir parámetros
        let idsInDb = []; // Para almacenar los IDs usados en la iteración

        // 1. Buscar el documento padre por su _id
        const parentDoc = await collection.findOne({ 
            _id: new ObjectId("67a68d1126d41de2377d138d") // Usar el _id del documento padre
        });

        if (!parentDoc) {
            return res.status(404).json({ 
                success: false, 
                error: "Documento padre no encontrado" 
            });
        }

        // 2. Extraer las composiciones y globalCollections del documento padre
        const compositions = parentDoc.compositions || [];
        const globalCollectionsData = parentDoc.globalCollections || {};

        // 3. Validar el tipo de búsqueda
        if (id) {
            // Búsqueda por ID
            const searchId = parseFloat(id); // Convertir a double

            // Buscar la composición por _id
            const specificComposition = compositions.find(comp => {
                const compId = parseFloat(comp._id); // Convertir a double
                idsInDb.push(compId); // Guardar los IDs usados en la iteración
                return compId === searchId; // Comparar como doubles
            });

            // Devolver resultado
            return res.status(200).json({ 
                success: true, 
                compositions: specificComposition ? [specificComposition] : [],
                id: searchId, // ID buscado (convertido a double)
                idsInDb, // IDs usados en la iteración
                compositionsDb: compositions, // Todas las composiciones
                parentDoc: parentDoc.compositions // Compositions del documento padre
            });
        } else if (globalCollections) {
            // Búsqueda por globalCollections
            const collectionIds = globalCollectionsData[globalCollections]; // Obtener el arreglo de IDs

            if (!collectionIds || !Array.isArray(collectionIds)) {
                return res.status(404).json({ 
                    success: false, 
                    error: `No se encontró la colección global: ${globalCollections}` 
                });
            }

            // Buscar los objetos completos que coincidan con los IDs
            const collectionCompositions = compositions.filter(comp => 
                collectionIds.includes(comp._id.toString()) // Comparar como strings
            );

            // Devolver el resultado de la búsqueda en globalCollections
            return res.status(200).json({ 
                success: true, 
                compositions: collectionCompositions, // Objetos completos
                globalCollectionsData // Todas las colecciones globales (opcional)
            });
        } else if (tag) {
            // Búsqueda por etiquetas (tags)
            const tagToSearch = tag.toLowerCase(); // Convertir a minúsculas para hacer la búsqueda insensible a mayúsculas

            // Buscar las composiciones que contengan la etiqueta
            const compositionsWithTag = compositions.filter(comp => {
                if (comp.etiquetas && Array.isArray(comp.etiquetas)) {
                    return comp.etiquetas.some(etiqueta => 
                        etiqueta.toLowerCase() === tagToSearch // Comparar etiquetas
                    );
                }
                return false; // Si no hay etiquetas, ignorar la composición
            });

            // Devolver el resultado de la búsqueda por etiquetas
            return res.status(200).json({ 
                success: true, 
                compositions: compositionsWithTag, // Objetos completos que coinciden con la etiqueta
                tag: tagToSearch // Etiqueta buscada
            });
        } else {
            // Si no se proporciona ni id, ni globalCollections, ni tag, devolver todas las composiciones
            return res.status(200).json({ 
                success: true, 
                compositions, // Todas las composiciones
                globalCollectionsData // Todas las colecciones globales
            });
        }

    } catch (error) {
        console.error('Error en getCompositionsFromDb:', error);
        return res.status(500).json({ 
            success: false, 
            error: "Error en el servidor",
            details: error.message 
        });
    }
}




















/*import { connectToDatabase } from './connectToDatabase';
import { ObjectId } from 'mongodb'; // Importar ObjectId para buscar por _id

export default async function getCompositionsFromDb(req, res) {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('compositionLibrary');
        const { id } = req.query;
        let idsInDb = []; // Para almacenar los IDs usados en la iteración

        // 1. Buscar el documento padre por su _id
        const parentDoc = await collection.findOne({ 
            _id: new ObjectId("67a68d1126d41de2377d138d") // Usar el _id del documento padre
        });

        if (!parentDoc) {
            return res.status(404).json({ 
                success: false, 
                error: "Documento padre no encontrado" 
            });
        }

        // 2. Extraer las composiciones del documento padre
        const compositions = parentDoc.compositions || [];

        // 3. Si no hay ID, devolver todas las composiciones
        if (!id) {
            return res.status(200).json({ 
                success: true, 
                compositions 
            });
        }

        // 4. Convertir el ID buscado a double
        const searchId = parseFloat(id); // Convertir a double

        // 5. Buscar la composición por _id
        const specificComposition = compositions.find(comp => {
            const compId = parseFloat(comp._id); // Convertir a double
            idsInDb.push(compId); // Guardar los IDs usados en la iteración
            return compId === searchId; // Comparar como doubles
        });

        // 6. Devolver resultado con los IDs comparados
        return res.status(200).json({ 
            success: true, 
            compositions: specificComposition ? [specificComposition] : [],
            id: searchId, // ID buscado (convertido a double)
            idsInDb, // IDs usados en la iteración
            compositionsDb: compositions, // Todas las composiciones
            parentDoc: parentDoc.compositions // Compositions del documento padre
        });

    } catch (error) {
        console.error('Error en getCompositionsFromDb:', error);
        return res.status(500).json({ 
            success: false, 
            error: "Error en el servidor",
            details: error.message 
        });
    }
}*/








