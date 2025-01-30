let API_KEY= '332683334251235'
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

export default FileBrowser;

















