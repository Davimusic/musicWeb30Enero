import React, { useEffect, useState } from 'react';
import Image from '../simple/image';
import Text from '../simple/text';
import HeartIcon from './heartIcon';
import '../../estilos/general/general.css'

const ImageAndText = ({ content, onItemClick }) => {
  const [items, setItems] = useState(content);

  useEffect(() => {
    setItems(content);
    console.log(content);
  }, [content]);

  return (
    <div>
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => onItemClick(item)} // Ejecuta la función onItemClick con el item seleccionado
          style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '10px', cursor: 'pointer' }}
        >
          <Image
            className={item.image.className}
            style={{ ...item.image.style, marginRight: '10px'}} 
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            id={item.image.id}
            src={item.image.src}
          />
          <div style={{display: 'block'}}>
            <Text
              id={item.text.id}
              text={item.text.textTitle}
              style={item.text.style}
              className={[`${item.text.className}`, 'title-lg']}
            />
            <Text
              id={item.text.id}
              text={item.text.textDescripcion}
              style={item.text.style}
              className={[`${item.text.className}`, 'title-sm']}
            />
          </div>
          <HeartIcon size={45}/>
        </div>
      ))}
    </div>
  );
};

export default ImageAndText;