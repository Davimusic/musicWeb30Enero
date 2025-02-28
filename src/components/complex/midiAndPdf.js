import React from 'react';
import getFileIcon from '@/functions/music/getFileIcon';
import Text from '../simple/text';
import '../../estilos/general/general.css'

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* Renderizar el audio principal */}
      {content.audioPrincipal && (
        <div className='backgroundColor4' style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px', padding: '10px', borderRadius: '5px' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>{getFileIcon('mp3')}</span>
          <img
            src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
            alt="Descargar Audio Principal"
            onClick={() => handleDownload(content.audioPrincipal.src, `${content.text?.textTitle || 'archivo'}_audio_principal.mp3`)}
            style={{
              cursor: 'pointer',
              width: '30px',
              height: '30px',
            }}
          />
          <Text text={content.audioPrincipal.informationFile} />
        </div>
      )}

      {/* Renderizar el video principal */}
      {content.videoPrincipal && (
        <div className='backgroundColor4' style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px', padding: '10px', borderRadius: '5px' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>{getFileIcon('mp4')}</span>
          <img
            src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
            alt="Descargar Video Principal"
            onClick={() => handleDownload(content.videoPrincipal.src, `${content.text?.textTitle || 'archivo'}_video_principal.mp4`)}
            style={{
              cursor: 'pointer',
              width: '30px',
              height: '30px',
            }}
          />
          <Text text={content.videoPrincipal.informationFile} />
        </div>
      )}

      {/* Renderizar todos los archivos MIDI */}
      {content.midi && content.midi.map((midi, midiIndex) => {
        const midiIcon = getFileIcon('midi');
        return (
          <div key={midiIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>{midiIcon}</span>
            <img
              src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
              alt="Descargar MIDI"
              onClick={() => handleDownload(midi.src, `${content.text?.textTitle || 'archivo'}_midi_${midiIndex}.midi`)}
              style={{
                cursor: 'pointer',
                width: '30px',
                height: '30px',
              }}
            />
            <Text text={midi.informationFile} />
          </div>
        );
      })}

      {/* Renderizar todos los archivos PDF */}
      {content.pdf && content.pdf.map((pdf, pdfIndex) => {
        const pdfIcon = getFileIcon('pdf');
        return (
          <div key={pdfIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>{pdfIcon}</span>
            <img
              src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
              alt="Descargar PDF"
              onClick={() => handleDownload(pdf.src, `${content.text?.textTitle || 'archivo'}_pdf_${pdfIndex}.pdf`)}
              style={{
                cursor: 'pointer',
                width: '30px',
                height: '30px',
              }}
            />
            <Text text={pdf.informationFile} />
          </div>
        );
      })}

      {/* Renderizar todos los archivos de Audio */}
      {content.audio && content.audio.map((audio, audioIndex) => {
        const audioIcon = getFileIcon('mp3');
        return (
          <div key={audioIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>{audioIcon}</span>
            <img
              src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
              alt="Descargar Audio"
              onClick={() => handleDownload(audio.src, `${content.text?.textTitle || 'archivo'}_audio_${audioIndex}.mp3`)}
              style={{
                cursor: 'pointer',
                width: '30px',
                height: '30px',
              }}
            />
            <Text text={audio.informationFile} />
          </div>
        );
      })}

      {/* Renderizar todos los archivos de Video */}
      {content.video && content.video.map((video, videoIndex) => {
        const videoIcon = getFileIcon('mp4');
        return (
          <div key={videoIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
            <span style={{ fontSize: '24px', marginRight: '10px' }}>{videoIcon}</span>
            <img
              src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
              alt="Descargar Video"
              onClick={() => handleDownload(video.src, `${content.text?.textTitle || 'archivo'}_video_${videoIndex}.mp4`)}
              style={{
                cursor: 'pointer',
                width: '30px',
                height: '30px',
              }}
            />
            <Text text={video.informationFile} />
          </div>
        );
      })}
    </div>
  );
};

export default MidiAndPdf;






/*import React from 'react';
import getFileIcon from '@/functions/music/getFileIcon';
import Text from '../simple/text';

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {content.map((item, index) => (
        <div key={index} style={{ marginBottom: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {item.midi && item.midi.map((midi, midiIndex) => {
            const midiIcon = getFileIcon('midi');
            return (
              <div key={midiIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>{midiIcon}</span>
                <img
                  src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                  alt="Descargar MIDI"
                  onClick={() => handleDownload(midi.src, `${item.name || 'archivo'}_midi_${midiIndex}.midi`)}
                  style={{
                    cursor: 'pointer',
                    width: '30px',
                    height: '30px',
                  }}
                />
                <Text text={midi.informationFile} />
              </div>
            );
          })}

         
          {item.pdf && item.pdf.map((pdf, pdfIndex) => {
            const pdfIcon = getFileIcon('pdf');
            return (
              <div key={pdfIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>{pdfIcon}</span>
                <img
                  src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                  alt="Descargar PDF"
                  onClick={() => handleDownload(pdf.src, `${item.name || 'archivo'}_pdf_${pdfIndex}.pdf`)}
                  style={{
                    cursor: 'pointer',
                    width: '30px',
                    height: '30px',
                  }}
                />
                <Text text={pdf.informationFile} />
              </div>
            );
          })}

          
          {item.audio && item.audio.map((audio, audioIndex) => {
            const audioIcon = getFileIcon('mp3');
            return (
              <div key={audioIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>{audioIcon}</span>
                <img
                  src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                  alt="Descargar Audio"
                  onClick={() => handleDownload(audio.src, `${item.name || 'archivo'}_audio_${audioIndex}.mp3`)}
                  style={{
                    cursor: 'pointer',
                    width: '30px',
                    height: '30px',
                  }}
                />
                <Text text={audio.informationFile} />
              </div>
            );
          })}

          
          {item.video && item.video.map((video, videoIndex) => {
            const videoIcon = getFileIcon('mp4');
            return (
              <div key={videoIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px' }}>
                <span style={{ fontSize: '24px', marginRight: '10px' }}>{videoIcon}</span>
                <img
                  src="https://res.cloudinary.com/dplncudbq/image/upload/v1739120779/exclusiveMusicForExclusivePeopleExternalFiles/download_lchcos.png"
                  alt="Descargar Video"
                  onClick={() => handleDownload(video.src, `${item.name || 'archivo'}_video_${videoIndex}.mp4`)}
                  style={{
                    cursor: 'pointer',
                    width: '30px',
                    height: '30px',
                  }}
                />
                <Text text={video.informationFile} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MidiAndPdf;*/





















