const determineResourceType = (file) => {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
        return 'image';
    } else if (fileType.startsWith('video/')) {
        return 'video';
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return 'raw';
    } else {
        return 'unsupported';
    }
};

export default determineResourceType