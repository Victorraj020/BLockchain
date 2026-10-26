"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import TokenFlowVisualizer from "@/components/dashboard/TokenFlowVisualizer";
import { shortenAddress, formatInterval, formatTimestamp } from "@/lib/constants";
import {
  ShieldCheck,
  Zap,
  Lock,
  UserCheck,
  Clock,
  ArrowRight,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Wallet,
  Sparkles,
  RefreshCw,
  PlusCircle,
  HelpCircle
} from "lucide-react";

export default function SimpleDashboard() {
  const {
    account,
    isConnected,
    connectWallet,
    ethBalance,
    tokenBalance,
    claimFaucet,
    activeVault,
    vaults,
    setActiveVaultId,
    checkIn,
    triggerSwitch,
    fastForwardTime,
    approveAndCreateVault,
    txPending,
    isLoadingVaults,
  } = useWeb3();

  // Step 1 Create Vault Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [beneficiary, setBeneficiary] = useState("");
  const [depositAmount, setDepositAmount] = useState("100");
  const [intervalSeconds, setIntervalSeconds] = useState(60); // 1 minute demo default
  const [isCreating, setIsCreating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Default demo beneficiary (Account #1 in Hardhat)
  const DEMO_HEIR_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  const now = Math.floor(Date.now() / 1000);
  const isDeadlinePassed =
    activeVault && activeVault.status === 0 && now > activeVault.deadline;
  const isExecuted = activeVault && activeVault.status === 1;

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiary) return;
    setIsCreating(true);
    const result = await approveAndCreateVault({
      name: "Emergency Contingency Vault",
      description: "Automated digital inheritance vault",
      beneficiary: beneficiary.trim(),
      checkInInterval: Number(intervalSeconds),
      actionType: 0, // TOKEN_TRANSFER
      tokenAmount: depositAmount,
      payloadHash: "ipfs://contingency-vault-payload",
    });
    setIsCreating(false);
    if (result.success) {
      setShowCreateForm(false);
    }
  };

  const handleSimulateTimeout = async () => {
    if (!activeVault) return;
    setIsSimulating(true);
    const remaining = Math.max(activeVault.deadline - Math.floor(Date.now() / 1000) + 5, 65);
    await fastForwardTime(remaining);
    setIsSimulating(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2 animate-in fade-in duration-300">
      {/* Clean Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dead-Man Switch Protocol</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            Dead-Man Switch
          </h1>
          <p className="text-sm text-outline mt-1 max-w-xl">
            A simple 3-step fail-safe: lock your assets, check in to prove you're active, and if you miss your deadline, your heir claims everything automatically.
          </p>
        </div>

        {/* Wallet & Quick Faucet Header Bar */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/30 rounded-lg p-2 text-xs">
              <div className="px-2 py-1 bg-surface-container rounded font-mono text-outline">
                {shortenAddress(account || "", 4)}
              </div>
              <div className="px-2 py-1 font-mono text-on-surface font-medium">
                {tokenBalance} TEST
              </div>
              {Number(tokenBalance) < 50 && (
                <button
                  onClick={claimFaucet}
                  disabled={txPending}
                  className="px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary font-medium transition-colors"
                  title="Claim 1,000 free TEST tokens to fund your vault"
                >
                  + Free Tokens
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vault Switcher (If multiple vaults exist) */}
      {vaults.length > 1 && (
        <div className="flex items-center justify-between bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-xs">
          <span className="text-outline font-medium">Selected Vault:</span>
          <div className="flex items-center gap-2">
            <select
              value={activeVault?.id || 1}
              onChange={(e) => setActiveVaultId(Number(e.target.value))}
              className="bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1 text-on-surface font-mono focus:outline-none focus:border-primary"
            >
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  Vault #{v.id} — {v.name} ({v.depositedAmount} TEST)
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>
      )}

      {/* 3-STEP VISUAL PROGRESSION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

        {/* ================= STEP 1: DEPOSIT & SET HEIR ================= */}
        <div className={`relative bg-surface-container-low border rounded-xl p-4 sm:p-6 flex flex-col justify-between transition-all ${!activeVault || showCreateForm
            ? "border-primary shadow-md ring-1 ring-primary/20"
            : "border-outline-variant/30 opacity-95"
          }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold">
                1
              </span>
              <span className="text-xs font-medium text-outline uppercase tracking-wider">
                Setup
              </span>
            </div>

            <h2 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Deposit & Set Heir
            </h2>
            <p className="text-xs text-outline mb-5">
              Lock funds in escrow and designate the wallet that inherits them.
            </p>

            {activeVault && !showCreateForm ? (
              /* Already created summary */
              <div className="space-y-3 bg-surface-container/60 border border-outline-variant/20 rounded-lg p-4 text-xs font-mono">
                <div>
                  <span className="text-outline block text-[11px]">LOCKED AMOUNT</span>
                  <span className="text-base font-bold text-on-surface">
                    {activeVault.depositedAmount} TEST
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[11px]">BENEFICIARY (HEIR)</span>
                  <span className="text-primary font-medium truncate block">
                    {activeVault.beneficiary}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[11px]">CHECK-IN INTERVAL</span>
                  <span className="text-on-surface font-medium">
                    Every {formatInterval(activeVault.checkInInterval)}
                  </span>
                </div>
              </div>
            ) : (
              /* Create Vault Form */
              <form onSubmit={handleCreateVault} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-outline font-medium mb-1">
                    Heir / Beneficiary Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={beneficiary}
                    onChange={(e) => setBeneficiary(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded px-3 py-2 text-on-surface font-mono focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setBeneficiary(DEMO_HEIR_ADDRESS)}
                    className="text-[11px] text-primary hover:underline mt-1 block font-medium"
                  >
                    Use Demo Heir (Account #1)
                  </button>
                </div>

                <div>
                  <label className="block text-outline font-medium mb-1">
                    Amount to Lock (TEST Tokens)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded px-3 py-2 text-on-surface font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-outline font-medium mb-1">
                    Required Check-in Frequency
                  </label>
                  <select
                    value={intervalSeconds}
                    onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value={60}>1 Minute (Fast Testing Demo)</option>
                    <option value={3600}>1 Hour</option>
                    <option value={86400}>1 Day</option>
                    <option value={604800}>7 Days</option>
                    <option value={2592000}>30 Days</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || txPending || !isConnected}
                  className="w-full mt-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isCreating ? "Locking Funds..." : "Lock in Vault"}</span>
                </button>
              </form>
            )}
          </div>

          {activeVault && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 w-full py-2 border border-outline-variant/40 hover:border-primary text-outline hover:text-primary rounded-lg text-xs font-medium transition-colors"
            >
              + Create Another Vault
            </button>
          )}
        </div>


        {/* ================= STEP 2: PROOF OF LIFE (OWNER) ================= */}
        <div className={`relative bg-surface-container-low border rounded-xl p-4 sm:p-6 flex flex-col justify-between transition-all ${activeVault && activeVault.status === 0
            ? "border-primary shadow-lg ring-1 ring-primary/30"
            : "border-outline-variant/30"
          }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold">
                2
              </span>
              <span className="text-xs font-medium text-outline uppercase tracking-wider">
                Proof-of-Life
              </span>
            </div>

            <h2 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              Check-In ("I'm Alive")
            </h2>
            <p className="text-xs text-outline mb-4">
              Click periodically to reset your deadline and prevent automatic handover.
            </p>

            {activeVault ? (
              <div className="space-y-4">
                {/* Live Countdown Card */}
                <div className={`p-4 rounded-xl border text-center ${isDeadlinePassed
                    ? "bg-danger/10 border-danger/30 text-danger"
                    : isExecuted
                      ? "bg-surface-container border-outline-variant/30 text-outline"
                      : "bg-surface-container/70 border-outline-variant/30 text-on-surface"
                  }`}>
                  <span className="text-[11px] font-mono uppercase tracking-wider block text-outline mb-1">
                    {isDeadlinePassed ? "⚠️ DEADLINE EXPIRED" : isExecuted ? "VAULT COMPLETED" : "TIME REMAINING TO CHECK IN"}
                  </span>

                  <div className="py-1">
                    <CountdownTimer
                      deadline={activeVault.deadline}
                      lastCheckIn={activeVault.lastCheckIn}
                      status={activeVault.status}
                    />
                  </div>

                  <span className="text-[11px] font-mono text-outline block mt-1">
                    Last ping: {formatTimestamp(activeVault.lastCheckIn)}
                  </span>
                </div>

                {/* THE BIG "I AM ALIVE" BUTTON */}
                {activeVault.status === 0 && (
                  <button
                    onClick={() => checkIn(activeVault.id)}
                    disabled={txPending}
                    className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-5 h-5 text-white" />
                    <span>I'm Alive (Reset Deadline)</span>
                  </button>
                )}

                {/* Fast-forward test tool */}
                {activeVault.status === 0 && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={handleSimulateTimeout}
                      disabled={isSimulating || txPending}
                      className="inline-flex items-center gap-1.5 text-[11px] font-mono text-warning hover:underline"
                    >
                      <FastForward className="w-3.5 h-3.5" />
                      <span>{isSimulating ? "Fast-forwarding clock..." : "Simulate timeout (1-click test)"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-outline text-xs bg-surface-container/30 rounded-xl border border-dashed border-outline-variant/30">
                Complete Step 1 to activate your check-in timer.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 text-[11px] text-outline text-center">
            {activeVault?.status === 0
              ? "As long as you click before 0:00, your funds remain secure."
              : isExecuted
                ? "Switch already executed."
                : "Awaiting active vault."}
          </div>
        </div>


        {/* ================= STEP 3: HEIR CLAIM ================= */}
        <div className={`relative bg-surface-container-low border rounded-xl p-4 sm:p-6 flex flex-col justify-between transition-all ${isDeadlinePassed
            ? "border-danger shadow-lg ring-2 ring-danger/30 bg-danger/5"
            : isExecuted
              ? "border-success/40 bg-success/5"
              : "border-outline-variant/30"
          }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold">
                3
              </span>
              <span className="text-xs font-medium text-outline uppercase tracking-wider">
                Contingency
              </span>
            </div>

            <h2 className="text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              Heir Claim Handover
            </h2>
            <p className="text-xs text-outline mb-4">
              If the owner fails to check in, the heir claims the locked assets.
            </p>

            <div className="space-y-4">
              {/* Status explanation */}
              <div className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container/60 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isExecuted
                      ? "bg-success"
                      : isDeadlinePassed
                        ? "bg-danger animate-ping"
                        : "bg-outline"
                    }`} />
                  <span className="font-semibold text-on-surface">
                    {isExecuted
                      ? "Assets Successfully Transferred"
                      : isDeadlinePassed
                        ? "Owner Inactive — Funds Ready to Claim!"
                        : "Locked & Protected (Owner Active)"}
                  </span>
                </div>
                <p className="text-[11px] text-outline">
                  {isExecuted
                    ? `The ${activeVault?.depositedAmount} TEST tokens were released to ${shortenAddress(activeVault?.beneficiary || "")}.`
                    : isDeadlinePassed
                      ? "The check-in deadline has expired. Anyone or the beneficiary can now execute the transfer."
                      : "The handover switch cannot be triggered until the timer in Step 2 reaches 0:00."}
                </p>
              </div>

              {/* CLAIM TRIGGER BUTTON */}
              {isDeadlinePassed ? (
                <button
                  onClick={() => activeVault && triggerSwitch(activeVault.id)}
                  disabled={txPending}
                  className="w-full py-4 px-4 rounded-xl bg-danger hover:bg-danger-hover active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-danger/25 transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <Zap className="w-4 h-4" />
                  <span>Claim Contingency Funds Now</span>
                </button>
              ) : isExecuted ? (
                <div className="p-3 bg-success/10 border border-success/30 rounded-xl flex items-center justify-center gap-2 text-success font-medium text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Executed — Beneficiary Received Assets</span>
                </div>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl bg-surface-container border border-outline-variant/30 text-outline text-xs font-medium cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Trigger Locked (Owner is Active)</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/20 text-[11px] text-outline text-center">
            Beneficiary receives funds directly in their wallet upon claim.
          </div>
        </div>

      </div>

      {/* ===== LIVE TOKEN FLOW VISUALIZER ===== */}
      {activeVault && (
        <TokenFlowVisualizer
          ownerAddress={activeVault.owner}
          beneficiaryAddress={activeVault.beneficiary}
          tokenAmount={activeVault.depositedAmount}
          isExecuted={!!isExecuted}
          isDeadlinePassed={!!isDeadlinePassed}
          status={activeVault.status}
        />
      )}

      {/* Simple Instruction Card at the bottom */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-on-surface block text-sm">How to test this in 30 seconds:</span>
            <span className="text-outline">
              1. Click <b>"I'm Alive"</b> to see the timer reset. 2. Click <b>"Simulate timeout"</b> to skip time forward. 3. Click <b>"Claim Contingency Funds"</b> to finish the handover!
            </span>
          </div>
        </div>

        <Link
          href="/activity-log"
          className="text-primary hover:underline font-medium flex items-center gap-1 whitespace-nowrap self-end md:self-auto"
        >
          <span>View On-Chain Activity Log</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
