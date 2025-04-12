export default function determineResourceType(file) {
  const fileName = file.name.toLowerCase();
  
  // Primero verificamos los formatos de audio permitidos
  const audioExtensions = ['.mp3', '.wav', '.aiff', '.flac'];
  const isAudio = audioExtensions.some(ext => fileName.endsWith(ext));
  
  if (isAudio) {
      return 'audio';
  }
  
  // Mantenemos el resto de la lógica original para otros tipos de archivos
  if (fileName.endsWith('.mid') || fileName.endsWith('.midi')) {
      return 'midi';
  }
  
  let mimeType = file.type;
  
  if (!mimeType) {
      if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.gif')) {
          mimeType = 'image/*';
      } else if (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.avi')) {
          mimeType = 'video/*';
      } else if (fileName.endsWith('.pdf')) {
          mimeType = 'application/pdf';
      } else {
          mimeType = 'unknown';
      }
  }
  
  if (mimeType.startsWith('image/')) {
      return 'image';
  } else if (mimeType.startsWith('video/')) {
      return 'video';
  } else if (mimeType.startsWith('audio/')) {
      return 'audio';
  } else if (mimeType === 'application/pdf') {
      return 'pdf';
  }
  
  return 'unsupported';
}






