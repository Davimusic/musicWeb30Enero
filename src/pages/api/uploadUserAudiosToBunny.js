import { IncomingForm } from 'formidable';
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
}