let API_KEY = '332683334251235'
let API_SECRET = 'TOCYNfFpLI-FPVM421gOYXptw9o'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import getFileIcon from '../music/getFileIcon';
import '../../estilos/general/general.css'

const FileBrowser = ({ path, onPathChange }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [foldersRes, resourcesRes] = await Promise.all([
                    axios.get('/api/cloudinary/folders', {
                        params: { prefix: path },
                        headers: { Authorization: `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}` }
                    }),
                    axios.get('/api/cloudinary/resources/auto/upload', {
                        params: { prefix: path, max_results: 100 },
                        headers: { Authorization: `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}` }
                    })
                ]);

                const folders = foldersRes.data.folders.map(folder => ({
                    ...folder,
                    type: 'folder'
                }));

                const resources = (resourcesRes.data.resources || []).map(file => ({
                    ...file,
                    type: 'file',
                    format: file.format?.toLowerCase()
                }));

                setFiles([...folders, ...resources]);
            } catch (error) {
                setError(`Error: ${error.response?.data?.message || error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [path]);

    const handleFolderClick = (folderName) => {
        const newPath = path ? `${path}/${folderName}` : folderName;
        onPathChange?.(newPath);
    };

    const handleDownload = (secureUrl, fileName) => {
        const link = document.createElement('a');
        link.href = secureUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    

    return (
        <div style={{ background: 'black', color: 'white', padding: '20px' }}>
            {loading && <p>Cargando contenido...</p>}
            {error && <p className='error'>{error}</p>}

            <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', listStyle: 'none', padding: 0 }}>
                {files.map((item) => (
                    <li key={item.type === 'folder' ? item.name : item.public_id}
                        style={{ width: '150px', textAlign: 'center' }}>
                        
                        {item.type === 'folder' ? (
                            <div onClick={() => handleFolderClick(item.name)}
                                style={{ cursor: 'pointer', padding: '10px', border: '1px solid #444', borderRadius: '8px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"
                                    fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"
                                    strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                                <div style={{ marginTop: '8px', wordBreak: 'break-word' }}>{item.name}</div>
                            </div>
                        ) : (
                            <div style={{ padding: '10px', border: '1px solid #444', borderRadius: '8px' }}>
                                <div style={{ fontSize: '2em' }}>
                                    {getFileIcon(item.format)}
                                </div>
                                <div style={{ margin: '8px 0', wordBreak: 'break-word' }}>
                                    {item.public_id.split('/').pop()}
                                </div>
                                <button 
                                    onClick={() => handleDownload(item.secure_url, item.public_id)}
                                    style={{
                                        background: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}>
                                    Descargar
                                </button>
                            </div>
                        )}
                    </li>
                ))}
                {files.length === 0 && !loading && <p>No hay contenido en esta carpeta.</p>}
            </ul>
        </div>
    );
};

export default FileBrowser;





/*let API_KEY= '332683334251235'
let API_SECRET= 'TOCYNfFpLI-FPVM421gOYXptw9o'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from '@/components/simple/selects';
import renderFile from './renderFile';
'../../estilos/general/general.css'

const FileBrowser = ({type, showControls, actionFunction, path}) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resourceType, setResourceType] = useState(type); 

    useEffect(() => {
        const fetchFiles = async () => {
            setLoading(true);
            try {
                //console.log('Fetching files with resource type:', resourceType); // Log para depuración
                const res = await axios.get(`/api/cloudinary/resources/${resourceType}/upload`, {
                    params: {
                        prefix: path,
                        max_results: 100,
                    },
                    headers: {
                        Authorization: `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`,
                    },
                });
                //console.log('Response data:', res.data); // Log para depuración
                setFiles(res.data.resources || []);//en raw por ahora SOLO guardar WORD
            } catch (error) {
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    setError(`Error: ${error.response.status} - ${error.response.data.message}`);
                } else if (error.request) {
                    console.error('Error request:', error.request);
                    setError('Error: No response received from server.');
                } else {
                    console.error('Error message:', error.message);
                    setError(`Error: ${error.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [path, resourceType]); 

    return (
        <div style={{ background: 'black' }}>
            {showControls && (
                <div className='center borders1 margin1' style={{height: '10vh', background: 'red'}}>
                    <Select id={'selectFileBrowser'} style={{}} className={[]} name={'selectFileBrowser'} value={resourceType} event={(e) => setResourceType(e.target.value)} options={['image', 'video', 'raw']}/>
                    {loading && <p>Loading...</p>}
                    {error && <p>{error}</p>}
                </div>
            )}
            <ul className='center scroll' style={{ display: 'flex', flexWrap: 'wrap', height: '80vh'}}>
                {files.length > 0 ? (
                    files.map((file) => (
                        <li className='center' key={file.public_id} style={{ margin: '10px' }}>
                            {renderFile(file, resourceType, 'holamundo', actionFunction)}
                        </li>
                    ))
                ) : (
                    <p>No files found.</p>
                )}
            </ul>
        </div>
    );
};

export default FileBrowser;*/

















