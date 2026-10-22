"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useAuth } from "@/context/AuthContext";
import MetaMaskFox from "@/components/common/MetaMaskFox";
import { shortenAddress, LOCAL_CHAIN_ID, SEPOLIA_CHAIN_ID } from "@/lib/constants";
import {
  Wallet,
  ChevronDown,
  LogOut,
  Coins,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layers,
  User,
} from "lucide-react";

export default function Header() {
  const {
    account,
    chainId,
    ethBalance,
    tokenBalance,
    isConnecting,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    claimFaucet,
    refreshData,
    txPending,
  } = useWeb3();

  const { user, openAuthModal, logOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 md:left-[230px] right-0 h-14 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/40 z-40 flex items-center justify-between px-4 md:px-6">
      {/* Breadcrumb Left */}
      <div className="flex items-center gap-2 pl-10 md:pl-0">
        <span className="text-xs font-mono text-outline">Workspace</span>
        <span className="text-outline text-xs">/</span>
        <span className="text-xs font-medium text-on-surface">Digital Contingency Vault</span>
      </div>

      {/* Action Controls Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Refresh Contract Data */}
        <button
          onClick={() => refreshData()}
          disabled={txPending}
          className="p-1.5 rounded bg-surface-container-low border border-outline-variant/30 text-outline hover:text-on-surface hover:border-outline transition-colors"
          title="Refresh On-Chain State"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${txPending ? "animate-spin text-primary" : ""}`} />
        </button>

        {/* Contract Synced Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/30">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-mono text-[11px] text-secondary">Contract Synced</span>
        </div>

        {/* Wrong Network Warning Pill */}
        {isConnected && !isCorrectNetwork && (
          <button
            onClick={() => switchNetwork(LOCAL_CHAIN_ID)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-danger/20 border border-danger/60 text-danger hover:bg-danger/30 text-xs font-mono transition-colors animate-pulse"
            title="You are not connected to Hardhat Localhost. Click to switch automatically."
          >
            <span>⚠️ Switch to Hardhat Localhost</span>
          </button>
        )}

        {isConnected ? (
          <>
            {/* TEST Token Balance */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/30">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-[11px] text-outline">TEST:</span>
              <span className="font-mono text-[11px] text-on-surface font-medium">
                {tokenBalance}
              </span>
            </div>

            {/* ETH Balance */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low border border-outline-variant/30">
              <span className="font-mono text-[11px] text-outline">ETH:</span>
              <span className="font-mono text-[11px] text-on-surface font-medium">
                {ethBalance}
              </span>
            </div>

            {/* Faucet Button */}
            <button
              onClick={() => claimFaucet()}
              disabled={txPending}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary/10 border border-primary/30 hover:border-primary text-primary hover:bg-primary/20 text-xs font-mono transition-colors"
              title="Claim 1,000 TEST tokens from local faucet"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Claim 1k</span> TEST
            </button>

            {/* Connected Wallet Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container border border-outline-variant/40 hover:border-outline text-on-surface transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-mono text-xs font-medium">
                  {shortenAddress(account || "", 4)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-outline" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md bg-surface-container border border-outline-variant/40 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-outline-variant/30">
                    <p className="text-[11px] text-outline font-mono">Connected Account</p>
                    <p className="text-xs font-mono text-on-surface mt-0.5 truncate">
                      {account}
                    </p>
                  </div>

                  {/* Switch network options */}
                  <div className="p-1 border-b border-outline-variant/30">
                    <p className="px-2 py-1 text-[10px] font-mono uppercase text-outline">
                      Switch Network
                    </p>
                    <button
                      onClick={() => {
                        switchNetwork(LOCAL_CHAIN_ID);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                        chainId === LOCAL_CHAIN_ID
                          ? "bg-primary/20 text-primary font-medium"
                          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        Hardhat Local (31337)
                      </span>
                      {chainId === LOCAL_CHAIN_ID && (
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        switchNetwork(SEPOLIA_CHAIN_ID);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                        chainId === SEPOLIA_CHAIN_ID
                          ? "bg-primary/20 text-primary font-medium"
                          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" />
                        Ethereum Sepolia
                      </span>
                      {chainId === SEPOLIA_CHAIN_ID && (
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      )}
                    </button>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => connectWallet()}
            disabled={isConnecting}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-medium shadow transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        )}

        {/* Firebase MetaMask Auth Profile Button */}
        {user ? (
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1C1F28] border border-[#2F3446] hover:border-[#F6851B] transition-colors text-xs"
              title="MetaMask Account Profile"
            >
              <MetaMaskFox size={18} />
              <span className="text-[11px] font-mono text-gray-200 hidden sm:inline max-w-[100px] truncate">
                {user.displayName || user.email?.split("@")[0] || "User"}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#14161B] border border-[#2B2E3C] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-left">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#232730]">
                  <MetaMaskFox size={28} />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">
                      {user.displayName || "MetaMask User"}
                    </p>
                    <p className="text-[11px] font-mono text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="py-2 text-[11px] text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Auth Provider:</span>
                    <span className="text-white font-mono">Firebase</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 font-mono">Active</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logOut();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full mt-1 flex items-center justify-center gap-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock / Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E2761B] to-[#F6851B] hover:from-[#D16B16] hover:to-[#E57815] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Sign in or create account with MetaMask Auth"
          >
            <MetaMaskFox size={18} />
            <span className="hidden sm:inline">MetaMask</span> Login
          </button>
        )}
      </div>
    </header>
  );
}
