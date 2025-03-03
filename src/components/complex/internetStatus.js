import { useEffect, useState } from 'react';
import '../../estilos/general/general.css'

const InternetStatus = ({setModalContent, setIsModalOpen}) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Escuchar eventos de cambio de conexión
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Limpiar los event listeners al desmontar el componente
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
        setModalContent(
            <div style={{ padding: '20px', textAlign: 'center' }} className="color2 title-lg">
                <p>It seems like there's no internet connection. Please check your network and try again.</p>
            </div>
        );
        setIsModalOpen(true)
    }

    if (isOnline) {
        console.log('sí hay conexión a internet');
        setModalContent('')
        setIsModalOpen(false)
      }
  }, [isOnline]);

  return null; // Este componente no renderiza nada en la UI
};

export default InternetStatus;