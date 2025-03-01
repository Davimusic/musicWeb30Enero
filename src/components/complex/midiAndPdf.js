import React from 'react';
import getFileIcon from '@/functions/music/getFileIcon';
import Text from '../simple/text';
import '../../estilos/general/general.css';
import DownloadIcon from './downloadIcon';

const MidiAndPdf = ({ content, onItemClick }) => {
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
    <div className='color2 title-md' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* Renderizar el audio principal */}
      {content.audioPrincipal && (
        <div className='backgroundColor4' style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px', padding: '10px', borderRadius: '5px' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>{getFileIcon('mp3')}</span>
          <DownloadIcon
            onClick={() => handleDownload(content.audioPrincipal.src, `${content.text?.textTitle || 'archivo'}_audio_principal.mp3`)}
          />
          <Text text={content.audioPrincipal.informationFile} />
        </div>
      )}

      {/* Renderizar el video principal */}
      {content.videoPrincipal && (
        <div className='backgroundColor4' style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', marginRight: '20px', padding: '10px', borderRadius: '5px' }}>
          <span style={{ fontSize: '24px', marginRight: '10px' }}>{getFileIcon('mp4')}</span>
          <DownloadIcon
            onClick={() => handleDownload(content.videoPrincipal.src, `${content.text?.textTitle || 'archivo'}_video_principal.mp4`)}
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
            <DownloadIcon
              onClick={() => handleDownload(midi.src, `${content.text?.textTitle || 'archivo'}_midi_${midiIndex}.midi`)}
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
            <DownloadIcon
              onClick={() => handleDownload(pdf.src, `${content.text?.textTitle || 'archivo'}_pdf_${pdfIndex}.pdf`)}
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
            <DownloadIcon
              onClick={() => handleDownload(audio.src, `${content.text?.textTitle || 'archivo'}_audio_${audioIndex}.mp3`)}
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
            <DownloadIcon
              onClick={() => handleDownload(video.src, `${content.text?.textTitle || 'archivo'}_video_${videoIndex}.mp4`)}
            />
            <Text text={video.informationFile} />
          </div>
        );
      })}
    </div>
  );
};

export default MidiAndPdf;






