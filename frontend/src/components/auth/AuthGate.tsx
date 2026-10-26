"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "./LoginPage";
import AegisEmblem from "@/components/common/AegisEmblem";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#08090C] flex flex-col items-center justify-center text-zinc-100">
        <AegisEmblem size={52} className="mb-4 animate-pulse" />
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Verifying Vault Security Session...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, lock down the application and show full precision LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // Once authenticated, render the dApp
  return <>{children}</>;
}
