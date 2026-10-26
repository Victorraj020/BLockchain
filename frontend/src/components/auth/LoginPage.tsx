"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AegisEmblem from "@/components/common/AegisEmblem";
import CryptographicNetworkCanvas from "@/components/auth/CryptographicNetworkCanvas";
import VaultMechanicalDial from "@/components/auth/VaultMechanicalDial";
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
  Terminal,
  Cpu,
  Clock,
  Sparkles,
  HelpCircle,
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
      setSuccessMsg(
        mode === "signin"
          ? "Vault unlocked. Entering workspace..."
          : "Account created. Logging in..."
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    clearAuthError();
    await signInWithGoogle();
    setSubmitting(false);
  };

  // Quick fill helper for demo/testing purposes
  const handleQuickDemoFill = () => {
    setEmail("owner@deadmanswitch.local");
    setPassword("MasterVaultPass123!");
    if (mode === "signup") {
      setName("Primary Vault Custodian");
    }
    clearAuthError();
  };

  return (
    <div className="min-h-screen w-full bg-[#08090C] text-zinc-100 flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* High-Performance Canvas for Ambient Cryptographic Mesh */}
      <CryptographicNetworkCanvas />

      {/* Subtle Precision Grid Backdrop */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Interactive 3D Mechanical Vault Showcase */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
          {/* Status Header Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#111319] border border-[#222735] text-xs font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
              Protocol: Dead-Man Switch
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 text-[11px] font-semibold">
              EVM Node Active
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Autonomous Digital Contingency & Wealth Custody.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              Cryptographic proof-of-life protocol built on Ethereum smart contracts.
              Automated asset and secret handover when heartbeat deadlines lapse.
            </p>
          </div>

          {/* 3D Interactive Mechanical Vault Dial */}
          <div className="w-full flex justify-center lg:justify-start pt-1 pb-2">
            <VaultMechanicalDial />
          </div>

          {/* Institutional Feature Metrics */}
          <div className="w-full max-w-[460px] grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#0D0F14]/90 border border-[#1C202C] text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1.5" />
              <div className="text-xs font-semibold text-zinc-200">Non-Custodial</div>
              <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                SafeERC20 escrow
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0F14]/90 border border-[#1C202C] text-left">
              <Clock className="w-4 h-4 text-sky-400 mb-1.5" />
              <div className="text-xs font-semibold text-zinc-200">Autonomous</div>
              <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                Heartbeat cadence
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0D0F14]/90 border border-[#1C202C] text-left">
              <KeyRound className="w-4 h-4 text-amber-400 mb-1.5" />
              <div className="text-xs font-semibold text-zinc-200">Zero-Trust</div>
              <div className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                Beneficiary release
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Precision Authentication Gate Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="rounded-2xl bg-[#0D0F14]/95 border border-[#1F2432] shadow-[0_24px_64px_rgba(0,0,0,0.85)] p-6 sm:p-7 relative overflow-hidden backdrop-blur-md">
            {/* Top Subtly Illuminated Accent Hairline */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />

            {/* Header Section */}
            <div className="flex items-center gap-3 mb-5">
              <AegisEmblem size={38} />
              <div className="text-left">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Vault Authentication Gate
                </h2>
                <p className="text-[11px] text-zinc-400 font-mono">
                  Enter master credentials to unlock workspace
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#08090C] border border-[#191C26] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  clearAuthError();
                }}
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === "signin"
                    ? "bg-[#181C26] text-white shadow-sm border border-[#262C3D]"
                    : "text-zinc-500 hover:text-zinc-300"
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
                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === "signup"
                    ? "bg-[#181C26] text-white shadow-sm border border-[#262C3D]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Initialize Vault
              </button>
            </div>

            {/* Error & Success Alerts */}
            {authError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {mode === "signup" && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Vault Custodian Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Victor Raj"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#08090C] border border-[#202534] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  Custodian Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@vault.local"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#08090C] border border-[#202534] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                    Master Vault Password
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Min 6 characters
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-[#08090C] border border-[#202534] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-3 py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold shadow-[0_2px_12px_rgba(52,211,153,0.3)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Verifying Cryptographic Session...</span>
                  </>
                ) : mode === "signin" ? (
                  <>
                    <span>Unlock Vault Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Initialize Vault Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Helper */}
            <div className="mt-3.5 pt-3 border-t border-[#181B24] flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono">
                Testing locally?
              </span>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-[11px] font-mono text-emerald-400/90 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-fill Demo Credentials</span>
              </button>
            </div>

            {/* Social Divider */}
            <div className="w-full flex items-center my-3.5">
              <div className="flex-1 h-px bg-[#181B24]" />
              <span className="px-3 text-[10px] text-zinc-600 font-mono">OR</span>
              <div className="flex-1 h-px bg-[#181B24]" />
            </div>

            {/* Google OAuth Login */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full py-2.5 px-3 rounded-lg bg-[#0E1016] hover:bg-[#141822] border border-[#202534] text-xs font-medium text-zinc-200 transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
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

            {/* Security Guarantee */}
            <div className="mt-4 pt-3 border-t border-[#181B24] flex items-center justify-center gap-1.5 text-[10px] font-mono text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256 Auth & Non-Custodial Key Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
