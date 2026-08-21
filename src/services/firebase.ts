import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Safe environment accessor for Vite browser runtime & Node CLI test runners
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (process.env as any || {});

// 1. Environment Validation
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

const missingVars = requiredEnvVars.filter(key => !env[key]);

if (missingVars.length > 0 && env.PROD) {
  console.warn(`[DOCTUS FIREBASE CONFIG ERROR] Missing required environment variables: ${missingVars.join(', ')}.`);
}

// 2. Dynamic Firebase Configuration
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDkkCe-3ndV4NL4lsN_koehf8pddzgTnb4",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "doctus-attendance-prod.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "doctus-attendance-prod",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "doctus-attendance-prod.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "294702977078",
  appId: env.VITE_FIREBASE_APP_ID || "1:294702977078:web:17f076b3d13342939bc897",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-MSRH56R1H9"
};

// 3. Initialize Single Firebase App Instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// 4. Safe Firebase Analytics (Optional & Fail-Safe)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {
      // Analytics unsupported in current browser/environment - ignore silently
    });
  } catch (e) {
    // Fail-safe catch so analytics never breaks core auth or Firestore
  }
}

// 5. Configuration Status Check
export const isFirebaseConfigured = Boolean(
  env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID
);
