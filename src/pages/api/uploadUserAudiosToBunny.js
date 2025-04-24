import { IncomingForm } from 'formidable';
import { readFileSync, unlinkSync } from 'fs';
import { createHash } from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Credenciales de Backblaze B2 (usa variables de entorno en producción)
const B2_APP_KEY_ID = '005091cccc347080000000001';
const B2_APP_KEY = 'K005Ram9N3aaH/FIIlMzEzG+tHhJDYM';
const B2_BUCKET_ID = '4019416cecdc6c2394670018'; // Bucket ID proporcionado
const B2_BUCKET_NAME = 'memoriesAppDavimusic';    // Bucket Name proporcionado

// Función para autorizar en B2
async function getB2Authorization() {
  const authString = Buffer.from(`${B2_APP_KEY_ID}:${B2_APP_KEY}`).toString('base64');
  const response = await fetch('https://api.backblaze.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`,
    },
  });
  if (!response.ok) {
    throw new Error('Error al autorizar en B2: ' + response.statusText);
  }
  // Retorna { accountId, authorizationToken, apiUrl, downloadUrl }
  return response.json();
}

// Función para obtener la URL de subida en B2
async function getB2UploadUrl(apiUrl, authToken) {
  const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: 'POST',
    headers: {
      'Authorization': authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
  });
  if (!response.ok) {
    throw new Error('Error al obtener la URL de subida: ' + response.statusText);
  }
  // Retorna { uploadUrl, authorizationToken }
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Parsear el formulario usando formidable
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    // Extraemos los campos para construir la ruta de almacenamiento
    const emailKey = Array.isArray(fields.emailKey) ? fields.emailKey[0] : fields.emailKey;
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const timestamp = Array.isArray(fields.timestamp) ? fields.timestamp[0] : fields.timestamp;
    const isSpecialUser = emailKey.includes('davipianof_gmail_com'); // Lógica personalizada si es usuario especial
    const baseFolder = isSpecialUser ? 'publicSamples' : 'userSamples';
    const folderPath = `${baseFolder}/${emailKey}/${category}/${timestamp}`;

    let filesArray = [];
    if (files.file) {
      filesArray = Array.isArray(files.file) ? files.file : [files.file];
    } else {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    // Paso 1: Autorizar en Backblaze B2 y obtener downloadUrl (para construir la URL pública)
    const b2Auth = await getB2Authorization();

    // Paso 2: Obtener la URL de subida (válida por 1 hora)
    const b2Upload = await getB2UploadUrl(b2Auth.apiUrl, b2Auth.authorizationToken);

    const uploadedFiles = [];

    // Iterar sobre cada archivo para realizar la subida a B2
    for (const file of filesArray) {
      const fileBuffer = readFileSync(file.filepath);
      const originalName = file.originalFilename;
      // Se simula la jerarquía de carpetas en el nombre final del archivo
      const finalFileName = `${folderPath}/${originalName}`;

      // Calcular el hash SHA1, necesario para la subida a B2
      const sha1 = createHash('sha1').update(fileBuffer).digest('hex');

      // Configurar un timeout para la solicitud
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000); // 5 minutos

      // Realizar la petición de subida
      const uploadResponse = await fetch(b2Upload.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': b2Upload.authorizationToken,
          // X-Bz-File-Name admite barras para simular rutas de carpetas
          'X-Bz-File-Name': encodeURIComponent(finalFileName),
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileBuffer.length,
          'X-Bz-Content-Sha1': sha1,
        },
        body: fileBuffer,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!uploadResponse.ok) {
        throw new Error(`Error al subir ${originalName}: ${uploadResponse.statusText}`);
      }

      // Eliminar el archivo temporal tras la subida
      unlinkSync(file.filepath);

      // Construir la URL pública del archivo usando el downloadUrl y el nombre del bucket
      const publicUrl = `${b2Auth.downloadUrl}/file/${B2_BUCKET_NAME}/${encodeURIComponent(finalFileName)}`;

      uploadedFiles.push({
        fileName: originalName,
        url: publicUrl,
        storagePath: folderPath,
      });
    }

    return res.status(200).json({
      success: true,
      files: uploadedFiles,
      isSpecialUser: isSpecialUser,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Error interno del servidor en B2',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}










/*import { IncomingForm } from 'formidable';
import { readFileSync, unlinkSync } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function createDirectoryHierarchy(BUNNY_ENDPOINT, BUNNY_ACCESS_KEY, folderPath) {
  const segments = folderPath.split('/');
  let currentPath = '';
  
  for (const segment of segments) {
    currentPath += segment + '/';
    try {
      const dirResponse = await fetch(
        `${BUNNY_ENDPOINT}${encodeURI(currentPath)}`,
        {
          method: 'PUT',
          headers: {
            'AccessKey': BUNNY_ACCESS_KEY,
            'Content-Type': 'application/octet-stream',
          },
          body: ''
        }
      );
      console.log(`Creando carpeta "${currentPath}": ${dirResponse.status}`);
    } catch (error) {
      console.error(`Error creando carpeta "${currentPath}":`, error);
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const BUNNY_ACCESS_KEY = '3c81aa08-a4cb-429f-9a220341daee-ef11-49a3';
  const STORAGE_ZONE = 'exclusivemusicforexclusivepeopledaw';
  const BUNNY_ENDPOINT = `https://storage.bunnycdn.com/${STORAGE_ZONE}/`;

  try {
    const form = new IncomingForm();
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    const emailKey = Array.isArray(fields.emailKey) ? fields.emailKey[0] : fields.emailKey;
    const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
    const timestamp = Array.isArray(fields.timestamp) ? fields.timestamp[0] : fields.timestamp;
    const isSpecialUser = emailKey.includes('davipianof_gmail_com'); // Puedes expandir esta lista

    // Nueva estructura de carpetas corregida
    const baseFolder = isSpecialUser ? 'publicSamples' : 'userSamples';
    const folderPath = `${baseFolder}/${emailKey}/${category}/${timestamp}`;

    await createDirectoryHierarchy(BUNNY_ENDPOINT, BUNNY_ACCESS_KEY, folderPath);

    let filesArray = [];
    if (files.file) {
      filesArray = Array.isArray(files.file) ? files.file : [files.file];
    } else {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const uploadedFiles = [];
    for (const file of filesArray) {
      const fileBuffer = readFileSync(file.filepath);
      const originalName = file.originalFilename;
      const finalFileName = `${folderPath}/${originalName}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000);

      const uploadResponse = await fetch(`${BUNNY_ENDPOINT}${encodeURI(finalFileName)}`, {
        method: 'PUT',
        headers: {
          'AccessKey': BUNNY_ACCESS_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!uploadResponse.ok) {
        throw new Error(`Error al subir ${originalName}: ${uploadResponse.statusText}`);
      }

      unlinkSync(file.filepath);

      const publicUrl = `https://${STORAGE_ZONE}.b-cdn.net/${encodeURI(finalFileName)}`;
      
      uploadedFiles.push({
        fileName: originalName,
        url: publicUrl,
        storagePath: folderPath,
      });
    }

    return res.status(200).json({
      success: true,
      files: uploadedFiles,
      isSpecialUser: isSpecialUser
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Error interno del servidor to bunny',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}*/