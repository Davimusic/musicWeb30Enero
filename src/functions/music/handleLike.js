import checkUserName from "./checkUserName";

const handleLike = (index, showComponent, isLike, setIsLike, isHybridView) => {
  checkUserName((userName) => {
      console.log(`El nombre de usuario es: ${userName}`);
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
  },
    () => {
      console.log("No se encontró un nombre de usuario.");
      alert('logea si quiwres')
    }
    );
    
};

export default handleLike;
