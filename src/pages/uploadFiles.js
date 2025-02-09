import React, { useState, useEffect } from 'react';
import axios from 'axios';
import renderFile from '@/functions/cms/renderFile';
import determineResourceType from '@/functions/cms/determineResourceType';

// Definimos los colores desde tu archivo general
const colors = {
  color1: '#060606',
  color2: '#0c283f',
  color3: '#1d6188',
  color4: '#2b95c8',
  color5: '#2bc6c8',
};

export default function UploadFilesToCloudinary() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previews, setPreviews] = useState([]);

  const path = 'exclusiveMusicForExclusivePeople';


function save(creation){
    fetch('/api/saveCompositionToDb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ composition: creation }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log(data.message);
          setUploadSuccess('upload objects to mongoDb')
        } else {
          console.error(data.message);
        }
      })
      .catch(error => {
        console.error('Error al guardar la composición:', error);
      });
}


  
  

  useEffect(() => {
    if (selectedFiles.length) {
      const newPreviews = selectedFiles.map((file) => {
        const type = determineResourceType(file);

        // Generar previsualizaciones para imágenes y videos
        if (type === 'image' || type === 'video') {
          return URL.createObjectURL(file);
        } else {
          return null; // No hay previsualización
        }
      });
      setPreviews(newPreviews);

      // Limpiar memoria al desmontar o cambiar archivos
      return () => {
        newPreviews.forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      };
    } else {
      setPreviews([]);
    }
  }, [selectedFiles]);

  const uploadFiles = async () => {
    if (selectedFiles.length === 0 || !title.trim()) {
      alert('Por favor, selecciona archivos y proporciona un título.');
      return;
    }

    setLoading(true);
    try {
      const date = new Date();
      const dateString = `${date.getFullYear()}${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date
        .getHours()
        .toString()
        .padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;
      const folderName = `${path}/${title.trim().replace(/\s+/g, '_')}_${dateString}`;

      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'y8peecdo');
        formData.append('folder', folderName);

        const res = await axios.post('https://api.cloudinary.com/v1_1/dplncudbq/upload', formData);

        const data = res.data;

        // Determinar el tipo del archivo aquí mismo
        const tipo = determineResourceType(file);

        return {
          tipo: tipo,
          url_cloudinary: data.secure_url,
          metadatos: {
            duracion: data.duration ? `${data.duration}s` : null,
            formato: data.format,
            tamano: `${(data.bytes / (1024 * 1024)).toFixed(2)}MB`,
          },
        };
      });

      const archivos = await Promise.all(uploadPromises);

      // Construir el objeto final
      const creation = {
        _id: Date.now(), // En un entorno real, reemplazar por ObjectId generado por la base de datos
        titulo: title.trim(),
        descripcion: description.trim(),
        etiquetas: tags.split(',').map((tag) => tag.trim()),
        archivos: archivos,
        estadisticas: {
          visitas: 0,
          descargas: 0,
          compartidos: 0,
        },
        fecha_creacion: new Date().toISOString(),
      };

      console.log('Objeto de la creación musical:', creation);
      // No mostramos el objeto en pantalla

      save(creation)

      setUploadSuccess('files uploaded');
    } catch (error) {
      console.error('Error al subir los archivos:', error);
    } finally {
      setLoading(false);
      setSelectedFiles([]);
      setPreviews([]);
      setTitle('');
      setDescription('');
      setTags('');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Acumular los nuevos archivos seleccionados
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    setUploadSuccess('');
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      audio: '🎵',
      midi: '🎹',
      video: '🎥',
      image: '🖼️',
      unsupported: '❗',
    };
    return icons[type] || '📁';
  };

  // Estilos en línea para los componentes
  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      color: colors.color1,
      fontFamily: 'Arial, sans-serif',
    },
    inputGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      fontWeight: 'bold',
      color: colors.color3,
    },
    input: {
      padding: '10px',
      marginTop: '5px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
    placeholder: {
      color: '#aaa',
    },
    uploadButton: {
      marginBottom: '20px',
      textAlign: 'center',
    },
    uploadLabel: {
      cursor: 'pointer',
      display: 'inline-block',
      backgroundColor: colors.color4,
      color: 'white',
      padding: '12px 25px',
      borderRadius: '5px',
    },
    uploadLabelHover: {
      backgroundColor: colors.color3,
    },
    filesPreview: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    fileItem: {
      border: '1px solid #ddd',
      padding: '15px',
      borderRadius: '5px',
    },
    fileInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    fileIcon: {
      fontSize: '24px',
    },
    fileName: {
      fontWeight: 'bold',
    },
    noPreview: {
      color: '#888',
      marginTop: '10px',
    },
    unsupported: {
      color: '#888',
      marginTop: '10px',
    },
    submitButton: {
      marginTop: '20px',
      padding: '12px 25px',
      backgroundColor: colors.color5,
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    submitButtonHover: {
      backgroundColor: colors.color3,
    },
    loadingMessage: {
      color: '#ff9900',
      textAlign: 'center',
      fontSize: '18px',
    },
    successMessage: {
      color: colors.color5,
      textAlign: 'center',
      fontSize: '18px',
    },
    mediaQuery: {
      '@media (maxWidth: 600px)': {
        container: {
          padding: '15px',
        },
        input: {
          fontSize: '14px',
        },
        uploadLabel: {
          padding: '10px 20px',
          fontSize: '14px',
        },
        submitButton: {
          padding: '10px 20px',
          fontSize: '14px',
        },
      },
    },
  };

  return (
    <div style={styles.container}>
      {/* Campo para el título */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>
          Título:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ingresa el título"
            style={styles.input}
          />
        </label>
      </div>
      {/* Campo para la descripción */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>
          Descripción:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe tu creación"
            style={styles.input}
          />
        </label>
      </div>
      {/* Campo para las etiquetas */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>
          Etiquetas (separadas por comas):
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ejemplo: piano, alegre, reggae"
            style={styles.input}
          />
        </label>
      </div>

      {/* Botón de carga de archivos */}
      <div style={styles.uploadButton}>
        <label
          style={styles.uploadLabel}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.color3)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.color4)}
        >
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".mid,.midi,.pdf,.mp3,.wav,.png,.jpg,.jpeg,.gif,.mp4,.mov,.avi"
          />
          <span>➕ Seleccionar Archivos</span>
        </label>
      </div>

      {selectedFiles.length > 0 && !loading && (
        <div style={styles.filesPreview}>
          {selectedFiles.map((file, index) => {
            const tipo = determineResourceType(file);
            return (
              <div key={index} style={styles.fileItem}>
                <div style={styles.fileInfo}>
                  <span style={styles.fileIcon}>{getFileIcon(tipo)}</span>
                  <span style={styles.fileName}>{file.name}</span>
                </div>

                {/* Mostrar previsualización si está disponible */}
                {previews[index] && renderFile(
                  { secure_url: previews[index] },
                  tipo,
                  file.name,
                  () => console.log('Archivo clickeado')
                )}

                {/* Si no hay previsualización, mostrar mensaje */}
                {!previews[index] && <p style={styles.noPreview}>Previsualización no disponible.</p>}

                {tipo === 'unsupported' && (
                  <p style={styles.unsupported}>Tipo de archivo no soportado</p>
                )}
              </div>
            );
          })}

          <button
            onClick={uploadFiles}
            style={styles.submitButton}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.color3)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.color5)}
          >
            Subir Todos los Archivos
          </button>
        </div>
      )}

      {loading && <p style={styles.loadingMessage}>Subiendo archivos...</p>}
      {uploadSuccess != '' && <p style={styles.successMessage}>{uploadSuccess}</p>}
    </div>
  );
}


