import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';
import { isPlatformWeb } from '../utils/platform';

// Firebase configuration needs to be loaded differently depending on platform
const getFirebaseConfig = () => {
  if (isPlatformWeb()) {
    // Web environment
    // @ts-ignore - Vite environment variables
    const envVars = (typeof import.meta !== 'undefined' && 'env' in import.meta) ? import.meta.env : {};
    return {
      apiKey: process.env.VITE_FIREBASE_API_KEY || envVars.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || envVars.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || envVars.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || envVars.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID || envVars.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || envVars.VITE_FIREBASE_MEASUREMENT_ID
    };
  } else {
    // React Native environment
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };
  }
};

// Initialize Firebase with the appropriate config
const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// Initialize Analytics conditionally (only on web)
let analytics = null;
if (isPlatformWeb()) {
  isSupported().then(yes => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch(e => console.error("Analytics error:", e));
}

export { app, db, analytics, functions };