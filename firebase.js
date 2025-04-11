import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Configuración directa para pruebas
const firebaseConfig = {
  apiKey: "AIzaSyD4O93pb09gyZrMyXymC9mVLZHBkfQBJkI",
  authDomain: "exclusivemusic-ce540.firebaseapp.com",
  projectId: "exclusivemusic-ce540",
  storageBucket: "exclusivemusic-ce540.appspot.com",
  messagingSenderId: "564459559461",
  appId: "1:564459559461:web:fee41079fd348192d9fdcc",
};

// Verificar si las claves están definidas correctamente
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing.");
}

// Inicializar Firebase solo si no ha sido inicializado previamente
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

//console.log('Firebase Config (Direct Values):', firebaseConfig);












/*import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verificar si las claves están definidas
if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing. Check your .env or environment variables.");
}

// Inicializar Firebase solo si no ha sido inicializado previamente
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

console.log('Firebase Config (Loaded):', firebaseConfig);*/

