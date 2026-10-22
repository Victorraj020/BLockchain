"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWeb3 } from "@/context/Web3Context";
import MetaMaskFox from "./MetaMaskFox";
import {
  X,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Wallet,
} from "lucide-react";

export default function MetaMaskLoginModal() {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    authError,
    clearAuthError,
  } = useAuth();

  const { connectWallet, isConnected, account } = useWeb3();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setSuccessMsg(null);
    setSubmitting(true);

    let ok = false;
    if (mode === "signin") {
      ok = await signInWithEmail(email, password);
    } else {
      ok = await signUpWithEmail(email, password, name);
    }

    setSubmitting(false);
    if (ok) {
      setSuccessMsg(mode === "signin" ? "Unlocked successfully!" : "Account created!");
      setTimeout(() => {
        closeAuthModal();
        setSuccessMsg(null);
      }, 900);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    clearAuthError();
    const ok = await signInWithGoogle();
    setSubmitting(false);
    if (ok) {
      closeAuthModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#14161B] border border-[#232730] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(246,133,27,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient color bar reminiscent of MetaMask */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E2761B] via-[#F6851B] to-[#7C66DC]" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          {/* Animated 3D Polygon MetaMask Fox */}
          <MetaMaskFox size={90} className="mb-3 cursor-pointer" />

          {/* Heading */}
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>MetaMask</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F6851B]/20 text-[#F6851B] border border-[#F6851B]/40 font-mono">
              Auth
            </span>
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            {mode === "signin"
              ? "Enter your password to unlock your decentralized contingency vault."
              : "Create an account secured by Firebase & Ethereum encryption."}
          </p>

          {/* Tab Switcher */}
          <div className="flex w-full mt-5 p-1 rounded-xl bg-[#0D0E11] border border-[#232730]">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                clearAuthError();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "signin"
                  ? "bg-[#1C1F27] text-white shadow-sm border border-[#2E3440]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Unlock Wallet
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                clearAuthError();
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "signup"
                  ? "bg-[#1C1F27] text-white shadow-sm border border-[#2E3440]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Status / Error feedback */}
          {authError && (
            <div className="w-full mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {successMsg && (
            <div className="w-full mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 text-left animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full mt-5 space-y-3.5 text-left">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">
                  Full Name / Alias
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Satoshi Nakamoto"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0D0E11] border border-[#2A2E39] focus:border-[#F6851B] focus:ring-1 focus:ring-[#F6851B] text-xs text-white placeholder-gray-600 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vault.owner@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0D0E11] border border-[#2A2E39] focus:border-[#F6851B] focus:ring-1 focus:ring-[#F6851B] text-xs text-white placeholder-gray-600 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-gray-300">
                  Password
                </label>
                {mode === "signin" && (
                  <span className="text-[10px] text-[#F6851B] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#0D0E11] border border-[#2A2E39] focus:border-[#F6851B] focus:ring-1 focus:ring-[#F6851B] text-xs text-white placeholder-gray-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button styled like MetaMask's Unlock */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#E2761B] to-[#F6851B] hover:from-[#D16B16] hover:to-[#E57815] active:scale-[0.99] text-white text-xs font-semibold shadow-[0_4px_20px_rgba(246,133,27,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "signin" ? (
                <>
                  <span>Unlock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Wallet Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center my-4">
            <div className="flex-1 h-px bg-[#232730]" />
            <span className="px-3 text-[11px] text-gray-500 font-mono">OR</span>
            <div className="flex-1 h-px bg-[#232730]" />
          </div>

          {/* Social Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-2 px-3 rounded-xl bg-[#1C1F27] hover:bg-[#232730] border border-[#2E3440] text-xs font-medium text-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {/* Google colorful G logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Web3 Wallet Connect Option */}
          <div className="w-full mt-3 pt-3 border-t border-[#232730]/60 flex items-center justify-between text-xs">
            <span className="text-gray-400 text-[11px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#F6851B]" />
              Web3 Hardware / Extension
            </span>
            <button
              onClick={() => {
                connectWallet();
                closeAuthModal();
              }}
              className="text-[#F6851B] hover:text-[#FFA040] font-mono text-[11px] underline flex items-center gap-1 cursor-pointer"
            >
              <Wallet className="w-3 h-3" />
              {isConnected ? "Wallet Connected" : "Connect MetaMask"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
