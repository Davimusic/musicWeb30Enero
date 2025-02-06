import React, { useEffect, useState } from 'react';
import Image from '../simple/image';
import Text from '../simple/text';

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
            style={item.image.style}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            id={item.image.id}
            src={item.image.src}
          />
          <Text
            id={item.text.id}
            text={item.text.text}
            style={item.text.style}
            className={item.text.className}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageAndText;