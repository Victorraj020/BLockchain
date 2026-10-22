"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authError: null,
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithEmail: async () => false,
  signUpWithEmail: async () => false,
  signInWithGoogle: async () => false,
  logOut: async () => {},
  clearAuthError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  };

  const clearAuthError = () => setAuthError(null);

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error("Sign in error:", err);
      let msg = "Failed to sign in. Please check your credentials.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Try again in a few minutes.";
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      return false;
    }
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name?: string
  ): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error("Sign up error:", err);
      let msg = "Failed to create account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      return false;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
      return true;
    } catch (err: any) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setAuthError(err.message || "Failed to sign in with Google.");
      }
      return false;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logOut,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
