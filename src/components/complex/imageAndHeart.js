import React, { useEffect, useState } from 'react';
import Image from '../simple/image';
import HeartIcon from './heartIcon';
import '../../estilos/general/general.css';
import handleLike from '@/functions/music/handleLike';

const ImageAndHeart = ({isHybridView, content, onItemClick = () => {}, currentIndex, setIsLike, isLike, showComponent}) => { // Default function
  const [items, setItems] = useState(content);

  useEffect(() => {
    setItems(content);
  }, [content]);


  return (
    <div>
      {items.map((item, index) => (
        <div
          id={item.idObjeto}
          key={index}
          onClick={() => onItemClick(item)} // Avoid direct execution
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            margin: '10px',
            gap: '10px',
          }}
        >
          {/* Imagen perfectamente circular */}
          {item.imagePrincipal && (
            <Image
              className={item.imagePrincipal.className}
              style={{
                height: '40px',
                width: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
              alt={item.imagePrincipal.alt}
              id={item.imagePrincipal.id}
              src={item.imagePrincipal.src}
            />
          )}
          {/* Ícono del corazón */}
          <HeartIcon
            size={20}
            style={{
              height: '20px',
              width: '20px',
              borderRadius: '50%',
            }}
            defaultLike={
              showComponent === 'audio' 
                ? (isLike[currentIndex] ? isLike[currentIndex].audio : false) 
                : (isLike[currentIndex] ? isLike[currentIndex].video : false)
            }
            onClickFunction={()=> handleLike(currentIndex, showComponent, isLike, setIsLike, isHybridView)} // Pasar función al ícono
          />
        </div>
      ))}
    </div>
  );
};

export default ImageAndHeart;


