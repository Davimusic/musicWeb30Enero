import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD4O93pb09gyZrMyXymC9mVLZHBkfQBJkI",
  authDomain: "exclusivemusic-ce540.firebaseapp.com", // No lo cambies
  projectId: "exclusivemusic-ce540",
  storageBucket: "exclusivemusic-ce540.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();