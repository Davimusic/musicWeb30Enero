import axios from 'axios';

const CLOUD_NAME = 'dplncudbq'; // Reemplaza con tu cloud name
const API_KEY = "967637722784383"; // Reemplaza con tu API key
const API_SECRET = 'DAJulhm_AbPcXbjF4O_ScGqjkLY'; // Reemplaza con tu API secret

export default async function cloudinaryReadOnly(req, res) {
  const { folderPath } = req.query;

  if (!folderPath) {
    return res.status(400).json({ error: 'folderPath is required' });
  }

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

    res.status(200).json({ folders, audioFiles });
  } catch (error) {
    console.error('Error fetching folder contents:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch folder contents' });
  }
}