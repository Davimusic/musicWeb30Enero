import React from 'react';
//import { searchTagInDb } from '@/functions/music/searchTagInDb';
import Audio from '../simple/audio';
import Video from '../simple/video';
import Modal from './modal';
import ImageAndText from './imageAndText';
import SearchTagInDb from './searchTag';

const FullScreenMedia = ({
  showComponent,
  content,
  musicContent,
  dynamicHeight,
  isFirstTimeLoading,
  setIsFirstTimeLoading,
  setIsLoading,
  isModalOpen,
  setIsModalOpen,
  modalContent,
  tags,
  setTags,
  setContent,
  setMusicContent,
  setContentModal,
  commonProps,
  handleItemClick,
  setCurrentTimeMedia,
  setIsLike,
  isLike,
  isHybridView
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999
    }}>
      {/* Componente SearchTagInDb en la parte superior */}
      <div className="search-tag-container">
        <SearchTagInDb
          setIsModalOpen={setIsModalOpen}
          setContentModal={setContentModal}
          tags={tags}
          setTags={setTags}
          setContent={setContent}
          setMusicContent={setMusicContent}
          setCurrentTimeMedia={setCurrentTimeMedia}
          showComponent={showComponent}
        />
      </div>

      {/* Componente de música/video */}
      <div className='music-container backgroundColor1'>
        {showComponent === 'audio' && content[0]?.audioPrincipal?.src && (
          <>
            {content[0]?.imagePrincipal?.src && (
              <div className='background-blur' style={{ backgroundImage: `url(${content[0].imagePrincipal.src})` }}>
                <div className='background-overlay' />
              </div>
            )}
            <div className='content-list spaceTopOnlyPhone'>
              <div className='content-list-inner' style={{ height: dynamicHeight }}>
                <ImageAndText setContentModal={setContentModal} setIsModalOpen={setIsModalOpen} isHybridView={isHybridView} content={musicContent} onItemClick={handleItemClick} setIsLike={setIsLike} isLike={isLike} showComponent={showComponent}/>
              </div>
            </div>
            <Audio
              src={content[0].audioPrincipal.src}
              {...commonProps}
              isFirstTimeLoading={isFirstTimeLoading}
              setIsFirstTimeLoading={setIsFirstTimeLoading}
              setIsLike={setIsLike}
              isLike={isLike}
            />
          </>
        )}

        {showComponent === 'video' && content[0]?.videoPrincipal?.src && (
          <Video
            src={content[0].videoPrincipal.src}
            {...commonProps}
            setIsLoading={setIsLoading}
            isVideoFullScreen={false}
            isEndendVideo={false}
            setIsModalOpen={setIsModalOpen}
            isModalOpen={isModalOpen}
            content={content}
            handleItemClick={handleItemClick}
            setIsLike={setIsLike}
            isLike={isLike}
          />
        )}

        {isModalOpen && (
          <Modal isOpen={true} onClose={() => setIsModalOpen(false)} children={modalContent} className={'backgroundColor3'} />
        )}
      </div>
    </div>
  );
};

export default FullScreenMedia;