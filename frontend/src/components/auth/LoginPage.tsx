"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AegisEmblem from "@/components/common/AegisEmblem";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  KeyRound,
  ExternalLink,
  ChevronDown,
  Clock,
  Search,
  Menu,
  DollarSign,
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";

export default function LoginPage() {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 3D tilt for preview card
  const [tilt, setTilt] = useState({ rx: 6, ry: -10 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / (rect.height / 2)) * 12;
    const ry = (x / (rect.width / 2)) * 14;
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 6, ry: -10 });
  };

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
      setSuccessMsg(mode === "signin" ? "Vault unlocked! Entering workspace..." : "Account created! Logging in...");
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    clearAuthError();
    await signInWithGoogle();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#090A0E] text-white flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background ambient futuristic lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#7C66DC]/25 via-[#10B981]/15 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#3B82F6]/15 via-[#7C66DC]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Cyber grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Section: Institutional Branding & 3D Interactive Card Showcase */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14161E] border border-[#262A38] w-fit shadow-sm">
            <AegisEmblem size={22} />
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-300">
              Dead-Man Switch
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
            Decentralized
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              Digital Contingency.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
            Protect your digital wealth, credentials, and contingency vaults with
            cryptographic proof of life. Autonomous execution when conditions are met.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-xl">
            <div className="p-3.5 rounded-2xl bg-[#12141C] border border-[#202432]">
              <ShieldCheck className="w-5 h-5 text-purple-400 mb-2" />
              <div className="text-sm font-bold text-white">Non-Custodial</div>
              <div className="text-[11px] text-gray-400 mt-0.5">You retain total key control</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#12141C] border border-[#202432]">
              <Zap className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-sm font-bold text-white">Smart Triggers</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Automated timer heartbeats</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#12141C] border border-[#202432]">
              <KeyRound className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-sm font-bold text-white">Secret Vaults</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Encrypted payload delivery</div>
            </div>
          </div>

          {/* Interactive 3D Mockup preview */}
          <div
            className="hidden md:flex justify-start pt-2 perspective-[1200px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="w-full max-w-[320px] rounded-[30px] bg-[#111319] border-2 border-[#242838] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(124,102,220,0.2)] p-4 transition-transform duration-200 ease-out select-none"
              style={{
                transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full bg-[#1A1D27] text-[11px] font-semibold text-white border border-[#2B3042]">
                  Vault Primary
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Synced • 6% APY</span>
              </div>
              <div className="text-center my-3">
                <div className="text-2xl font-bold font-mono text-white">$10,000.00</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+$500.00 (+5%)</div>
              </div>
              <div className="grid grid-cols-4 gap-2 my-3">
                <div className="p-2 rounded-xl bg-[#191C26] text-center border border-[#262B3D]">
                  <DollarSign className="w-3.5 h-3.5 mx-auto text-amber-400" />
                  <span className="text-[9px] text-gray-400 mt-0.5 block">Buy</span>
                </div>
                <div className="p-2 rounded-xl bg-[#191C26] text-center border border-[#262B3D]">
                  <ArrowDownUp className="w-3.5 h-3.5 mx-auto text-purple-400" />
                  <span className="text-[9px] text-gray-400 mt-0.5 block">Swap</span>
                </div>
                <div className="p-2 rounded-xl bg-[#191C26] text-center border border-[#262B3D]">
                  <ArrowUpRight className="w-3.5 h-3.5 mx-auto text-emerald-400" />
                  <span className="text-[9px] text-gray-400 mt-0.5 block">Send</span>
                </div>
                <div className="p-2 rounded-xl bg-[#191C26] text-center border border-[#262B3D]">
                  <ArrowDownLeft className="w-3.5 h-3.5 mx-auto text-cyan-400" />
                  <span className="text-[9px] text-gray-400 mt-0.5 block">Receive</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-[#161822] border border-[#232736] flex justify-between items-center text-[11px]">
                <span className="text-gray-400">Heartbeat Status</span>
                <span className="text-emerald-400 font-mono font-semibold">Active & Armed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: The Gatekeeper Login / Sign Up Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="rounded-3xl bg-[#111319] border border-[#262A38] shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_50px_rgba(124,102,220,0.2)] p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Top glowing accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400" />

            {/* Interactive 3D Guardian Emblem */}
            <AegisEmblem size={88} className="mb-4" />

            <h2 className="text-2xl font-black text-white tracking-tight">
              Dead-Man Switch
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              {mode === "signin"
                ? "Enter your credentials to unlock and access your contingency workspace."
                : "Create a secure decentralized contingency vault account."}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex w-full mt-5 p-1 rounded-xl bg-[#0B0C10] border border-[#1E222E]">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  clearAuthError();
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === "signin"
                    ? "bg-[#1C1F2B] text-white shadow border border-[#2C3246]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Unlock Vault
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  clearAuthError();
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  mode === "signup"
                    ? "bg-[#1C1F2B] text-white shadow border border-[#2C3246]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Alerts */}
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

            {/* Auth Form */}
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0B0C10] border border-[#252A38] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-gray-600 outline-none transition-colors"
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0B0C10] border border-[#252A38] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-gray-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-gray-300">
                    Master Password
                  </label>
                  {mode === "signin" && (
                    <span className="text-[10px] text-purple-400 hover:underline cursor-pointer">
                      Forgot?
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
                    className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#0B0C10] border border-[#252A38] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-xs text-white placeholder-gray-600 outline-none transition-colors"
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

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#7C66DC] via-[#6C55CF] to-[#5B44BE] hover:from-[#6C55CF] hover:to-[#4A34AC] text-white text-xs font-semibold shadow-[0_4px_25px_rgba(124,102,220,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : mode === "signin" ? (
                  <>
                    <span>Unlock Vault Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="w-full flex items-center my-4">
              <div className="flex-1 h-px bg-[#1F2330]" />
              <span className="px-3 text-[11px] text-gray-500 font-mono">OR</span>
              <div className="flex-1 h-px bg-[#1F2330]" />
            </div>

            {/* Google OAuth Login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 px-3 rounded-xl bg-[#151821] hover:bg-[#1D212E] border border-[#262A38] text-xs font-medium text-gray-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
            >
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

            {/* Footer security note */}
            <p className="text-[10px] text-gray-500 mt-4">
              Protected by Firebase Authentication & 256-bit AES encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
