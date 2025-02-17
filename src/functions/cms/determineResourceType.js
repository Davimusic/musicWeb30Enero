export default function determineResourceType(file) {
    const fileName = file.name.toLowerCase();
  
    // Primero, verificamos si es un archivo MIDI por la extensión
    if (fileName.endsWith('.mid') || fileName.endsWith('.midi')) {
      return 'midi';
    }
  
    // Luego, obtenemos el tipo MIME
    let mimeType = file.type;
  
    if (!mimeType) {
      // Si mimeType está vacío, determinar según la extensión
      if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.gif')) {
        mimeType = 'image/*';
      } else if (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.avi')) {
        mimeType = 'video/*';
      } else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.ogg')) {
        mimeType = 'audio/*';
      } else if (fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else {
        mimeType = 'unknown';
      }
    }
  
    if (mimeType.startsWith('image/')) {
      return 'image'; // Cambiado de 'imagen' a 'image'
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else if (mimeType === 'application/pdf') {
      return 'pdf';
    } else {
      return 'unsupported';
    }
  }






/*export default function determineResourceType(file) {
        const fileName = file.name.toLowerCase();

        // Primero, verificamos si es un archivo MIDI por la extensión
        if (fileName.endsWith('.mid') || fileName.endsWith('.midi')) {
        return 'midi';
        }
    
        // Luego, obtenemos el tipo MIME
        let mimeType = file.type;
    
        if (!mimeType) {
        // Si mimeType está vacío, determinar según la extensión
        if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.gif')) {
            mimeType = 'image/*';
        } else if (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.avi')) {
            mimeType = 'video/*';
        } else if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || fileName.endsWith('.ogg')) {
            mimeType = 'audio/*';
        } else if (fileName.endsWith('.pdf')) {
            mimeType = 'application/pdf';
        } else {
            mimeType = 'unknown';
        }
        }
    
        if (mimeType.startsWith('image/')) {
        return 'imagen';
        } else if (mimeType.startsWith('video/')) {
        return 'video';
        } else if (mimeType.startsWith('audio/')) {
        return 'audio';
        } else if (mimeType === 'application/pdf') {
        return 'pdf';
        } else {
        return 'unsupported';
        }
    }*/



