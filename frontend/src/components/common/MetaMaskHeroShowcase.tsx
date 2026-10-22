"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useAuth } from "@/context/AuthContext";
import MetaMaskFox from "./MetaMaskFox";
import {
  ChevronDown,
  Clock,
  Search,
  Menu,
  DollarSign,
  ArrowDownUp,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  X,
  RefreshCw,
} from "lucide-react";
import { shortenAddress } from "@/lib/constants";

export default function MetaMaskHeroShowcase() {
  const {
    account,
    isConnected,
    connectWallet,
    ethBalance,
    tokenBalance,
    claimFaucet,
    txPending,
  } = useWeb3();
  const { user, openAuthModal } = useAuth();

  // Interactive 3D Card tilt state
  const [tilt, setTilt] = useState({ rx: 6, ry: -10 });
  const [activeActionModal, setActiveActionModal] = useState<
    "buy" | "swap" | "send" | "receive" | null
  >(null);
  const [copied, setCopied] = useState(false);
  const [swapAmount, setSwapAmount] = useState("100");
  const [swapTarget, setSwapTarget] = useState("mUSD");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / (rect.height / 2)) * 12;
    const ry = (x / (rect.width / 2)) * 14;
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 6, ry: -10 }); // Return to default stylish angle
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0C10] via-[#101217] to-[#151722] border border-[#232732] p-6 md:p-12 mb-8 shadow-2xl">
      {/* Background MetaMask-style dramatic gradient splash */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-[#7B3FE4]/30 via-[#FF5C00]/20 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-[#6366F1]/15 blur-3xl pointer-events-none rounded-full" />

      {/* Grid Layout: Left Hero Pitch, Right Animated MetaMask Card */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Bold MetaMask Marketing Copy */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          {/* Top Brand Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1D27] border border-[#2F3446] w-fit mb-5 shadow-sm">
            <MetaMaskFox size={24} />
            <span className="text-xs font-semibold tracking-wide text-white">
              MetaMask Powered Vault Protocol
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
          </div>

          {/* Main Huge Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-4">
            Trade anything.
            <br />
            <span className="bg-gradient-to-r from-white via-[#F3F4F6] to-[#E2761B] bg-clip-text text-transparent">
              Earn more.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-gray-300 font-normal leading-relaxed max-w-xl mb-6">
            The self-custodial crypto app where your money is always working while you
            trade, send, and spend — backed by institutional-grade Dead-Man Switch
            autonomous inheritance vaults.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {!user ? (
              <button
                onClick={openAuthModal}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#E2761B] via-[#F6851B] to-[#FF7020] hover:from-[#CD6116] hover:to-[#E56515] text-white text-sm font-semibold shadow-[0_8px_25px_rgba(246,133,27,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
              >
                <MetaMaskFox size={20} />
                <span>Get started</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-xl bg-[#1C1F27] border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Authenticated: {user.email || user.displayName || "Active"}</span>
              </div>
            )}

            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="px-5 py-3 rounded-xl bg-[#181B24] hover:bg-[#202533] border border-[#2D3346] hover:border-gray-500 text-white text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Connect Wallet</span>
              </button>
            ) : (
              <button
                onClick={() => claimFaucet()}
                disabled={txPending}
                className="px-5 py-3 rounded-xl bg-[#7C66DC]/20 hover:bg-[#7C66DC]/30 border border-[#7C66DC]/40 text-[#CABEFF] text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#CABEFF]" />
                <span>Claim 1k TEST Faucet</span>
              </button>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-[#232732]/80">
            <div>
              <div className="text-xl font-bold font-mono text-white">100%</div>
              <div className="text-[11px] text-gray-400">Self-Custodial</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-emerald-400">6.0% APY</div>
              <div className="text-[11px] text-gray-400">mUSD Staking</div>
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-white">0s Delay</div>
              <div className="text-[11px] text-gray-400">Auto Execution</div>
            </div>
          </div>
        </div>

        {/* Right Column: Exact 3D Animated MetaMask Mobile Wallet Card */}
        <div
          className="lg:col-span-5 flex justify-center perspective-[1200px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="w-full max-w-[340px] sm:max-w-[360px] rounded-[36px] bg-[#111216] border-2 border-[#2B2E3C] shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(123,63,228,0.25)] p-5 transition-transform duration-200 ease-out select-none relative"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Top Phone Notch / Speaker pill */}
            <div className="w-24 h-4 bg-[#1E2029] rounded-full mx-auto mb-4 border border-[#2D303E]/50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#111216] mr-2" />
              <div className="w-8 h-1 rounded-full bg-[#2B2E3C]" />
            </div>

            {/* Top Navigation Row in Mockup */}
            <div className="flex items-center justify-between mb-6">
              {/* Account Dropdown Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1C23] border border-[#2B2E3C] hover:border-gray-500 cursor-pointer transition-colors">
                <span className="text-xs font-semibold text-white">Main</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>

              {/* Action Icons Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveActionModal("send")}
                  className="p-2 rounded-full bg-[#1A1C23] border border-[#2B2E3C] text-gray-300 hover:text-white transition-colors"
                  title="Recent Activity"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveActionModal("swap")}
                  className="p-2 rounded-full bg-[#1A1C23] border border-[#2B2E3C] text-gray-300 hover:text-white transition-colors"
                  title="Search Assets"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={openAuthModal}
                  className="p-2 rounded-full bg-[#1A1C23] border border-[#2B2E3C] text-gray-300 hover:text-white transition-colors"
                  title="Menu"
                >
                  <Menu className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Big Hero Balance Display */}
            <div className="text-center my-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {isConnected ? `$${(parseFloat(tokenBalance || "0") * 10 + 10000).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "$10,000.00"}
              </h2>
              <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-mono font-semibold">
                <span>+$500.00 (+5%)</span>
              </div>
            </div>

            {/* 4 Iconic Circular / Pill Action Buttons */}
            <div className="grid grid-cols-4 gap-2.5 mb-6">
              {/* Buy */}
              <button
                onClick={() => setActiveActionModal("buy")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A1C23] group-hover:bg-[#252834] border border-[#2B2E3C] group-hover:border-[#F6851B] flex items-center justify-center text-white transition-all transform group-hover:scale-105 shadow-md">
                  <DollarSign className="w-5 h-5 text-[#F6851B]" />
                </div>
                <span className="text-[11px] font-medium text-gray-300 group-hover:text-white">
                  Buy
                </span>
              </button>

              {/* Swap */}
              <button
                onClick={() => setActiveActionModal("swap")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A1C23] group-hover:bg-[#252834] border border-[#2B2E3C] group-hover:border-[#7C66DC] flex items-center justify-center text-white transition-all transform group-hover:scale-105 shadow-md">
                  <ArrowDownUp className="w-5 h-5 text-[#CABEFF]" />
                </div>
                <span className="text-[11px] font-medium text-gray-300 group-hover:text-white">
                  Swap
                </span>
              </button>

              {/* Send */}
              <button
                onClick={() => setActiveActionModal("send")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A1C23] group-hover:bg-[#252834] border border-[#2B2E3C] group-hover:border-[#10B981] flex items-center justify-center text-white transition-all transform group-hover:scale-105 shadow-md">
                  <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
                </div>
                <span className="text-[11px] font-medium text-gray-300 group-hover:text-white">
                  Send
                </span>
              </button>

              {/* Receive */}
              <button
                onClick={() => setActiveActionModal("receive")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1A1C23] group-hover:bg-[#252834] border border-[#2B2E3C] group-hover:border-cyan-400 flex items-center justify-center text-white transition-all transform group-hover:scale-105 shadow-md">
                  <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-[11px] font-medium text-gray-300 group-hover:text-white">
                  Receive
                </span>
              </button>
            </div>

            {/* Sub-Card: Money balance • mUSD */}
            <div className="rounded-2xl bg-[#181A22] border border-[#2B2E3C] p-3.5 flex items-center justify-between mb-2 hover:border-[#3D4255] transition-colors">
              <div>
                <p className="text-[11px] text-gray-400 font-medium">
                  Money balance • <span className="text-gray-300">mUSD</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white font-mono">
                    $10,000.00
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
                    <RefreshCw className="w-2.5 h-2.5" />
                    6% APY
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveActionModal("buy")}
                className="px-3 py-1.5 rounded-full bg-[#232733] hover:bg-[#2E3344] text-xs font-semibold text-white border border-[#34384B] transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Bottom active notification badge in screenshot */}
            <div className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#0D0E12] border border-[#222530] text-[10px] text-gray-400">
              <span className="flex items-center gap-1 text-[#F6851B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F6851B]" />
                MetaMask Synced
              </span>
              <span className="font-mono text-gray-500">v12.4.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Action Modals for Buy, Swap, Send, Receive */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#14161B] border border-[#2E3344] p-6 shadow-2xl text-left">
            <button
              onClick={() => setActiveActionModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* BUY MODAL */}
            {activeActionModal === "buy" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#F6851B]/20 text-[#F6851B] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Buy Crypto / Claim</h3>
                    <p className="text-xs text-gray-400">Add TEST tokens or ETH to your vault</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-xl bg-[#0D0E11] border border-[#232730]">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Instant Faucet Drop</span>
                      <span className="text-emerald-400 font-mono">Free Testnet</span>
                    </div>
                    <div className="text-base font-bold text-white font-mono">1,000 TEST</div>
                  </div>

                  <button
                    onClick={async () => {
                      await claimFaucet();
                      setActiveActionModal(null);
                    }}
                    disabled={txPending}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E2761B] to-[#F6851B] hover:from-[#CD6116] hover:to-[#E57815] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    {txPending ? "Minting tokens..." : "Claim 1,000 TEST Now"}
                  </button>
                </div>
              </div>
            )}

            {/* SWAP MODAL */}
            {activeActionModal === "swap" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#7C66DC]/20 text-[#CABEFF] flex items-center justify-center">
                    <ArrowDownUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">MetaMask Swap</h3>
                    <p className="text-xs text-gray-400">Best price execution across DEXs</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="p-3 rounded-xl bg-[#0D0E11] border border-[#232730]">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>You Pay</span>
                      <span>Balance: {tokenBalance} TEST</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        className="bg-transparent text-lg font-bold text-white font-mono outline-none w-28"
                      />
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[#202431] text-white">
                        TEST
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0D0E11] border border-[#232730]">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>You Receive (Estimated)</span>
                      <span className="text-emerald-400 font-mono">6% APY</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white font-mono">
                        {(parseFloat(swapAmount || "0") * 0.998).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[#202431] text-emerald-400">
                        mUSD
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Swap of ${swapAmount} TEST to mUSD simulated successfully!`);
                      setActiveActionModal(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C66DC] to-[#6C55CF] hover:from-[#6C55CF] hover:to-[#5B44BE] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Confirm Swap
                  </button>
                </div>
              </div>
            )}

            {/* SEND MODAL */}
            {activeActionModal === "send" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Send / Transfer</h3>
                    <p className="text-xs text-gray-400">Send assets to beneficiary or vault</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Recipient Address</label>
                    <input
                      type="text"
                      placeholder="0x... or ENS domain"
                      className="w-full px-3 py-2 rounded-xl bg-[#0D0E11] border border-[#232730] text-xs text-white font-mono outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Amount</label>
                    <input
                      type="number"
                      placeholder="50.0"
                      className="w-full px-3 py-2 rounded-xl bg-[#0D0E11] border border-[#232730] text-xs text-white font-mono outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      alert("Transfer initiated on network!");
                      setActiveActionModal(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Review Send
                  </button>
                </div>
              </div>
            )}

            {/* RECEIVE MODAL */}
            {activeActionModal === "receive" && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Receive Assets</h3>
                    <p className="text-xs text-gray-400">Share your public address or QR code</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0D0E11] border border-[#232730] text-center my-4">
                  {/* Stylized QR placeholder */}
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg flex items-center justify-center mb-3">
                    <div className="w-full h-full border-4 border-black border-dashed flex items-center justify-center text-black font-mono text-[9px] font-bold text-center">
                      QR: {shortenAddress(account || "0x0000000000000000000000000000000000000000", 4)}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 font-mono break-all px-2">
                    {account || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}
                  </p>
                </div>

                <button
                  onClick={copyAddress}
                  className="w-full py-2.5 rounded-xl bg-[#1C1F27] hover:bg-[#252A36] border border-[#2E3440] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Address Copied!" : "Copy Address"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
