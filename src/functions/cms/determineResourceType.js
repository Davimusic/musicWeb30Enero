export default function renderFile(file, resourceType, altText, onClick) {
    switch (resourceType) {
        case 'image':
            return <img 
                src={file.secure_url} 
                alt={altText} 
                onClick={onClick}
                style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}
            />;
            
        case 'video':
            return <video 
                controls 
                src={file.secure_url} 
                onClick={onClick}
                style={{ maxWidth: '300px', marginTop: '10px' }}
            />;
            
        case 'audio':
        case 'midi':
            return <audio 
                controls 
                src={file.secure_url} 
                style={{ marginTop: '10px' }}
            />;
            
        case 'pdf':
            return (
                <div style={{ marginTop: '10px' }}>
                    <a
                        href={file.secure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'white' }}
                    >
                        Ver PDF
                    </a>
                </div>
            );
            
        default:
            return null;
    }
}


/*const determineResourceType = (file) => {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
        return 'image';
    } else if (fileType.startsWith('video/')) {
        return 'video';
    } else if (fileType === 'audio/midi' || fileType === 'audio/x-midi') {
        return 'midi';
    } else if (fileType.startsWith('audio/')) {
        return 'audio';
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return 'raw';
    } else if (fileType === 'application/pdf') {
        return 'pdf';
    } else {
        return 'unsupported';
    }
};

export default determineResourceType;*/
