import React, { forwardRef } from 'react';
import MediaControl from './mediaControl';
import MenuIcon from './menuIcon';
import SearchTagInDb from './searchTag';
import DownloadIcon from './downloadIcon';
import ImageAndHeart from './imageAndHeart';
import Menu from './menu';
import '../../estilos/general/general.css';

const FullControlMedia = forwardRef((props, ref) => {
  const {
    isMenuOpen,
    toggleMenu,
    content,
    handleItemClick,
    isContentVisible,
    toggleContentVisibility,
    tags,
    setTags,
    setContent,
    setMusicContent,
    setIsModalOpen,
    setContentModal,
    ...restProps
  } = props;

  return (
    <div className='backgroundColor2 audioPLayerContent' style={{ 
      padding: '10px', 
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: 2, 
      borderRadius: '20px',
      margin: '10px', 
      maxHeight: '80vh', 
      boxShadow: '0px -5px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <MenuIcon onClick={toggleMenu} />
        
        <div style={{ maxWidth: '30vw', overflowY: 'auto' }}>
          <ImageAndHeart content={content} onItemClick={handleItemClick} />
        </div>

        <div className="input-container backgroundColor2" onClick={(e) => e.stopPropagation()}>
          <SearchTagInDb 
            setIsModalOpen={setIsModalOpen} 
            setContentModal={setContentModal} 
            tags={tags} 
            setTags={setTags} 
            setContent={setContent} 
            setMusicContent={setMusicContent} 
          />
        </div>

        <DownloadIcon size={30} isOpen={isContentVisible} onToggle={toggleContentVisibility} />
      </div>

      <MediaControl ref={ref} {...restProps} />
      <Menu isOpen={isMenuOpen} onClose={toggleMenu} className='backgroundColor2' />
    </div>
  );
});

FullControlMedia.displayName = 'FullControlMedia';
export default FullControlMedia;