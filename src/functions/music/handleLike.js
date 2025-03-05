const handleLike = (index, showComponent, isLike, setIsLike, isHybridView) => {
    const newLikes = [...isLike];
    if (isHybridView) {
      // Si está en modo híbrido, cambia tanto el audio como el video
      newLikes[index].audio = !newLikes[index].audio;
      newLikes[index].video = !newLikes[index].video;
    } else {
      // Si no está en modo híbrido, cambia solo el componente actual (audio o video)
      if (showComponent === 'audio') {
        newLikes[index].audio = !newLikes[index].audio;
      } else if (showComponent === 'video') {
        newLikes[index].video = !newLikes[index].video;
      }
    }
    setIsLike(newLikes);
};

export default handleLike;
