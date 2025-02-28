import React, { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { auth } from '../../firebase'; // Asegúrate de que Firebase esté correctamente configurado
import { useRouter } from 'next/navigation'; // Importa useRouter de Next.js

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);

  // Configura el proveedor de Google
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        router.push('/music/hi'); // Redirige al usuario después del login
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Función para manejar el login con correo y contraseña
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignIn) {
        // Modo Sign In: Registrar un nuevo usuario
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Modo Login: Iniciar sesión
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para manejar el login con Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setUser(user);
    } catch (error) {
      setError(error.message);
    }
  };

  // Función para manejar "Forgot Password"
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError('A password reset email has been sent. Please check your inbox.');
      setIsForgotPassword(false);
    } catch (error) {
      setError('Error sending reset email. Please try again.');
    }
  };

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError('Error logging out.');
    }
  };

  // Si el usuario está logueado, mostrar mensaje de bienvenida
  if (user) {
    return (
      <div>
        <p>Welcome, {user.email}!</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // Si no hay usuario, mostrar el formulario de Login o Sign In
  return (
    <div>
      <form onSubmit={isForgotPassword ? handleForgotPassword : handleEmailLogin}>
        <h2>{isForgotPassword ? 'Forgot Password' : isSignIn ? 'Sign In' : 'Login'}</h2>
        {error && <p>{error}</p>}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        {!isForgotPassword && (
          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
        )}
        <button type="submit">
          {isForgotPassword ? 'Send Reset Email' : isSignIn ? 'Sign In' : 'Login'}
        </button>
        {!isForgotPassword && (
          <button type="button" onClick={handleGoogleLogin}>
            Login with Google
          </button>
        )}
        {!isForgotPassword && (
          <button type="button" onClick={() => setIsSignIn((prev) => !prev)}>
            {isSignIn ? 'Already have an account? Login' : 'Create an account'}
          </button>
        )}
        {!isForgotPassword && (
          <button type="button" onClick={() => setIsForgotPassword(true)}>
            Forgot your password?
          </button>
        )}
        {isForgotPassword && (
          <button type="button" onClick={() => setIsForgotPassword(false)}>
            Back to Login
          </button>
        )}
      </form>
    </div>
  );
};

export default Login;








/**
import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../../firebase'; // Asegúrate de que Firebase esté correctamente configurado
import ShowHide from './complex/showHide';
import Modal from './complex/modal';
import '../estilos/music/login.css'; // Importar el archivo CSS
import BackgroundGeneric from './complex/backgroundGeneric';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Importa useRouter de Next.js

const Login = () => {
  const router = useRouter(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false); // Estado para alternar entre Login y Sign In
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false); // Estado para mostrar "Login successful"

  // Configura el proveedor de Google
  const provider = new GoogleAuthProvider();
  provider.addScope('email'); // Solicita el scope de email
  provider.addScope('profile'); // Solicita el scope de perfil

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Guarda los datos en sessionStorage aquí
        sessionStorage.setItem('userName', user.displayName || 'User');
        sessionStorage.setItem('userImage', user.photoURL || '');
      } else {
        setUser(null);
        // Limpia sessionStorage solo al cerrar sesión
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('userImage');
      }
    });

    return () => unsubscribe(); // Limpia la suscripción al desmontar el componente
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/music/hi');
    }
  }, [user]);


  // Función para obtener el correo electrónico del usuario
  const getUserEmail = (user) => {
    if (user.email) {
      return user.email;
    }
    if (user.providerData && user.providerData.length > 0) {
      for (const provider of user.providerData) {
        if (provider.email) {
          return provider.email;
        }
      }
    }
    throw new Error('Email not found in user object.');
  };

  // Función para verificar o crear el usuario en la base de datos
  const handleUserAfterAuth = async (uid, email, authType) => {
    try {
      const response = await fetch('/api/handleUserAfterAuth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, email, authType }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorData.details || 'Unknown error'}`);
      }
  
      const data = await response.json();
      if (data.success) {
        setModalMessage(data.message);
        setIsModalOpen(true);
  
        // Guardar el nombre y la imagen del usuario en sessionStorage
        const user = auth.currentUser;
        if (user) {
          sessionStorage.setItem('userName', user.displayName || 'User');
          sessionStorage.setItem('userImage', user.photoURL || '');
        }
  
        router.push('/music/hi');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error calling handleUserAfterAuth:', error);
      setError(`An error occurred while handling user data: ${error.message}`);
    }
  };

  // Manejar el envío del formulario (Login o Sign In)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignIn) {
        // Modo Sign In: Registrar un nuevo usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setModalMessage('Account created successfully!');
        setIsModalOpen(true);
        await handleUserAfterAuth(user.uid, user.email, 'signIn');
      } else {
        // Modo Login: Iniciar sesión
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await handleUserAfterAuth(user.uid, user.email, 'login');
      }
    } catch (error) {
      console.error('Error:', error);
      switch (error.code) {
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/email-already-in-use':
          setError('Email already in use.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        case 'auth/user-not-found':
          setError('Email not found.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        default:
          setError(`An unexpected error occurred: ${error.message}`);
      }
    }
  };

  // Manejar el inicio de sesión con Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = getUserEmail(user);

      setUser(user);
      await handleUserAfterAuth(user.uid, email, 'google');
    } catch (error) {
      console.error('Error logging in with Google:', error);
      setError(`Error logging in with Google: ${error.message}`);
    }
  };

  // Manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      sessionStorage.removeItem('userName'); // Limpiar sessionStorage al cerrar sesión
      sessionStorage.removeItem('userImage');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Manejar "Forgot Password"
  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setModalMessage('A password reset email has been sent. Please check your inbox.');
      setIsModalOpen(true);
      setIsForgotPassword(false);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setError('Error sending reset email. Please try again.');
    }
  };

  // Si el usuario está logueado, mostrar mensaje de bienvenida
  if (user) {
    return (
      <BackgroundGeneric isLoading={true}>
        <div className="login-container">
        <Image src={user.photoURL} alt={`${user.name}'s profile picture`} width={150} height={150} style={{ borderRadius: '50%' }} />
          <p className='title-xs'>Welcome, {user.displayName || user.email}!</p>
          
          </div>
          </BackgroundGeneric>
        );
      }
    
      // Si no hay usuario, mostrar el formulario de Login o Sign In
      return (
        <BackgroundGeneric isLoading={true}>
          <div className="login-container">
            {loginSuccess && ( // Mostrar "Login successful" si el estado es true
              <div className="login-success-message">
                <p>Login successful! Redirecting...</p>
              </div>
            )}
            <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="login-form">
              <h2 className="login-title">{isForgotPassword ? 'Forgot Password' : isSignIn ? 'Sign In' : 'Login'}</h2>
              {error && <p className="error-message">{error}</p>}
              <div className="input-group">
                <label htmlFor="email" className="input-label">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {!isForgotPassword && (
                <div className="input-group">
                  <label htmlFor="password" className="input-label">Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      placeholder="Enter your password"
                      required
                    />
                    <div className="show-hide-icon">
                      <ShowHide
                        isVisible={!showPassword}
                        onClick={() => setShowPassword(!showPassword)}
                        size={20}
                        style={{ color: 'black' }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <button type="submit" className="submit-button">
                {isForgotPassword ? 'Send Reset Email' : isSignIn ? 'Sign In' : 'Login'}
              </button>
              {!isForgotPassword && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="google-button"
                >
                  Login with Google
                </button>
              )}
              {!isForgotPassword && (
                <p
                  className="forgot-password-link"
                  onClick={() => setIsSignIn((prev) => !prev)}
                >
                  {isSignIn ? 'Already have an account? Login' : 'Create an account'}
                </p>
              )}
              {!isForgotPassword && (
                <p className="forgot-password-link" onClick={() => setIsForgotPassword(true)}>
                  Forgot your password?
                </p>
              )}
              {isForgotPassword && (
                <p className="forgot-password-link" onClick={() => setIsForgotPassword(false)}>
                  Back to Login
                </p>
              )}
            </form>
    
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
              <p className="modal-content">{modalMessage}</p>
              <button onClick={() => setIsModalOpen(false)} className="modal-button">
                Close
              </button>
            </Modal>
          </div>
        </BackgroundGeneric>
      );
    };
    
    export default Login;
 */













