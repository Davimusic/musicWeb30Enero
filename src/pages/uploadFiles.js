import React, { useState, useEffect } from 'react';
import axios from 'axios';
import renderFile from '@/functions/cms/renderFile';
import determineResourceType from '@/functions/cms/determineResourceType';
import '../estilos/general/general.css';

export default function UploadFilesToCloudinary() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previews, setPreviews] = useState([]);
  const [isDesktop, setIsDesktop] = useState(false); // Inicialmente false

  const path = 'exclusiveMusicForExclusivePeople';

  // Efecto para detectar cambios en el tamaño de la pantalla
  useEffect(() => {
    // Verificar si estamos en el cliente antes de acceder a `window`
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsDesktop(window.innerWidth >= 768);
      };

      // Establecer el valor inicial de `isDesktop`
      handleResize();

      // Escuchar cambios en el tamaño de la pantalla
      window.addEventListener('resize', handleResize);

      // Limpiar el evento al desmontar el componente
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  function save(creation) {
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
          setUploadSuccess('upload objects to mongoDb');
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
      const newPreviews = selectedFiles.map((fileObj) => {
        const type = determineResourceType(fileObj.file);

        if (type === 'image' || type === 'video') {
          return URL.createObjectURL(fileObj.file);
        } else {
          return null;
        }
      });
      setPreviews(newPreviews);

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

      const uploadPromises = selectedFiles.map(async (fileObj) => {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('upload_preset', 'y8peecdo');
        formData.append('folder', folderName);

        const res = await axios.post('https://api.cloudinary.com/v1_1/dplncudbq/upload', formData);

        const data = res.data;

        const tipo = determineResourceType(fileObj.file);

        return {
          tipo: tipo,
          url_cloudinary: data.secure_url,
          texto_explicativo: fileObj.explicacion,
          metadatos: {
            duracion: data.duration ? `${data.duration}s` : null,
            formato: data.format,
            tamano: `${(data.bytes / (1024 * 1024)).toFixed(2)}MB`,
          },
        };
      });

      const archivos = await Promise.all(uploadPromises);

      const creation = {
        _id: Date.now(),
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

      save(creation);

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
    const newFiles = files.map(file => ({
      file,
      explicacion: ''
    }));
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadSuccess('');
  };

  const handleExplanationChange = (index, text) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles[index].explicacion = text;
    setSelectedFiles(updatedFiles);
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

  // Estilos responsivos
  const containerStyles = {
    display: 'flex',
    flexDirection: isDesktop ? 'row' : 'column', // Cambia la dirección según el tamaño de la pantalla
    gap: '20px',
    width: '100%',
    maxWidth: '1200px',
    padding: '20px',
  };

  const formContainerStyles = {
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    flex: isDesktop ? 1 : 'none', // Ajusta el flex en pantallas grandes
    marginRight: isDesktop ? '20px' : '0', // Margen derecho solo en pantallas grandes
  };

  const filesContainerStyles = {
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto',
    maxHeight: '70vh',
    flex: isDesktop ? 1 : 'none', // Ajusta el flex en pantallas grandes
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
      className='backgroundColor1'
    >
      <div className='backgroundColor2' style={{ ...containerStyles, borderRadius: '0.7em' }}>
        {/* Formulario (izquierda en pantallas grandes) */}
        <div style={{ ...formContainerStyles, border: '1px solid white' }}>
          <button
            onClick={uploadFiles}
            style={{ marginTop: '20px', marginBottom: '20px', padding: '12px 25px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', backgroundColor: '#4CAF50' }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
          >
            Subir Todos los Archivos
          </button>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
              Título:
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa el título"
                style={{ padding: '10px', marginTop: '5px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
              Descripción:
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu creación"
                style={{ padding: '10px', marginTop: '5px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
              Etiquetas (separadas por comas):
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ejemplo: piano, alegre, reggae"
                style={{ padding: '10px', marginTop: '5px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <label
              style={{ cursor: 'pointer', display: 'inline-block', color: 'white', padding: '12px 25px', borderRadius: '5px', backgroundColor: '#4CAF50' }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#45a049')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#4CAF50')}
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
        </div>

        {/* Archivos seleccionados (derecha en pantallas grandes) */}
        {selectedFiles.length > 0 && !loading && (
          <div style={filesContainerStyles}>
            {selectedFiles.map((fileObj, index) => {
              const tipo = determineResourceType(fileObj.file);
              return (
                <div key={index} style={{ border: '1px solid white', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{getFileIcon(tipo)}</span>
                    <span style={{ fontWeight: 'bold' }}>{fileObj.file.name}</span>
                  </div>

                  {previews[index] && renderFile(
                    { secure_url: previews[index] },
                    tipo,
                    fileObj.file.name,
                    () => console.log('Archivo clickeado')
                  )}

                  {!previews[index] && <p style={{ color: '#888', marginTop: '10px' }}>Previsualización no disponible.</p>}

                  {tipo === 'unsupported' && (
                    <p style={{ color: '#888', marginTop: '10px' }}>Tipo de archivo no soportado</p>
                  )}

                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
                      Explicación:
                      <textarea
                        value={fileObj.explicacion}
                        onChange={(e) => handleExplanationChange(index, e.target.value)}
                        placeholder="Explica este archivo"
                        style={{ padding: '10px', marginTop: '5px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && <p style={{ textAlign: 'center', fontSize: '18px', color: '#333' }}>Subiendo archivos...</p>}
        {uploadSuccess !== '' && <p style={{ textAlign: 'center', fontSize: '18px', color: '#4CAF50' }}>{uploadSuccess}</p>}
      </div>
    </div>
  );
}


/*import React, { useState, useEffect } from 'react';
import axios from 'axios';
import renderFile from '@/functions/cms/renderFile';
import determineResourceType from '@/functions/cms/determineResourceType';
import '../estilos/general/general.css';

export default function UploadFilesToCloudinary() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previews, setPreviews] = useState([]);

  const path = 'exclusiveMusicForExclusivePeople';

  function save(creation) {
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
          setUploadSuccess('upload objects to mongoDb');
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

        if (type === 'image' || type === 'video') {
          return URL.createObjectURL(file);
        } else {
          return null;
        }
      });
      setPreviews(newPreviews);

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

      const creation = {
        _id: Date.now(),
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

      save(creation);

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

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Ocupa el 100% de la altura de la ventana
        backgroundColor: '#f0f0f0', // Fondo opcional para mejor visualización
      }}
    >
      <div
        className="color1 backgroundColor1"
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Sombra opcional para mejor visualización
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <label className="color3" style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
            Título:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título"
              style={{ padding: '10px', marginTop: '5px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label className="color3" style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
            Descripción:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu creación"
              style={{ padding: '10px', marginTop: '5px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label className="color3" style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
            Etiquetas (separadas por comas):
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ejemplo: piano, alegre, reggae"
              style={{ padding: '10px', marginTop: '5px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label
            className="backgroundColor4"
            style={{ cursor: 'pointer', display: 'inline-block', color: 'white', padding: '12px 25px', borderRadius: '5px' }}
            onMouseOver={(e) => (e.currentTarget.className = 'backgroundColor3')}
            onMouseOut={(e) => (e.currentTarget.className = 'backgroundColor4')}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {selectedFiles.map((file, index) => {
              const tipo = determineResourceType(file);
              return (
                <div key={index} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{getFileIcon(tipo)}</span>
                    <span style={{ fontWeight: 'bold' }}>{file.name}</span>
                  </div>

                  {previews[index] && renderFile(
                    { secure_url: previews[index] },
                    tipo,
                    file.name,
                    () => console.log('Archivo clickeado')
                  )}

                  {!previews[index] && <p style={{ color: '#888', marginTop: '10px' }}>Previsualización no disponible.</p>}

                  {tipo === 'unsupported' && (
                    <p style={{ color: '#888', marginTop: '10px' }}>Tipo de archivo no soportado</p>
                  )}
                </div>
              );
            })}

            <button
              className="backgroundColor5"
              onClick={uploadFiles}
              style={{ marginTop: '20px', padding: '12px 25px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              onMouseOver={(e) => (e.currentTarget.className = 'backgroundColor3')}
              onMouseOut={(e) => (e.currentTarget.className = 'backgroundColor5')}
            >
              Subir Todos los Archivos
            </button>
          </div>
        )}

        {loading && <p className="color3" style={{ textAlign: 'center', fontSize: '18px' }}>Subiendo archivos...</p>}
        {uploadSuccess !== '' && <p className="color5" style={{ textAlign: 'center', fontSize: '18px' }}>{uploadSuccess}</p>}
      </div>
    </div>
  );
}*/




