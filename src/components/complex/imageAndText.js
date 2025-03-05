import React, { useEffect, useState } from 'react';
import Image from '../simple/image';
import Text from '../simple/text';
import HeartIcon from './heartIcon';
import '../../estilos/general/general.css';
import handleLike from '@/functions/music/handleLike';
import ShareIcon from './shareIcon';
import generateShareableLink from '@/functions/music/generateShareableLink';
import ShareComponent from './shareComponent';

const ImageAndText = ({setContentModal, setIsModalOpen, isHybridView, content, onItemClick, setIsLike, isLike, showComponent }) => {
  const [items, setItems] = useState(content);

  useEffect(() => {
    setItems(content);
    console.log(content);
  }, [content]);

  useEffect(() => {
    console.log(isHybridView);
  }, [isHybridView]);

  function share(link){
    setContentModal(<ShareComponent link={link}/>)
    setIsModalOpen(true)
  }

  return (
    <div>
      {items.map((item, index) => (
        <div
          id={item.idObjeto}
          key={index}
          onClick={() => onItemClick(item)}
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
          className="" // effectHover
        >
          {/* Contenedor para alinear todo a la izquierda */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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

            <div style={{ display: 'block', flexGrow: 1 }}>
              <Text
                id={item.text.id}
                text={item.text.textTitle}
                style={{ ...item.text.style, color: 'white', margin: '0px' }}
                className={[`${item.text.className}`, 'title-md']}
              />
              <Text
                id={item.text.id}
                text={item.text.textDescripcion}
                style={{ ...item.text.style, color: 'white', margin: '5px' }}
                className={[`${item.text.className}`, 'title-xs']}
              />
            </div>

            {/* Contenedor para los íconos */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShareIcon size={25} onClick={()=>share(generateShareableLink('music', item.idObjeto, {type: 'audio', quality: 'low'}))} />
              <HeartIcon
                size={25}
                defaultLike={isLike[index].audio ? isLike[index].audio : false}
                onClickFunction={() => handleLike(index, showComponent, isLike, setIsLike, isHybridView)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageAndText;



