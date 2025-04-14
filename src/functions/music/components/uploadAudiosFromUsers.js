import React, { useState, useEffect } from 'react';
import axios from 'axios';
import determineResourceType from '@/functions/cms/determineResourceType';
import Select from '@/components/complex/select';
import InternetStatus from '@/components/complex/internetStatus';
import Modal from '@/components/complex/modal';
import CustomNumberInput from '@/components/complex/customNumberInput';

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
  const [modalContent, setModalContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  const path = 'exclusiveMusicForExclusivePeopleDAWSamples';


  useEffect(() => {
    console.log(localStorage.getItem('userEmail'))
  }, []);

  useEffect(() => {
    // This code runs only on the client side
    if (typeof window !== "undefined" && localStorage.getItem("userEmail") === "davipianof@gmail.com") {
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
        const userEmail = localStorage.getItem('userEmail') || 'davipsssianof@gmail.com';
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
        console.log({ 
          sample: sampleData,
          user: { email: userEmail }
      });
        
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
      position: 'fixed', // Lo hace flotante sobre otros elementos
  top: 0,
  left: 0,
  width: '100%', // Asegura que cubra todo el ancho
  //height: '100%', // Asegura que cubra toda la altura
  //padding: window.innerWidth <= 768 ? '0px' : '40px 20px', // Ajuste según tamaño
  boxSizing: 'border-box',
  fontFamily: 'Arial, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center', // Centrado horizontal
  justifyContent: 'center', // Centrado vertical
  //backgroundColor: 'red'
  height: '100vh',
      overflow: 'auto'
    },
    contentWrapper: {
      width: '100%', // Ocupa el 100% del contenedor padre
      maxWidth: '1200px', // Máximo ancho
      margin: '20px', // Centrado horizontal
      borderRadius: '0.7em',
      padding: isMobile ? '15px' : '25px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh'
      
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
      //overflow: 'hidden'
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
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: '#ff4444',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '5px',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s',
      '&:hover': {
        backgroundColor: '#ffebee',
        transform: 'scale(1.1)'
      }
    },
    textArea: {
      resize: 'none', // Desactiva la redimensión manual
    }
  };

  
  return (
    <div className="color1 upload-container">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} children={modalContent} />
      <InternetStatus setModalContent={setModalContent} setIsModalOpen={setIsModalOpen} />
      
      <div className="backgroundColor3 content-wrapper">
        <h2 className="color2 backgroundColor3 upload-title">{title}</h2>
        
        <div className="main-container">
          <div className="form-container">
            <div className="form-field">
              <label className="form-label">
                Description (optional):
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your samples (optional)"
                  className="textarea-field text-area"
                />
              </label>
            </div>
  
            <div className="form-field">
              <label className="form-label">
                Category:
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                ><option value="ambience">Ambience</option>
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
  
            <div className="form-field">
              <label className="form-label">
                Tags (comma separated):
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Example: kick, drum, 808, bass"
                  className="input-field"
                />
              </label>
            </div>
  
            <div className="upload-sections">
              <div className="upload-section">
                <div className="file-upload-wrapper">
                  <label className="file-input-label">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden-input"
                      accept=".mp3,.wav,.aiff,.flac"
                    />
                    <span>➕ Select Sample Files</span>
                  </label>
                  <p className="file-info">Allowed formats: MP3, WAV, AIFF, FLAC</p>
                  <button
                    onClick={uploadFiles}
                    disabled={loading || selectedFiles.length === 0}
                    className={`upload-button 
                      ${loading ? 'button-loading' : ''} 
                      ${uploadSuccess ? 'pulse-animation' : ''}
                      ${errorMessage ? 'shake-animation' : ''}`}
                  >
                    {loading && <span className="loading-bar"></span>}
                    <span className="button-content">
                      {loading ? (
                        <>
                          <span className="loading-spinner"></span>
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
  
              <div className="visibility-section">
                <div className="visibility-controls">
                  <label className="visibility-label">Visibility:</label>
                  <div className="toggle-buttons">
                    <button
                      onClick={() => {
                        setIsPublic(false);
                        setForSale(false);
                      }}
                      className={`toggle-button ${!isPublic ? 'toggle-active' : 'toggle-inactive'}`}
                    >
                      Private
                    </button>
                    <button
                      onClick={() => setIsPublic(true)}
                      className={`toggle-button ${isPublic ? 'toggle-active' : 'toggle-inactive'}`}
                    >
                      Public
                    </button>
                  </div>
                  <p className="visibility-description">
                    {!isPublic ? 'Only you can see these samples' : 'All users can see these samples'}
                  </p>
  
                  {isPublic && (
                    <div className="sale-options">
                      <div className="sale-toggle">
                        <input
                          type="checkbox"
                          id="forSale"
                          checked={forSale}
                          onChange={(e) => setForSale(e.target.checked)}
                          className="sale-checkbox"
                        />
                        <label htmlFor="forSale" className="sale-label">
                          Sell these samples
                        </label>
                      </div>
  
                      {forSale && (
                        <div className="price-control">
                          <label className="price-label">Price per download (USD):</label>
                          <div className="price-input-wrapper">
                            <span className="currency">$</span>
                            <input
                              style={{marginTop: '10px'}}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={price}
                              onChange={(e) => setPrice(Math.max(0.01, e.target.value))}
                              placeholder="0.00"
                              className="price-input"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
  
            {errorMessage && (
              <div className="alert error-alert">
                <span className="alert-icon">❌</span>
                <div className="alert-text">
                  <p className="alert-title">Upload Failed</p>
                  <p className="alert-message">{errorMessage}</p>
                </div>
              </div>
            )}
  
            {uploadSuccess && (
              <div className="alert success-alert">
                <span className="alert-icon">✅</span>
                <div className="alert-text">
                  <p className="alert-title">Upload Successful!</p>
                  <p className="alert-message">{uploadSuccess}</p>
                  <p className="alert-additional">Your samples are now available in your library.</p>
                </div>
              </div>
            )}
          </div>
  
          {selectedFiles.length > 0 && !loading && (
            <div className="selected-files backgroundColor2">
              <h3 className="color2  backgroundColor2 files-title">Selected Samples ({selectedFiles.length})</h3>
              <div className="files-grid">
                {selectedFiles.map((fileObj, index) => (
                  <div key={index} className="file-card">
                    <div className="file-header">
                      <div className="file-info">
                        <span className="file-icon">🎵</span>
                        <span className="file-name">{fileObj.file.name}</span>
                      </div>
                      <button
                         onClick={() => {
                          const updatedFiles = [...selectedFiles];
                          updatedFiles.splice(index, 1);
                          setSelectedFiles(updatedFiles);
                          
                          const updatedPreviews = [...previews];
                          URL.revokeObjectURL(updatedPreviews[index]);
                          updatedPreviews.splice(index, 1);
                          setPreviews(updatedPreviews);
                        }}
                        className="remove-button"
                        title="Remove this file"
                      >
                        ×
                      </button>
                    </div>
                    {previews[index] && (
                      <audio controls className="audio-preview">
                        <source
                          src={previews[index]}
                          type={`audio/${fileObj.file.name.split('.').pop()}`}
                        />
                      </audio>
                    )}
                    <div className="file-notes">
                      <label className="notes-label">
                        Notes about this sample:
                        <textarea
                          value={fileObj.explanation}
                          onChange={(e) => handleExplanationChange(index, e.target.value)}
                          placeholder="Example: 808 kick, processed with saturation, etc."
                          className="notes-textarea text-area"
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



