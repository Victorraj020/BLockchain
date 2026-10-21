"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";
import CountdownTimer from "@/components/dashboard/CountdownTimer";
import {
  shortenAddress,
  formatInterval,
  formatTimestamp,
  ACTION_TYPES,
  CONTRACT_ADDRESSES,
} from "@/lib/constants";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  PlusCircle,
  FileText,
  Clock,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info,
  FastForward,
} from "lucide-react";

export default function Dashboard() {
  const {
    account,
    isConnected,
    connectWallet,
    activeVault,
    vaults,
    setActiveVaultId,
    checkIn,
    triggerSwitch,
    fastForwardTime,
    txPending,
    isLoadingVaults,
  } = useWeb3();

  const [copiedBeneficiary, setCopiedBeneficiary] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const copyText = (text: string, type: "beneficiary" | "contract") => {
    navigator.clipboard.writeText(text);
    if (type === "beneficiary") {
      setCopiedBeneficiary(true);
      setTimeout(() => setCopiedBeneficiary(false), 2000);
    } else {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  const now = Math.floor(Date.now() / 1000);
  const isDeadlinePassed =
    activeVault && activeVault.status === 0 && now > activeVault.deadline;

  const handleSimulateExpiry = async () => {
    if (!activeVault) return;
    setIsSimulating(true);
    // Fast forward enough seconds to exceed the remaining deadline
    const remaining = Math.max(activeVault.deadline - Math.floor(Date.now() / 1000) + 5, 65);
    await fastForwardTime(remaining);
    setIsSimulating(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Top Header & Greeting Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-outline mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-on-surface">Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-on-surface tracking-tight">
            {isConnected
              ? `Welcome back, ${shortenAddress(account || "", 4)}`
              : "Contingency Vault Overview"}
          </h1>
          <p className="text-sm text-outline mt-1">
            Autonomous blockchain-enforced asset and secret contingency protocol.
          </p>
        </div>

        {/* Vault Switcher & Create Vault CTA */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {vaults.length > 1 && (
            <select
              value={activeVault?.id || 1}
              onChange={(e) => setActiveVaultId(Number(e.target.value))}
              className="bg-surface-container-low border border-outline-variant/40 rounded px-3 py-1.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
            >
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  Vault #{v.id} — {v.name}
                </option>
              ))}
            </select>
          )}

          <Link
            href="/create-vault"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary/10 border border-primary/40 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Vault</span>
          </Link>
        </div>
      </div>

      {/* Main Contingency Status Panel */}
      {activeVault ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5 md:p-6 shadow-sm">
          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-outline-variant/20 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base font-medium text-on-surface">
                Vault #{activeVault.id} — {activeVault.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-outline font-mono">
                {formatInterval(activeVault.checkInInterval)} cycle
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-outline">
              <span>Last check-in:</span>
              <span className="text-on-surface font-medium">
                {formatTimestamp(activeVault.lastCheckIn)}
              </span>
            </div>
          </div>

          {/* Countdown Unit */}
          <div className="py-6 border-b border-outline-variant/20">
            <CountdownTimer
              deadline={activeVault.deadline}
              lastCheckIn={activeVault.lastCheckIn}
              status={activeVault.status}
            />
          </div>

          {/* Action Execution Bar */}
          <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* "I'm Still Active" Proof-of-life Button */}
              {activeVault.status === 0 && (
                <button
                  onClick={() => checkIn(activeVault.id)}
                  disabled={txPending}
                  className="bg-primary hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded shadow transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>I'm Still Active</span>
                </button>
              )}

              {/* "Trigger Switch" button when deadline passed */}
              {isDeadlinePassed && (
                <button
                  onClick={() => triggerSwitch(activeVault.id)}
                  disabled={txPending}
                  className="bg-danger hover:bg-danger-hover text-white font-medium text-sm px-6 py-2.5 rounded shadow transition-colors flex items-center gap-2 animate-pulse"
                >
                  <Zap className="w-4 h-4" />
                  <span>Trigger Contingency Switch</span>
                </button>
              )}

              <span className="text-xs text-outline">
                {activeVault.status === 0
                  ? `Checking in submits an on-chain transaction resetting your deadline to ${formatInterval(
                      activeVault.checkInInterval
                    )} from confirmation.`
                  : activeVault.status === 1
                  ? "This contingency vault was triggered and executed."
                  : "This vault was cancelled by its owner."}
              </span>
            </div>

            {/* Local Testing Tool: Simulate Missed Deadline */}
            {activeVault.status === 0 && (
              <button
                onClick={handleSimulateExpiry}
                disabled={isSimulating || txPending}
                className="flex items-center gap-1.5 border border-outline-variant/40 hover:border-outline text-outline hover:text-on-surface font-mono text-xs px-3 py-1.5 rounded transition-colors self-start md:self-auto"
                title="Calls Hardhat evm_increaseTime to advance the local blockchain clock past the deadline"
              >
                <FastForward className="w-3.5 h-3.5 text-warning" />
                <span>Simulate Missed Deadline (Test Trigger)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Empty State CTA */
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-4">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-on-surface">No contingency vaults found</h2>
          <p className="text-sm text-outline max-w-md mt-1">
            Create your first decentralized contingency vault with customizable check-in intervals,
            beneficiary designation, and automated asset handover.
          </p>
          <div className="flex gap-3 mt-6">
            <Link
              href="/create-vault"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-medium px-5 py-2.5 rounded transition-colors flex items-center gap-2"
            >
              <span>Create New Vault</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Two-Column Telemetry & Details Grid */}
      {activeVault && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Vault Configuration Parameters */}
          <div className="lg:col-span-7 bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-outline" />
                <h2 className="text-sm font-semibold text-on-surface">Vault Configuration</h2>
              </div>
              <Link
                href="/my-vault"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <span>Manage Vault</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-outline-variant/20 text-xs">
              {/* Beneficiary */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-outline shrink-0">Beneficiary Wallet</span>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-mono text-on-surface">
                    {shortenAddress(activeVault.beneficiary, 6)}
                  </span>
                  <button
                    onClick={() => copyText(activeVault.beneficiary, "beneficiary")}
                    className="text-outline hover:text-on-surface p-0.5 rounded transition-colors"
                    title="Copy Beneficiary Address"
                  >
                    {copiedBeneficiary ? (
                      <Check className="w-3.5 h-3.5 text-secondary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-on-surface-variant font-mono">
                    Designated Heir
                  </span>
                </div>
              </div>

              {/* Vault Owner */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-outline shrink-0">Vault Creator / Owner</span>
                <div className="flex items-center gap-2 text-right font-mono text-on-surface">
                  {shortenAddress(activeVault.owner, 6)}
                  {account && activeVault.owner.toLowerCase() === account.toLowerCase() && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary-light font-mono">
                      You
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-outline shrink-0">Predefined Action</span>
                <div className="flex items-center gap-2 text-right">
                  <span className="text-on-surface font-medium">
                    {ACTION_TYPES[activeVault.actionType]?.title || "Token Transfer"}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-outline font-mono">
                    ERC-20 Handover
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-outline shrink-0">Configured Handover Amount</span>
                <div className="text-right">
                  <span className="font-mono font-medium text-on-surface">
                    {activeVault.tokenAmount} TEST
                  </span>
                  <span className="text-outline ml-1.5 font-mono">
                    (Locked: {activeVault.depositedAmount} TEST)
                  </span>
                </div>
              </div>

              {/* Check-in Interval */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-outline shrink-0">Check-In Interval</span>
                <div className="text-right">
                  <span className="text-on-surface font-medium">
                    {formatInterval(activeVault.checkInInterval)}
                  </span>
                  <span className="text-outline ml-1.5">
                    ({activeVault.checkInInterval} seconds)
                  </span>
                </div>
              </div>

              {/* Smart Contract */}
              <div className="py-3.5 flex items-center justify-between gap-4">
                <span className="text-outline shrink-0">DeadManSwitch Contract</span>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-mono text-on-surface">
                    {shortenAddress(CONTRACT_ADDRESSES.deadManSwitch, 6)}
                  </span>
                  <button
                    onClick={() => copyText(CONTRACT_ADDRESSES.deadManSwitch, "contract")}
                    className="text-outline hover:text-on-surface p-0.5 rounded transition-colors"
                    title="Copy Contract Address"
                  >
                    {copiedContract ? (
                      <Check className="w-3.5 h-3.5 text-secondary" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <span className="font-mono text-[10px] text-secondary">Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Security & Operational Telemetry */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Security Principles Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
                <Info className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider font-mono">
                  Autonomous Verification Rules
                </h3>
              </div>
              <ul className="text-xs text-on-surface-variant divide-y divide-outline-variant/10">
                <li className="py-2.5 flex items-start gap-2">
                  <span className="text-secondary font-bold">1.</span>
                  <span>
                    Smart contracts cannot self-execute. Once deadline elapses, anyone or keeper
                    bots may trigger the payout.
                  </span>
                </li>
                <li className="py-2.5 flex items-start gap-2">
                  <span className="text-secondary font-bold">2.</span>
                  <span>
                    The contract strictly calculates eligibility on-chain using block timestamps.
                    Frontend timers are visual aids only.
                  </span>
                </li>
                <li className="py-2.5 flex items-start gap-2">
                  <span className="text-secondary font-bold">3.</span>
                  <span>
                    Beneficiary designation verifies inactivity—it does not legally certify
                    incapacity or death.
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider font-mono mb-3">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/activity-log"
                  className="flex items-center gap-2 p-2.5 rounded bg-surface-container border border-outline-variant/30 hover:border-outline text-xs text-on-surface transition-colors"
                >
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Activity Log</span>
                </Link>
                <Link
                  href="/beneficiary"
                  className="flex items-center gap-2 p-2.5 rounded bg-surface-container border border-outline-variant/30 hover:border-outline text-xs text-on-surface transition-colors"
                >
                  <Zap className="w-4 h-4 text-warning" />
                  <span>Claim Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
