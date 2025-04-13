import { connectToDatabase } from './connectToDatabase';

export default async function saveSamplesFromDAW(req, res) {
  let collectionRef; // Variable global para la colección, para usar en el catch en caso de error
  try {
    // 1. Validar método HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Método no permitido'
      });
    }

    // 2. Conectar a MongoDB
    const db = await connectToDatabase();
    if (!db) throw new Error("Error de conexión a la base de datos");
    collectionRef = db.collection('SamplesCollection');

    // 3. Validar datos de entrada
    const { sample, user } = req.body;
    if (!sample || !user || !user.email) {
      return res.status(400).json({
        success: false,
        message: "Datos incompletos",
        requiredFields: {
          sample: {
            files: "Array",
            category: "String",
            configuration: "Object"
          },
          user: {
            email: "String"
          }
        }
      });
    }

    // 4. Procesar datos del usuario y determinar la raíz en la estructura
    const userEmail = user.email.toLowerCase();
    const isSpecialUser = (userEmail === 'davipianof@gmail.com');
    const rootField = isSpecialUser ? 'publicSamples' : 'userSamples';
    const emailKey = userEmail.replace(/[@.]/g, '_');
    const now = new Date();

    // 5. Validar archivos adjuntos
    if (!Array.isArray(sample.files) || sample.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar al menos un archivo válido"
      });
    }

    // 6. Crear timestamp key (formato: YYYYMMDD_HHmmss)
    const timestampKey = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      '_',
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
    ].join('');

    // 7. Construir objeto sample
    const sampleToSave = {
      _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      files: sample.files,
      description: sample.description || '',
      tags: Array.isArray(sample.tags) ? sample.tags : [],
      category: sample.category,
      configuration: sample.configuration,
      statistics: {
        views: 0,
        downloads: 0,
        plays: 0,
        likes: 0,
        shares: 0,
        sales: 0,
        earnings: 0
      },
      dates: {
        creation: now.toISOString(),
        modification: now.toISOString()
      },
      metadata: {
        creator: userEmail,
        file_count: sample.files.length,
        main_format: sample.files[0]?.type || 'audio',
        storage_path: sample.files[0]?.storage_path ||
          `${rootField}/${emailKey}/${sample.category}/${timestampKey}`,
        original_files: sample.files.map(f => ({
          name: f.file_name,
          url: f.url,
          path: f.storage_path
        }))
      },
      status: 'active',
      version: 1
    };

    // 8. Leer el documento existente o inicializarlo
    let existingDocument = await collectionRef.findOne({ _id: "samplesContainer" });
    if (!existingDocument) {
      existingDocument = {
        _id: "samplesContainer",
        [rootField]: {},
        lastUpdated: now.toISOString()
      };
    }

    // 9. Asegurar que la estructura esté inicializada en la raíz correspondiente (publicSamples o userSamples)
    if (!existingDocument[rootField]) existingDocument[rootField] = {};
    if (!existingDocument[rootField][emailKey]) existingDocument[rootField][emailKey] = {};
    if (!existingDocument[rootField][emailKey][sample.category]) {
      existingDocument[rootField][emailKey][sample.category] = {};
    }

    // 10. Agregar el nuevo sample en la ruta correspondiente 
    existingDocument[rootField][emailKey][sample.category][timestampKey] = sampleToSave;
    existingDocument[rootField][emailKey].lastUpdated = now.toISOString();
    existingDocument.lastUpdated = now.toISOString();

    // 11. Guardar la estructura completa actualizada en MongoDB
    const result = await collectionRef.replaceOne(
      { _id: "samplesContainer" },
      existingDocument,
      { upsert: true }
    );

    // 12. Verificar resultado y responder
    if (!result.acknowledged) {
      throw new Error("La operación no fue reconocida por MongoDB");
    }
    return res.status(200).json({
      success: true,
      message: "Sample guardado correctamente",
      sampleId: sampleToSave._id,
      storagePath: sampleToSave.metadata.storage_path,
      timestampKey,
      mongoResult: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      }
    });
  } catch (error) {
    console.error('Error en saveSamplesFromDAW:', error);
    return res.status(500).json({
      success: false,
      message: collectionRef ? `Colección usada: ${collectionRef.collectionName}` : "Colección no definida",
      error: error.message,
      errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}






/**
{
    "_id": "samplesContainer",  // ID fijo del documento contenedor
    "publicSamples": { ... },   // Muestras públicas organizadas por usuario
    "userSamples": { ... },     // Muestras privadas organizadas por usuario
    "lastUpdated": "ISO_DATE"   // Última actualización global
}
    {
    "[emailKey]": {  // Ej: "davipianof_gmail_com"
        "[category]": {  // Ej: "percussion", "guitar", "orchestral"
            "[timestamp]": {  // Ej: "20250413_154542" (YYYYMMDD_HHmmss)
                // Sample completo (detallado abajo)
            },
            // Más timestamps...
        },
        "lastUpdated": "ISO_DATE"  // Última actualización del usuario
    }
    // Más usuarios...
}
{
    "_id": "1744576164807-t73ns9n3n",  // ID único (timestamp + random)
    "files": [
        {
            "type": "audio",
            "url": "https://.../sample.wav",
            "storage_path": "publicSamples/...",
            "file_name": "sample.wav",
            "explanatory_text": "",
            "metadata": {
                "original_name": "sample.wav",
                "size": "5.2MB",
                "upload_date": "ISO_DATE",
                "format": "wav"
            }
        }
        // Más archivos...
    ],
    "description": "Descripción opcional",
    "tags": ["tag1", "tag2"],  // Array de tags
    "category": "percussion",   // Categoría principal
    "configuration": {
        "privacy": "public",    // "public"|"private"
        "license": "creative-commons",  // Tipo de licencia
        "forSale": false,       // Disponible para venta
        "price": 0              // Precio en centavos
    },
    "statistics": {
        "views": 0,
        "downloads": 0,
        "plays": 0,
        "likes": 0,
        "shares": 0,
        "sales": 0,
        "earnings": 0
    },
    "dates": {
        "creation": "ISO_DATE",  // Fecha creación
        "modification": "ISO_DATE"  // Fecha modificación
    },
    "metadata": {
        "creator": "user@email.com",
        "file_count": 1,
        "main_format": "audio",
        "storage_path": "ruta/completa/en/storage",
        "original_files": [
            {
                "name": "sample.wav",
                "url": "https://...",
                "path": "ruta/relativa"
            }
        ]
    },
    "status": "active",  // "active"|"archived"|"deleted"
    "version": 1,        // Versión del schema
    "isSpecialUser": false  // Si tiene privilegios especiales
}


 */



/*import { connectToDatabase } from './connectToDatabase';

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
            message: 'Error interno del servidor to mongoDb',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}*/