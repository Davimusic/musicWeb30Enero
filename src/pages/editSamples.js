import ImageSlider from "@/components/complex/imageSlider";

export default function Home() {
  const images = [
    "https://res.cloudinary.com/dplncudbq/image/upload/v1740088605/exclusiveMusicForExclusivePeople/tik5d_20250220_165649/xahzj2sgmlra6u7cnhhb.jpg",
    "https://res.cloudinary.com/dplncudbq/image/upload/v1740088487/exclusiveMusicForExclusivePeople/tik3_20250220_165447/u7orq2vc0pwiewoxiagi.jpg",
    "https://res.cloudinary.com/dplncudbq/image/upload/v1739834151/exclusiveMusicForExclusivePeople/saul_20250217_181549/bhir7pnxzcdt0tomyjcj.png",
  ];

  return (
    <div style={{width: '100vw', height: '100vh'}}>
      otra infohghghghg
      hghghg
      ghghgg
      <div style={{width: '100%', height: '90%'}}>
      <ImageSlider
  images={images}
  showControls={true}
  controls={{
    showPrevious: true,
    showPlayPause: true,
    showNext: true,
    showShuffle: true,
    showEffects: true
  }}
/>

      </div>
    </div>
  );
}






/*import React, { useState, useEffect } from 'react';

const FileGroupsDisplay = () => {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/blackBlaze/listAllPublicSamples');
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setGroups(data.groups);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  if (loading) return <div>Cargando archivos...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Grupos de Archivos</h1>
      {Object.entries(groups).map(([folderPath, files]) => (
        <div
          key={folderPath}
          style={{
            marginBottom: '2rem',
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '4px'
          }}
        >
          <h2>{folderPath}</h2>
          {files.map(file => (
            <div key={file.fileName} style={{ marginBottom: '1rem' }}>
              <p>
                <strong>
                  {file.fileName.split('/').pop()} 
                </strong> ({file.contentLength} bytes)
              </p>
              <audio controls src={file.signedUrl}>
                Tu navegador no soporta el elemento de audio.
              </audio>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FileGroupsDisplay;*/
