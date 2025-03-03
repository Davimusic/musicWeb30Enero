import React, { useEffect, useState } from 'react';
import Image from '../simple/image';
import Text from '../simple/text';
import HeartIcon from './heartIcon';
import '../../estilos/general/general.css';

const ImageAndText = ({isHybridView, content, onItemClick, setIsLike, isLike, showComponent }) => {
  const [items, setItems] = useState(content);

  useEffect(() => {
    setItems(content);
    console.log(content);
  }, [content]);

  useEffect(() => {
    console.log(isHybridView);
  }, [isHybridView]);

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
  
  
  return (
    <div>
      {items.map((item, index) => (
        <div
          id={item.idObjeto}
          key={index}
          onClick={() => onItemClick(item)} // Ejecuta la función onItemClick con el item seleccionado
          style={{
            maxWidth: '100vw',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'flex-end',
            cursor: 'pointer',
            borderRadius: '0.5em',
            paddingLeft: '10px',
            paddingRight: '10px',
            paddingBottom: '10px',
            marginRight: '10px',
            marginLeft: '10px',            
          }}
          className=""//effectHover
        >
          {/* Renderiza solo la imagen principal */}
          {item.imagePrincipal && (
            <Image
              className={item.imagePrincipal.className}
              style={{ ...item.imagePrincipal.style, marginRight: '10px' }}
              alt={item.imagePrincipal.alt}
              width={item.imagePrincipal.width}
              height={item.imagePrincipal.height}
              id={item.imagePrincipal.id}
              src={item.imagePrincipal.src}
            />
          )}
          <div style={{ display: 'block' }}>
            <Text
              id={item.text.id}
              text={item.text.textTitle}
              style={{...item.text.style, color: 'white', margin: '0px'}}
              className={[`${item.text.className}`, 'title-md']}
            />
            <Text
              id={item.text.id}
              text={item.text.textDescripcion}
              style={{...item.text.style, color: 'white', margin: '5px'}}
              className={[`${item.text.className}`, 'title-xs']}
            />
          </div>
          <HeartIcon
            size={25}
            defaultLike={isLike[index].audio}//en este caso no veo necesario validar si video, ya que hasta este momento esto està solo para modo audio
            onClickFunction={()=>handleLike(index, showComponent, isLike, setIsLike, isHybridView)} // Pasar función al ícono
          />
        </div>
      ))}
    </div>
  );
};

export default ImageAndText;



