import React, { forwardRef } from 'react';
import MediaControl from './mediaControl';
import MenuIcon from './menuIcon';
import SearchTagInDb from './searchTag';
import DownloadIcon from './downloadIcon';
import ImageAndHeart from './imageAndHeart';
import Menu from './menu';
import '../../estilos/general/general.css';
import '../../estilos/music/fullControlMedia.css';
import ShowComponentButton from './showComponentButton';

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
    toggleComponentInUse,
    setComponentInUse,
    componentInUse,
    setShowComponent,
    showComponent,
    changeStateMenu,
    openQualityModal,
    ...restProps
  } = props;

  

  return (
    <div className="backgroundColor2 audioPlayerContent" >
      <div className="flexContainer">
        <MenuIcon onClick={changeStateMenu} />
        <div className="imageHeartContainer">
          <ImageAndHeart content={content} onItemClick={handleItemClick} />
        </div>
        <DownloadIcon size={30} isOpen={isContentVisible} onToggle={toggleContentVisibility} />
        <div className="changeModeView">
          <ShowComponentButton showComponent={showComponent} setShowComponent={setShowComponent}/>
        </div>
      </div>
      <Menu isOpen={isMenuOpen} onClose={changeStateMenu} className="backgroundColor2" />
      <div className="mediaControlContainer">
      <MediaControl ref={ref} showComponent={showComponent} setShowComponent={setShowComponent} setComponentInUse={setComponentInUse} componentInUse={componentInUse} openQualityModal={openQualityModal}   {...restProps} />
      </div>
    </div>
  );
});

FullControlMedia.displayName = 'FullControlMedia';
export default FullControlMedia;

