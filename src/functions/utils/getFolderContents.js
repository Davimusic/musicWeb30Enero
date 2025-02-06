import axios from 'axios';

const CLOUD_NAME = 'dplncudbq'; // Reemplaza con tu cloud name
const API_KEY = '332683334251235'; // Reemplaza con tu API key
const API_SECRET = 'TOCYNfFpLI-FPVM421gOYXptw9o'; // Reemplaza con tu API secret

const getFolderContents = async (folderPath) => {
  try {
    const response = await axios.get(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/folders`,
      {
        params: {
          type: 'upload',
          prefix: folderPath,
          max_results: 1000,
        },
        auth: {
          username: API_KEY,
          password: API_SECRET,
        },
      }
    );

    const folders = response.data.folders;
    const resources = response.data.resources;

    // Filtrar solo los archivos de audio
    const audioFiles = resources.filter((resource) =>
      resource.format === 'mp3' || resource.format === 'wav' || resource.format === 'ogg'
    );

    return {
      folders,
      audioFiles,
    };
  } catch (error) {
    console.error('Error fetching folder contents:', error);
    return {
      folders: [],
      audioFiles: [],
    };
  }
};

export default getFolderContents;