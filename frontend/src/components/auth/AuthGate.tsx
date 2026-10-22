"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "./LoginPage";
import AegisEmblem from "@/components/common/AegisEmblem";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#090A0E] flex flex-col items-center justify-center text-white">
        <AegisEmblem size={70} className="mb-4 animate-pulse" />
        <div className="flex items-center gap-2 font-mono text-xs text-purple-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Verifying Aegis Vault Session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, lock down the entire application and show full LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // Once authenticated, render the dApp
  return <>{children}</>;
}
