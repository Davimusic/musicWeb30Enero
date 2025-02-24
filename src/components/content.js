import { auth, provider } from '../../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

export default function Content() {
  const [user, setUser] = useState(null);

  // Escucha cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // Usuario logueado
      } else {
        setUser(null); // No hay usuario logueado
      }
    });

    return () => unsubscribe(); // Limpia el listener al desmontar el componente
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Usuario logueado:', user);
      setUser(user);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Limpia el estado del usuario
      console.log('Sesión cerrada');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (user) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center'
      }}>
        <img
          src={user.photoURL}
          alt="Foto de perfil"
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '2px solid #4285F4' 
          }}
        />
        <h2 style={{ margin: '0', color: '#333' }}>
          Bienvenido, {user.displayName}!
        </h2>
        <p style={{ margin: '0', color: '#666' }}>
          Has iniciado sesión con Google.
        </p>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <button 
        onClick={handleLogin}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#4285F4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}








