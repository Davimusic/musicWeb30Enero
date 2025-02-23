import React, { useEffect, useState } from 'react';
import Image from '../simple/image';
import Text from '../simple/text';
import HeartIcon from './heartIcon';
import '../../estilos/general/general.css';

const ImageAndHeart = ({ content, onItemClick }) => {
  const [items, setItems] = useState(content);

  useEffect(() => {
    setItems(content);
    console.log(content);
  }, [content]);

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
            marginBottom: '10px',
            cursor: 'pointer',
            borderRadius: '0.5em',
            paddingLeft: '10px',
            paddingRight: '10px',
            marginRight: '10px',
            marginLeft: '10px',
            paddingBottom: '10px',
            paddingTop: '10px'
          }}
          className="effectHover"
        >
          {/* Renderiza solo la imagen principal */}
          {item.imagePrincipal && (
            <Image
            className={item.imagePrincipal.className}
            style={{with: '50px', height: '40px', borderRadius: '50%' }}
            alt={item.imagePrincipal.alt}
            width={item.imagePrincipal.width}
            height={item.imagePrincipal.height}
            id={item.imagePrincipal.id}
            src={item.imagePrincipal.src}
          />
          )}
          <HeartIcon size={50} />
        </div>
      ))}
    </div>
  );
};

export default ImageAndHeart;