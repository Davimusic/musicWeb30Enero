import { connectToDatabase } from './connectToDatabase';

export default async function saveSamplesFromDAW(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ success: false, message: 'Método no permitido' });
        }

        const db = await connectToDatabase();
        if (!db) throw new Error("Error de conexión a la BD");
        const collection = db.collection('SamplesCollection');

        // Validación del body
        const { sample, user } = req.body;
        if (!sample || !user || !user.email) {
            return res.status(400).json({ 
                success: false,
                message: "Datos incompletos",
                required: { sample: "Object", user: { email: "String" } }
            });
        }

        const userEmail = user.email.toLowerCase();
        const isSpecialUser = userEmail === 'davipianof@gmail.com';
        const emailKey = userEmail.replace(/[@.]/g, '_');
        
        // Validación de archivos
        if (!Array.isArray(sample.files) || sample.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "El campo files debe ser un array con al menos un elemento"
            });
        }

        const now = new Date();
        const timestamp = [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, '0'),
            String(now.getDate()).padStart(2, '0'),
            '_',
            String(now.getHours()).padStart(2, '0'),
            String(now.getMinutes()).padStart(2, '0'),
            String(now.getSeconds()).padStart(2, '0')
        ].join('');

        // Construir el documento a guardar
        const sampleToSave = {
            _id: sample._id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            files: sample.files,
            description: sample.description || '',
            tags: sample.tags || [],
            category: sample.category,
            configuration: {
                privacy: isSpecialUser ? 'public' : (sample.configuration?.privacy || 'private'),
                license: 'creative-commons',
                forSale: isSpecialUser ? (sample.configuration?.forSale || false) : 
                       (sample.configuration?.privacy === 'public' && sample.configuration?.forSale),
                price: isSpecialUser ? (sample.configuration?.price || 0) : 
                     (sample.configuration?.privacy === 'public' ? sample.configuration?.price || 0 : 0)
            },
            statistics: sample.statistics || {
                views: 0, downloads: 0, plays: 0, likes: 0, shares: 0, sales: 0, earnings: 0
            },
            dates: {
                creation: now.toISOString(),
                modification: now.toISOString(),
                ...(sample.dates || {})
            },
            metadata: {
                creator: userEmail,
                file_count: sample.files.length,
                main_format: sample.files[0]?.type || 'audio',
                storage_path: sample.files[0]?.storage_path || 
                    `${isSpecialUser ? 'publicSamples' : 'userSamples'}/${emailKey}/${sample.category}/${timestamp}`,
                original_files: sample.files.map(f => ({
                    name: f.file_name,
                    url: f.url,
                    path: f.storage_path
                }))
            },
            status: 'active',
            version: sample.version || 1,
            isSpecialUser: isSpecialUser
        };

        // Operación de guardado
        const updateOperation = {
            $push: {
                [isSpecialUser 
                    ? `publicSamples.${emailKey}.${sample.category}`
                    : `userSamples.${emailKey}.${sample.category}`]: {
                    $each: [sampleToSave],
                    $position: 0
                }
            },
            $set: {
                lastUpdated: now.toISOString(),
                ...(!isSpecialUser && { [`userSamples.${emailKey}.lastUpdated`]: now.toISOString() })
            }
        };

        // Si es público (para usuarios no especiales), añadir a publicSamples también
        if (!isSpecialUser && sampleToSave.configuration.privacy === 'public') {
            updateOperation.$push[`publicSamples.${emailKey}.${sample.category}`] = {
                $each: [sampleToSave],
                $position: 0
            };
        }

        const result = await collection.updateOne(
            { _id: "samplesContainer" },
            updateOperation,
            { upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: "Sample guardado correctamente",
            sampleId: sampleToSave._id,
            storagePath: sampleToSave.metadata.storage_path,
            isSpecialUser: isSpecialUser
        });

    } catch (error) {
        console.error('Error en saveSamplesFromDAW:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}