import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCLjTJMsitV-TIbdhQ4vDGPoRS0FOhTR_4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "blockchain-59831.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "blockchain-59831",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "blockchain-59831.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1087422209541",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1087422209541:web:db04269abb1400d935c66c",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-T6VXPEB57B"
};

// Initialize Firebase app singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Client-side analytics initialization
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Ignore analytics errors in SSR or restricted environments
    });
}
