import React from 'react';
import getFileIcon from '@/functions/music/getFileIcon';

const MidiAndPdf = ({ content, onItemClick }) => {
    console.log(content);
    


  const handleDownload = (url, filename) => {
    const attachmentUrl = url.replace('/upload/', '/upload/fl_attachment/');
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{/**no centra aun */}
      {content.map((item, index) => {
        const midiIcon = item.midi ? getFileIcon('midi') : null;
        const pdfIcon = item.pdf ? getFileIcon('pdf') : null;
        const audioIcon = item.audio ? getFileIcon('mp3') : null;
        const videoIcon = item.video ? getFileIcon('mp4') : null;

        return (
            <div key={index} style={{ marginBottom: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Icono y botón de descarga de MIDI */}
              {item.midi && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>{midiIcon}</span>
                  <img
                    src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                    alt="Descargar MIDI"
                    onClick={() => handleDownload(item.midi.src, `${item.name || 'archivo'}_midi.midi`)}
                    style={{
                      cursor: 'pointer',
                      width: '30px',
                      height: '30px',
                    }}
                  />
                </div>
              )}
              {/* Icono y botón de descarga de PDF */}
              {item.pdf && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>{pdfIcon}</span>
                  <img
                    src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                    alt="Descargar PDF"
                    onClick={() => handleDownload(item.pdf.src, `${item.name || 'archivo'}.pdf`)}
                    style={{
                      cursor: 'pointer',
                      width: '30px',
                      height: '30px',
                    }}
                  />
                </div>
              )}
              {/* Icono y botón de descarga de Audio */}
              {item.audio && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>{audioIcon}</span>
                  <img
                    src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                    alt="Descargar Audio"
                    onClick={() => handleDownload(item.audio.src, `${item.name || 'archivo'}_audio.mp3`)}
                    style={{
                      cursor: 'pointer',
                      width: '30px',
                      height: '30px',
                    }}
                  />
                </div>
              )}
              {/* Icono y botón de descarga de Video */}
              {item.video && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>{videoIcon}</span>
                  <img
                    src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                    alt="Descargar Video"
                    onClick={() => handleDownload(item.video.src, `${item.name || 'archivo'}_video.mp4`)}
                    style={{
                      cursor: 'pointer',
                      width: '30px',
                      height: '30px',
                    }}
                  />
                </div>
              )}
            </div>
          );
          
          
      })}
    </div>
  );
};

export default MidiAndPdf;





















