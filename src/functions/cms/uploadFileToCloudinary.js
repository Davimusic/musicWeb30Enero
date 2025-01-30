import React, { useState } from 'react';
import axios from 'axios';
import renderFile from './renderFile'; 
import determineResourceType from './determineResourceType';

export default function UploadFileToCloudinary({path}) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [resourceType, setResourceType] = useState(null);

    const uploadFile = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', 'y8peecdo');
        formData.append('folder', path);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/dplncudbq/upload`,
                formData
            );
            console.log(res.data);
            console.log(res.data['url']);
            setUploadSuccess(true);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setLoading(false);
            setSelectedFile(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setResourceType(determineResourceType(file));
        setUploadSuccess(false);
    };

    return (
        <div>
            <label className="imagenSubirArchivos" style={{ display: loading ? 'none' : 'flex', backgroundImage: 'url("https://res.cloudinary.com/dplncudbq/image/upload/v1729718949/upload_rqmafo.png")' }}>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {selectedFile && !loading && (
                <div>
                    {resourceType !== 'unsupported' && renderFile(
                        {
                            secure_url: URL.createObjectURL(selectedFile),
                            public_id: selectedFile.name
                        }, 
                        resourceType, 
                        '', 
                        () => console.log('File clicked')
                    )}
                    {resourceType === 'unsupported' && <p>Unsupported file type</p>}
                    <button onClick={uploadFile}>Upload</button>
                </div>
            )}
            {loading && <p>Uploading...</p>}
            {uploadSuccess && <p>Upload successful!</p>}
        </div>
    );
}



