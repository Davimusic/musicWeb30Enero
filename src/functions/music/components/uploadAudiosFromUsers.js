import React, { useState, useEffect } from 'react';
import axios from 'axios';
import determineResourceType from '@/functions/cms/determineResourceType';

import '../../../estilos/general/general.css';
import '../../../estilos/music/UploadSamplesFromUsers.css'




export default function UploadSamplesFromUsers() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previews, setPreviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPublic, setIsPublic] = useState(false); // Por defecto privado
  const [price, setPrice] = useState(0);
  const [forSale, setForSale] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [category, setCategory] = useState('percussion'); // Valor por defecto
  const [title, setTitle] = useState("Upload Samples"); // Default title

  const path = 'exclusiveMusicForExclusivePeopleDAWSamples';


  useEffect(() => {
    console.log(sessionStorage.getItem('userEmail'))
  }, []);

  useEffect(() => {
    // This code runs only on the client side
    if (typeof window !== "undefined" && sessionStorage.getItem("userEmail") === "davipianof@gmail.com") {
      setTitle("HI DAVIS, Upload Samples to public samples");
    }
  }, []);

  // Effect to detect screen size changes
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect to generate file previews
  useEffect(() => {
    if (selectedFiles.length) {
      const newPreviews = selectedFiles.map((fileObj) => {
        const type = determineResourceType(fileObj.file);
        if (type === 'audio') {
          return URL.createObjectURL(fileObj.file);
        }
        return null;
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

  // Function to validate allowed audio formats
  const isValidAudioFormat = (file) => {
    const validExtensions = ['.mp3', '.wav', '.aiff', '.flac'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  // Function to handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validAudioFiles = files.filter(file => {
      const type = determineResourceType(file);
      return type === 'audio' && isValidAudioFormat(file);
    });

    if (validAudioFiles.length !== files.length) {
      setErrorMessage('Only audio files are allowed (MP3, WAV, AIFF, FLAC)');
      return;
    }

    const newFiles = validAudioFiles.map((file) => ({
      file,
      explanation: '',
    }));

    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setUploadSuccess('');
    setErrorMessage('');
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
        setErrorMessage('Please select at least one audio file');
        return;
    }

    if (forSale && (!isPublic || price <= 0)) {
        setErrorMessage('Samples for sale must be public and have a price > 0');
        return;
    }

    setLoading(true);
    setErrorMessage('');
    setUploadSuccess('');

    try {
        const userEmail = localStorage.getItem('userEmail') || 
                         sessionStorage.getItem('userEmail') || 
                         'davipsssianof@gmail.com';
        const isSpecialUser = userEmail.toLowerCase() === 'davipianof@gmail.com';
        const emailKey = userEmail.replace(/[@.]/g, '_');
        
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

        // Subir archivos a BunnyCDN
        const uploadPromises = selectedFiles.map(async (fileObj) => {
            try {
                const formData = new FormData();
                formData.append('emailKey', emailKey);
                formData.append('category', category);
                formData.append('timestamp', timestamp);
                formData.append('file', fileObj.file);
                formData.append('isSpecial', isSpecialUser.toString());

                const response = await fetch('/api/uploadUserAudiosToBunny', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error uploading file');
                }

                return await response.json();
            } catch (error) {
                console.error('Error uploading file:', fileObj.file.name, error);
                throw new Error(`Error uploading ${fileObj.file.name}: ${error.message}`);
            }
        });

        const uploadResults = await Promise.all(uploadPromises);
        const files = uploadResults.flatMap(result => result.files);

        // Preparar datos para MongoDB
        const sampleData = {
            description: description.trim(),
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            files: files.map(file => ({
                type: 'audio',
                url: file.url,
                storage_path: file.storagePath,
                file_name: file.fileName,
                explanatory_text: file.explanatory_text || '',
                metadata: {
                    original_name: file.fileName,
                    size: file.size || '0MB',
                    upload_date: new Date().toISOString(),
                    format: file.fileName.split('.').pop() || 'unknown'
                }
            })),
            category: category,
            configuration: {
                privacy: isSpecialUser ? 'public' : (isPublic ? 'public' : 'private'),
                license: 'creative-commons',
                forSale: isSpecialUser ? forSale : (isPublic && forSale),
                price: isSpecialUser ? price : (isPublic ? price : 0)
            },
            isSpecialUser: isSpecialUser
        };

        // Guardar en MongoDB
        const saveResponse = await fetch('/api/saveSamplesUserToMongoDb', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                sample: sampleData,
                user: { email: userEmail }
            })
        });

        const saveData = await saveResponse.json();

        if (!saveResponse.ok || !saveData.success) {
            throw new Error(saveData.message || 'Error al guardar en MongoDB');
        }

        setUploadSuccess(`Upload successful! ${files.length} sample(s) uploaded.`);
        
        // Resetear el formulario (reemplazo de resetForm())
        setSelectedFiles([]);
        setPreviews([]);
        setDescription('');
        setTags('');
        setPrice(0);
        setForSale(false);
        setIsPublic(false);

    } catch (error) {
        console.error('Error:', error);
        setErrorMessage(error.message);
    } finally {
        setLoading(false);
    }
};

  const handleExplanationChange = (index, text) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles[index].explanation = text;
    setSelectedFiles(updatedFiles);
  };

  const isMobile = windowWidth < 768;

  const styles = {
    container: {
      position: 'absolute', // Lo hace flotante sobre otros elementos
  top: 0,
  left: 0,
  width: '100vw', // Asegura que cubra todo el ancho
  height: '100vh', // Asegura que cubra toda la altura
  //padding: window.innerWidth <= 768 ? '0px' : '40px 20px', // Ajuste según tamaño
  boxSizing: 'border-box',
  fontFamily: 'Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Centrado horizontal
  justifyContent: 'center', // Centrado vertical
    },
    contentWrapper: {
      width: '100%', // Ocupa el 100% del contenedor padre
      maxWidth: '1200px', // Máximo ancho
      margin: '0 auto', // Centrado horizontal
      borderRadius: '0.7em',
      padding: isMobile ? '15px' : '25px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    title: {
      textAlign: 'center', 
      margin: '0',
      padding: '0',
      fontSize: isMobile ? '1.5rem' : '2rem',
    },
    mainContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '25px',
      flex: 1,
      width: '100%', // Ocupa el 100% del espacio disponible
      maxHeight: isMobile ? 'none' : 'calc(100vh - 200px)', // Ajusta según necesidades
      overflow: 'hidden'
    },
    formContainer: {
      flex: 1,
      padding: isMobile ? '15px' : '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
      overflowY: 'auto', // Solo scroll vertical si es necesario
      maxHeight: isMobile ? 'none' : '100%' // Ajusta al contenedor padre
    },
    
    filesContainer: {
      flex: 1,
      padding: isMobile ? '15px' : '20px',
      borderRadius: '8px',
      overflowY: 'auto',
      maxHeight: isMobile ? '80vh' : '80%', // Ajusta al contenedor padre
      border: 'none',
    },
    inputField: {
      padding: '10px', 
      marginTop: '5px', 
      fontSize: '16px', 
      border: '1px solid #ccc', 
      borderRadius: '5px',
      width: '100%',
      boxSizing: 'border-box'
    },
    textareaField: {
      padding: '10px', 
      marginTop: '5px', 
      fontSize: '16px', 
      border: '1px solid #ccc', 
      borderRadius: '5px',
      maxHeight: '50px',
      width: '100%',
      boxSizing: 'border-box',
      resize: 'vertical'
    },
    button: {
      padding: '12px 25px',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
      backgroundColor: '#4CAF50',
      transition: 'all 0.3s ease',
      width: isMobile ? '100%' : 'auto',
      margin: '5px 0',
      position: 'relative',
      overflow: 'hidden'
    },
    buttonHover: {
      backgroundColor: '#45a049',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    buttonDisabled: {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none'
    },
    buttonLoading: {
      backgroundColor: '#3e8e41'
    },
    buttonLoadingBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      width: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      animation: '$loading 1.5s infinite'
    },
    toggleButton: {
      padding: '10px 15px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.3s',
      margin: '0 5px'
    },
    toggleButtonActive: {
      backgroundColor: '#3a7bd5',
      color: 'white'
    },
    toggleButtonInactive: {
      backgroundColor: '#e0e0e0',
      color: '#333'
    },
    fileInputLabel: {
      cursor: 'pointer',
      display: 'inline-block',
      color: 'white',
      padding: '12px 25px',
      borderRadius: '5px',
      backgroundColor: '#4CAF50',
      marginBottom: '10px',
      width: isMobile ? 'auto' : 'auto',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: '#45a049',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    },
    fileInputLabelHover: {
      backgroundColor: '#45a049'
    },
    fileInfoText: {
      fontSize: '12px', 
      marginTop: '5px', 
      color: '#666',
      textAlign: 'center'
    },
    
    filesTitle: {
      marginBottom: '15px', 
      textAlign: 'center',
      fontSize: isMobile ? '1.2rem' : '1.5rem',
      
    },
    filesGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '15px'
    },
    fileCard: {
      border: '1px solid #ddd', 
      padding: '15px', 
      marginBottom: '10px',
      borderRadius: '5px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }
    },
    fileName: {
      fontWeight: 'bold',
      wordBreak: 'break-word',
      color: '#333'
    },
    audioPlayer: {
      width: '100%', 
      marginTop: '10px',
      minHeight: '40px',
      borderRadius: '5px',
      backgroundColor: '#f0f0f0'
    },
    priceInputContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginTop: '10px'
    },
    priceInput: {
      flex: 1,
      padding: '10px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '5px'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: '10px 0'
    },
    successAlert: {
      padding: '15px',
      margin: '15px 0',
      backgroundColor: '#edf7ed',
      color: '#1e4620',
      borderRadius: '4px',
      borderLeft: '5px solid #4caf50',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      animation: '$fadeIn 0.5s ease'
    },
    errorAlert: {
      padding: '15px',
      margin: '15px 0',
      backgroundColor: '#fdeded',
      color: '#5f2120',
      borderRadius: '4px',
      borderLeft: '5px solid #f44336',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      animation: '$fadeIn 0.5s ease'
    },
    alertIcon: {
      fontSize: '24px',
      flexShrink: 0
    },
    alertContent: {
      flex: 1
    },
    alertTitle: {
      fontWeight: 'bold',
      margin: '0 0 5px 0'
    },
    alertMessage: {
      margin: '0',
      fontSize: '14px'
    },
    // Añadido nuevas animaciones
    '@keyframes pulse': {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' }
    },
    '@keyframes shake': {
      '0%': { transform: 'translateX(0)' },
      '25%': { transform: 'translateX(5px)' },
      '50%': { transform: 'translateX(-5px)' },
      '75%': { transform: 'translateX(5px)' },
      '100%': { transform: 'translateX(0)' }
    },
    '@keyframes loading': {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' }
    },
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    },
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'translateY(10px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    }
  };


  return (
    <div className={'color1'} style={styles.container}>
      <div className="backgroundColor3" style={styles.contentWrapper}>
        <h2 className="color2" style={styles.title}>
          {title}
        </h2>
        <div style={styles.mainContainer}>
          <div style={styles.formContainer}>
            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Description (optional):
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your samples (optional)"
                  style={styles.textareaField}
                />
              </label>
            </div>
  
            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Category:
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.inputField}
                >
                  <option value="ambience">Ambience</option>
                  <option value="air">Wind Instruments</option>
                  <option value="bass">Bass</option>
                  <option value="bells">Bells</option>
                  <option value="brass">Brass</option>
                  <option value="choir">Choir</option>
                  <option value="drums">Drums</option>
                  <option value="ethnic">Ethnic Instruments</option>
                  <option value="fx">Effects</option>
                  <option value="guitar">Guitar</option>
                  <option value="keys">Keys</option>
                  <option value="orchestral">Orchestral</option>
                  <option value="pads">Pads</option>
                  <option value="percussion">Percussion</option>
                  <option value="plucks">Plucks</option>
                  <option value="synth">Synthetic</option>
                  <option value="strings">Strings</option>
                  <option value="textures">Textures</option>
                  <option value="vocals">Vocals</option>
                  <option value="woodwind">Woodwind</option>
                </select>
              </label>
            </div>
  
            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                Tags (comma separated):
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Example: kick, drum, 808, bass"
                  style={styles.inputField}
                />
              </label>
            </div>
  
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
  {/* Contenedor principal flexible */}
  <div style={{ 
    display: 'flex', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: '20px', 
    width: '100%',
    maxWidth: '1200px',
    padding: '20px'
  }}>
    {/* Sección de carga de archivos */}
    <div style={{ 
      flex: '1 1 400px', 
      maxWidth: '600px',
      minWidth: '300px' 
    }}>
      <div style={{ textAlign: 'center', display: 'block' }}>
        <label
          style={styles.fileInputLabel}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.fileInputLabelHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              styles.fileInputLabel.backgroundColor)
          }
        >
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".mp3,.wav,.aiff,.flac"
          />
          <span>➕ Select Sample Files</span>
        </label>
        <p style={styles.fileInfoText}>
          Allowed formats: MP3, WAV, AIFF, FLAC
        </p>
        <button
          onClick={uploadFiles}
          disabled={loading || selectedFiles.length === 0}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonLoading : {}),
            ...((loading || selectedFiles.length === 0)
              ? styles.buttonDisabled
              : {}),
            width: '100%',
            animation: uploadSuccess ? '$pulse 1.5s infinite' : 
                      errorMessage ? '$shake 0.5s' : 'none'
          }}
          onMouseOver={(e) =>
            !loading &&
            selectedFiles.length > 0 &&
            Object.assign(e.currentTarget.style, styles.buttonHover)
          }
          onMouseOut={(e) =>
            !loading &&
            selectedFiles.length > 0 &&
            (e.currentTarget.style.backgroundColor =
              styles.button.backgroundColor)
          }
        >
          {loading && <span style={styles.buttonLoadingBar}></span>}
          <span
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: '$spin 1s linear infinite'
                  }}
                ></span>
                Uploading {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}...
              </>
            ) : uploadSuccess ? (
              '✅ Upload Complete!'
            ) : errorMessage ? (
              '❌ Try Again'
            ) : (
              'Upload Samples'
            )}
          </span>
        </button>
      </div>
    </div>

    {/* Sección de configuración de visibilidad */}
    <div style={{ 
      flex: '1 1 400px', 
      maxWidth: '600px',
      minWidth: '300px' 
    }}>
      <div style={{ 
        padding: '10px', 
        width: '100%', 
        
        textAlign: 'center' 
      }}>
        <label style={{ fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '10px' }}>
          Visibility:
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              setIsPublic(false);
              setForSale(false);
            }}
            style={{
              ...styles.toggleButton,
              ...(!isPublic ? styles.toggleButtonActive : styles.toggleButtonInactive)
            }}
          >
            Private
          </button>
          <button
            onClick={() => setIsPublic(true)}
            style={{
              ...styles.toggleButton,
              ...(isPublic ? styles.toggleButtonActive : styles.toggleButtonInactive)
            }}
          >
            Public
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', textAlign: 'center' }}>
          {!isPublic
            ? 'Only you can see these samples'
            : 'All users can see these samples'}
        </p>

        {isPublic && (
          <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="forSale"
                checked={forSale}
                onChange={(e) => setForSale(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="forSale" style={{ fontWeight: 'bold', color: '#333' }}>
                Sell these samples
              </label>
            </div>

            {forSale && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <label style={{ fontWeight: 'bold', color: '#333' }}>
                  Price per download (USD):
                </label>
                <div style={styles.priceInputContainer}>
                  <span style={{ color: 'black' }}>$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Math.max(0.01, e.target.value))}
                    placeholder="0.00"
                    style={styles.priceInput}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
</div> 


  
            
  
            
  
            {errorMessage && (
              <div style={styles.errorAlert}>
                <span style={styles.alertIcon}>❌</span>
                <div style={styles.alertContent}>
                  <p style={styles.alertTitle}>Upload Failed</p>
                  <p style={styles.alertMessage}>{errorMessage}</p>
                </div>
              </div>
            )}
  
            {uploadSuccess && (
              <div style={styles.successAlert}>
                <span style={styles.alertIcon}>✅</span>
                <div style={styles.alertContent}>
                  <p style={styles.alertTitle}>Upload Successful!</p>
                  <p style={styles.alertMessage}>{uploadSuccess}</p>
                  <p
                    style={{
                      ...styles.alertMessage,
                      marginTop: '5px'
                    }}
                  >
                    Your samples are now available in your library.
                  </p>
                </div>
              </div>
            )}
          </div>
  
          {selectedFiles.length > 0 && !loading && (
            <div className='backgroundColor2' style={{borderRadius: '0.7em'}}>
              <h3 className='color2' style={styles.filesTitle}>
                Selected Samples ({selectedFiles.length})
              </h3>
              <div style={styles.filesContainer}>
                {selectedFiles.map((fileObj, index) => (
                  <div key={index} style={styles.fileCard}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>🎵</span>
                      <span style={styles.fileName}>{fileObj.file.name}</span>
                    </div>
                    {previews[index] && (
                      <audio controls style={styles.audioPlayer}>
                        <source
                          src={previews[index]}
                          type={`audio/${fileObj.file.name.split('.').pop()}`}
                        />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                    <div style={{ marginTop: '10px', flex: 1 }}>
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          fontWeight: 'bold',
                          color: '#333'
                        }}
                      >
                        Notes about this sample:
                        <textarea
                          value={fileObj.explanation}
                          onChange={(e) =>
                            handleExplanationChange(index, e.target.value)
                          }
                          placeholder="Example: 808 kick, processed with saturation, etc."
                          style={styles.textareaField}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}



