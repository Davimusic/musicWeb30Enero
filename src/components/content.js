import { useState, useEffect } from 'react';
import { auth, provider } from '../../firebase'; // Import Firebase auth and provider
import { signInWithPopup, signOut, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase auth functions
import ShowHide from './complex/showHide'; // Your ShowHide component
import '../estilos/general/general.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [backgroundColorClass, setBackgroundColorClass] = useState('backgroundColor1');
  const [user, setUser] = useState(null); // State for logged-in user
  const [error, setError] = useState(''); // State for error messages

  // Handle background color animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundColorClass((prevClass) => {
        if (prevClass === 'backgroundColor1') return 'backgroundColor2';
        if (prevClass === 'backgroundColor2') return 'backgroundColor3';
        if (prevClass === 'backgroundColor3') return 'backgroundColor4';
        if (prevClass === 'backgroundColor4') return 'backgroundColor5';
        return 'backgroundColor1'; // Restart the cycle
      });
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Listen for auth state changes (Google or email/password login)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // User is logged in
      } else {
        setUser(null); // No user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Handle form submission (email/password login)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Invalid email or password. Please try again.'); // Set error message
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google user logged in:', user);
      setUser(user);
    } catch (error) {
      console.error('Error logging in with Google:', error);
      setError('Error logging in with Google. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear user state
      console.log('User logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // If user is logged in, show welcome message
  if (user) {
    return (
      <div
        className={'backgroundColor1'}
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        {/* Display profile photo if available, otherwise show a placeholder */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="Profile"
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '2px solid #4285F4',
            }}
          />
        ) : (
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#4285F4',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'white',
              fontSize: '24px',
              border: '2px solid #4285F4',
            }}
          >
            {user.email[0].toUpperCase()} {/* Show the first letter of the email */}
          </div>
        )}

        {/* Display displayName if available, otherwise show email */}
        <h2 style={{ margin: '0', color: '#333', fontSize: '24px' }}>
          Welcome, {user.displayName || user.email}!
        </h2>

        <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
          You are logged in.
        </p>

        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
            width: '100%',
            maxWidth: '200px',
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  // If no user is logged in, show the login form
  return (
    <div className={`${backgroundColorClass}`} style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Login</h2>
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="Enter your email"
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
              <ShowHide
                isVisible={showPassword}
                onClick={() => setShowPassword(!showPassword)}
                size={20}
                style={{ color: 'black' }}
              />
            </div>
          </div>
        </div>
        <a href="#" style={styles.forgotPassword}>Forgot your password?</a>
        <button type="submit" style={styles.submitButton}>Login</button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'black',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginTop: '1rem',
          }}
        >
          Login with Google
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    transition: 'background-color 1s ease', // Smooth transition for background color
  },
  form: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  forgotPassword: {
    display: 'block',
    textAlign: 'center',
    color: '#0070f3',
    textDecoration: 'none',
    marginBottom: '1rem',
  },
  submitButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'black',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default Login;







/*import { auth, provider } from '../../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import '../estilos/general/general.css'

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
      <div 
      className={'backgroundColor1'}
      style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        flexDirection: 'column',
        gap: '20px',
        textAlign: 'center',
        padding: '20px',
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
        <h2 style={{ margin: '0', color: '#333', fontSize: '24px' }}>
          Benvingut, {user.displayName}!
        </h2>
        <p style={{ margin: '0', color: '#666', fontSize: '16px' }}>
          Has iniciat sessió amb Google.
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
            marginTop: '20px',
            width: '100%',
            maxWidth: '200px'
          }}
        >
          Tancar sessió
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
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
          width: '100%',
          maxWidth: '300px'
        }}
      >
        Iniciar sessió amb Google
      </button>
    </div>
  );
}*/








