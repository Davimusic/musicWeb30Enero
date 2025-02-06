// pages/cloudinary.js
import { useEffect, useState } from 'react';

export default function CloudinaryFiles() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const CLOUD_NAME = 'dplncudbq';
    const API_KEY = '967637722784383';
    const API_SECRET = 'DAJulhm_AbPcXbjF4O_ScGqjkLY';

    const fetchFiles = async () => {
      try {
        const timestamp = Math.floor(Date.now() / 1000); // Timestamp en segundos
        
        // Generar firma correctamente (parámetros ordenados alfabéticamente)
        const stringToSign = `max_results=30&timestamp=${timestamp}${API_SECRET}`;
        
        const signature = await crypto.subtle.digest(
          'SHA-1',
          new TextEncoder().encode(stringToSign)
        );
        
        const hexSignature = Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Hacer la petición con parámetros necesarios
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?` +
          new URLSearchParams({
            api_key: API_KEY,
            timestamp: timestamp,
            signature: hexSignature,
            max_results: 30
          })
        );
        
        const data = await response.json();
        setFiles(data.resources || []);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h1>Archivos en Cloudinary</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {files.map(file => (
          <img
            key={file.public_id}
            src={file.secure_url}
            alt={file.public_id}
            style={{ width: '100%', height: '200px', objectFit: 'cover' }}
          />
        ))}
      </div>
    </div>
  );
}