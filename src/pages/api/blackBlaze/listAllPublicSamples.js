// Archivo: pages/api/audio/listAllFiles.js

// Credenciales de Backblaze B2 (usa variables de entorno en producción)
const B2_APP_KEY_ID = '005091cccc347080000000001';
const B2_APP_KEY = 'K005Ram9N3aaH/FIIlMzEzG+tHhJDYM';
const B2_BUCKET_ID = '4019416cecdc6c2394670018';
const B2_BUCKET_NAME = 'memoriesAppDavimusic';

// Función para autorizar en B2
async function getB2Authorization() {
  const authString = Buffer.from(`${B2_APP_KEY_ID}:${B2_APP_KEY}`).toString('base64');
  const response = await fetch('https://api.backblaze.com/b2api/v2/b2_authorize_account', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authString}`
    },
  });
  if (!response.ok) {
    throw new Error(`Error en b2_authorize_account: ${response.statusText}`);
  }
  return response.json();
}

// Función para obtener autorización de descarga para un prefijo dado
async function getDownloadAuthorization(prefix, validDurationInSeconds = 3600) {
  const b2Auth = await getB2Authorization();
  const response = await fetch(`${b2Auth.apiUrl}/b2api/v2/b2_get_download_authorization`, {
    method: 'POST',
    headers: {
      'Authorization': b2Auth.authorizationToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bucketId: B2_BUCKET_ID,
      fileNamePrefix: prefix, // La autorización cubrirá todos los archivos que inicien con este prefijo
      validDurationInSeconds: validDurationInSeconds,
    })
  });
  if (!response.ok) {
    throw new Error(`Error en b2_get_download_authorization: ${response.statusText}`);
  }
  const authData = await response.json();
  return {
    downloadUrl: b2Auth.downloadUrl,
    authorizationToken: authData.authorizationToken,
  };
}

// Función para listar archivos desde B2 usando un prefix
async function listB2Files(prefix = '') {
  const b2Auth = await getB2Authorization();
  const response = await fetch(`${b2Auth.apiUrl}/b2api/v2/b2_list_file_names`, {
    method: 'POST',
    headers: {
      'Authorization': b2Auth.authorizationToken,
      'Content-Type': 'application/json',
    },
    // Usamos un prefix vacío para traer todos los archivos. 
    // Nota: maxFileCount limita la cantidad de archivos (ajusta según tus necesidades)
    body: JSON.stringify({
      bucketId: B2_BUCKET_ID,
      prefix: prefix,
      maxFileCount: 1000,
    }),
  });
  if (!response.ok) {
    throw new Error(`Error en b2_list_file_names: ${response.statusText}`);
  }
  return response.json();
}

// Endpoint principal: lista y agrupa los archivos por carpeta
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Método no permitido" });
  }
  
  try {
    // Listamos todos los archivos del bucket
    const listData = await listB2Files('');
    const files = listData.files || [];

    // Agrupar archivos por carpeta (usamos la parte del path hasta el último slash)
    const groupedFiles = {};
    files.forEach(file => {
      const folder = file.fileName.substring(0, file.fileName.lastIndexOf('/'));
      if (!groupedFiles[folder]) {
        groupedFiles[folder] = [];
      }
      groupedFiles[folder].push(file);
    });

    // Para cada grupo, generamos la URL firmada usando la carpeta como prefijo
    const groupedFilesWithAuth = {};
    for (const [folder, filesInFolder] of Object.entries(groupedFiles)) {
      const authDetails = await getDownloadAuthorization(folder, 3600); // Token válido por 1 hora
      groupedFilesWithAuth[folder] = filesInFolder.map(file => {
        const encodedFileName = encodeURIComponent(file.fileName);
        const signedUrl = `${authDetails.downloadUrl}/file/${B2_BUCKET_NAME}/${encodedFileName}?Authorization=${authDetails.authorizationToken}`;
        // Retornamos la información del archivo junto con su URL firmada
        return {
          fileName: file.fileName,
          contentLength: file.contentLength,
          uploadTimestamp: file.uploadTimestamp,
          signedUrl,
        };
      });
    }

    return res.status(200).json({ success: true, groups: groupedFilesWithAuth });
  } catch (error) {
    console.error("Error al listar y agrupar archivos:", error);
    return res.status(500).json({ error: error.message });
  }
}
