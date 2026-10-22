import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyCIiwFWWUjknCMvdnkyyYQ_zjS-ldBfp8k",
  authDomain: "blockchain-eef84.firebaseapp.com",
  projectId: "blockchain-eef84",
  storageBucket: "blockchain-eef84.firebasestorage.app",
  messagingSenderId: "500474607733",
  appId: "1:500474607733:web:8d19dde1fce38d3044603c",
  measurementId: "G-NL2WYQ8Q2G"
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
