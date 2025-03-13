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
import { auth } from '../../firebase';
import ShowHide from './complex/showHide';
import Modal from './complex/modal';
import '../estilos/music/login.css';
import BackgroundGeneric from './complex/backgroundGeneric';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        sessionStorage.setItem('userName', user.displayName || 'User');
        sessionStorage.setItem('userImage', user.photoURL || '');
      } else {
        setUser(null);
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('userImage');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/music/globalCollections=test1?type=audio&quality=low');
    }
  }, [user]);

  const handleUserAfterAuth = async (uid, email, authType) => {
    try {
      // Verificar que el email no sea null o undefined
      if (!email) {
        throw new Error('Email is required.');
      }

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
        console.log(data);
        
        
        setModalMessage(data.message);
        setIsModalOpen(true);

        const user = auth.currentUser;
        if (user) {
          sessionStorage.setItem('userName', user.displayName || 'User');
          sessionStorage.setItem('userImage', user.photoURL || '');
          sessionStorage.setItem('userMyLikes', data.myLikes || 'nada');
        }

        router.push('/music/globalCollections=test1?type=audio&quality=low');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error calling handleUserAfterAuth:', error);
      setError(`An error occurred while handling user data: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignIn) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setModalMessage('Account created successfully!');
        setIsModalOpen(true);
        await handleUserAfterAuth(user.uid, user.email, 'signIn');
      } else {
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

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      console.log('Usuario de Google:', user); // Imprime el objeto user completo
  
      // Obtener el correo electrónico desde providerData
      const email = user.email || (user.providerData && user.providerData[0]?.email);
  
      if (!email) {
        throw new Error('No se pudo obtener el correo electrónico de la cuenta de Google.');
      }
  
      setUser(user);
      await handleUserAfterAuth(user.uid, email, 'google');
    } catch (error) {
      console.error('Error logging in with Google:', error);
      setError(`Error al iniciar sesión con Google: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userImage');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

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

  return (
    <BackgroundGeneric isLoading={true}>
      <div className="login-container">
        {loginSuccess && (
          <div className="login-success-message">
            <p>Login successful! Redirecting...</p>
          </div>
        )}
        <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit} className="login-form">
          <h2 className="login-title">{isForgotPassword ? 'Forgot Password' : isSignIn ? 'Sign In' : 'Login'}</h2>
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <label htmlFor="email" className="input-label">
              <FaEnvelope className="input-icon" /> Email
            </label>
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
              <label htmlFor="password" className="input-label">
                <FaLock className="input-icon" /> Password
              </label>
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
                <div className="show-hide-icon" onClick={() => setShowPassword(!showPassword)}>
                  <ShowHide
                    size={24}
                    onClick={() => setShowPassword(!showPassword)}
                    isVisible={showPassword}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          )}
          <button type="submit" className="submit-button">
            {isForgotPassword ? 'Send Reset Email' : isSignIn ? 'Sign In' : 'Login'}
          </button>
          {!isForgotPassword && (
            <button type="button" onClick={handleGoogleLogin} className="google-button">
              <FaGoogle className="google-icon" /> Login with Google
            </button>
          )}
          {!isForgotPassword && (
            <p className="forgot-password-link" onClick={() => setIsSignIn((prev) => !prev)}>
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

















