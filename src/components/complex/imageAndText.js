import React, { useEffect, useState } from 'react';
import Image from '../simple/image';
import Text from '../simple/text';
import HeartIcon from './heartIcon';
import '../../estilos/general/general.css';

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
          <HeartIcon size={45} />
        </div>
      ))}
    </div>
  );
};

export default ImageAndText;



/**
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
    <div >
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => onItemClick(item)} // Ejecuta la función onItemClick con el item seleccionado
          style={{maxWidth: '100vw',scrollbarWidth: 'none', msOverflowStyle: 'none', overflow: 'auto', display: 'flex', alignItems: 'flex-end', marginBottom: '10px', cursor: 'pointer', borderRadius: '0.5em' }}
          className='effectHover'
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
              className={[`${item.text.className}`, 'title-md']}
            />
            <Text
              id={item.text.id}
              text={item.text.textDescripcion}
              style={item.text.style}
              className={[`${item.text.className}`, 'title-xs']}
            />
          </div>
          <HeartIcon size={45}/>
        </div>
      ))}
    </div>
  );
};

export default ImageAndText;
 */