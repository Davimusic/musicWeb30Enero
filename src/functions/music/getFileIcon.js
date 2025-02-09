export default function getFileIcon (format) {
    const icons = {
        audio: '🎵',
        video: '🎥',
        pdf: '📄',
        midi: '🎹',
        default: '📁'
    };

    if (['mp3', 'wav', 'ogg', 'aac'].includes(format)) return icons.audio;
    if (['mp4', 'mov', 'avi', 'mkv'].includes(format)) return icons.video;
    if (['pdf'].includes(format)) return icons.pdf;
    if (['mid', 'midi'].includes(format)) return icons.midi;
    return icons.default;
}
