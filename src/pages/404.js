import React from 'react';
import MainLogo from '@/components/complex/mainLogo';
import '../estilos/general/general.css';
import '../estilos/music/music.css'
import RotatingContentLoader from '@/components/complex/rotatingContentLoader';
import BackgroundGeneric from '@/components/complex/backgroundGeneric';



const messages = [
  <div>Explore new melodies on your journey...</div>,
  <div>Uncover hidden harmonies within...</div>,
  <div>Let your creativity flow like a river of sound...</div>,
  <div>Compose your next masterpiece...</div>,
  <div>Find inspiration in every beat...</div>,
  <div>Unlock the music within you...</div>,
  <div>Transform thoughts into beautiful notes...</div>,
  <div>Feel the rhythm of innovation...</div>,
  <div>Every note is a step to greatness...</div>,
  <div>Compose, create, and conquer...</div>,
  <div>Discover your inner composer...</div>,
  <div>Unveil the symphony in your soul...</div>,
  <div>Craft music that speaks to the heart...</div>,
  <div>Embrace the sound of your dreams...</div>,
  <div>Find harmony in every moment...</div>,
  <div>Your music, your journey, your story...</div>,
  <div>Melodies waiting to be discovered...</div>,
  <div>Turn silence into your personal symphony...</div>,
  <div>Feel the beat of your creativity...</div>,
  <div>Compose a soundtrack for your life...</div>,
  <div>Draw inspiration from the world around you...</div>,
  <div>Paint your emotions with notes...</div>,
  <div>The world is your musical canvas...</div>,
  <div>Create music that resonates...</div>,
  <div>Every sound has a story...</div>,
  <div>Your creativity knows no bounds...</div>,
  <div>Write the next chapter in your musical journey...</div>,
  <div>Weave your tales with tunes...</div>,
  <div>Inspiration is just a beat away...</div>,
  <div>Explore the infinite possibilities of sound...</div>
];


const NotFound = () => {
  return (
    <BackgroundGeneric isLoading={true} style={{ height: '98vh', width: '96vw', borderRadius: '0.7em', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Contenedor del logo con animación */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="logo-container">
          <MainLogo size={150} animate={true} /> {/* Personaliza el tamaño y la animación */}
        </div>
        <div className={'text-container'}>
          <RotatingContentLoader
            isLoading={true}
            contents={messages}
            intervalTime={3000}
            style={{ padding: '20px', textAlign: 'center', fontSize: '18px' }}
          >
            {/* Aquí puedes agregar contenido adicional */}
          </RotatingContentLoader>

          {/* Título y texto con animación */}
          <h1 >Page Not Found</h1>
          <p >The route you are looking for does not exist.</p>
        </div>
      </div>
    </BackgroundGeneric>
  );
};




export default NotFound;




