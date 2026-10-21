"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { useWeb3, VaultData } from "@/context/Web3Context";
import {
  shortenAddress,
  formatInterval,
  formatTimestamp,
  ACTION_TYPES,
} from "@/lib/constants";
import {
  Shield,
  Coins,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Copy,
  Check,
  Trash2,
  Edit2,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function MyVaultPage() {
  const {
    account,
    vaults,
    activeVault,
    setActiveVaultId,
    checkIn,
    cancelVault,
    updateBeneficiary,
    depositTokens,
    txPending,
  } = useWeb3();

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("50");
  const [depositVaultId, setDepositVaultId] = useState<number>(1);

  // Update Beneficiary modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState("");
  const [updateVaultId, setUpdateVaultId] = useState<number>(1);
  const [beneficiaryError, setBeneficiaryError] = useState("");

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    const ok = await depositTokens(depositVaultId, depositAmount);
    if (ok) setShowDepositModal(false);
  };

  const handleUpdateBeneficiarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ethers.isAddress(newBeneficiary.trim())) {
      setBeneficiaryError("Invalid Ethereum address format.");
      return;
    }
    if (account && newBeneficiary.trim().toLowerCase() === account.toLowerCase()) {
      setBeneficiaryError("Beneficiary cannot be your own wallet.");
      return;
    }
    const ok = await updateBeneficiary(updateVaultId, newBeneficiary.trim());
    if (ok) {
      setShowUpdateModal(false);
      setNewBeneficiary("");
      setBeneficiaryError("");
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-outline mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-on-surface">My Vaults</span>
          </div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            Vault Management & Telemetry
          </h1>
          <p className="text-sm text-outline mt-1">
            Monitor asset reserves, re-designate beneficiaries, fund liquidity, or cancel vaults.
          </p>
        </div>

        <Link
          href="/create-vault"
          className="flex items-center gap-2 px-3.5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Vault</span>
        </Link>
      </div>

      {/* Vaults List */}
      {vaults.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-12 text-center flex flex-col items-center">
          <Shield className="w-10 h-10 text-outline mb-3" />
          <h2 className="text-base font-semibold text-on-surface">No vaults deployed yet</h2>
          <p className="text-xs text-outline mt-1 max-w-sm">
            You don't have any contingency vaults deployed on the current blockchain network.
          </p>
          <Link
            href="/create-vault"
            className="mt-4 px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-medium"
          >
            Create Vault
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {vaults.map((vault) => {
            const isOwner =
              account && vault.owner.toLowerCase() === account.toLowerCase();
            const now = Math.floor(Date.now() / 1000);
            const isExpired = vault.status === 0 && now > vault.deadline;

            return (
              <div
                key={vault.id}
                className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5 flex flex-col gap-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/20 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface font-semibold">
                      #{vault.id}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-on-surface">
                        {vault.name}
                      </h3>
                      {vault.description && (
                        <p className="text-xs text-outline mt-0.5">{vault.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {vault.status === 0 && (
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#064E3B]/40 border border-[#10B981]/40 text-secondary">
                        ACTIVE
                      </span>
                    )}
                    {vault.status === 1 && (
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-primary/20 border border-primary/40 text-primary-light">
                        EXECUTED
                      </span>
                    )}
                    {vault.status === 2 && (
                      <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#232730] border border-outline-variant text-outline">
                        CANCELLED
                      </span>
                    )}
                    {isExpired && (
                      <span className="text-[11px] font-mono px-2 py-1 rounded bg-danger/20 border border-danger/40 text-danger animate-pulse">
                        TRIGGERABLE
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 text-xs">
                  <div>
                    <span className="text-outline text-[11px] block">Beneficiary</span>
                    <span className="font-mono text-on-surface mt-1 block">
                      {shortenAddress(vault.beneficiary, 4)}
                    </span>
                  </div>

                  <div>
                    <span className="text-outline text-[11px] block">Interval</span>
                    <span className="font-medium text-on-surface mt-1 block">
                      {formatInterval(vault.checkInInterval)}
                    </span>
                  </div>

                  <div>
                    <span className="text-outline text-[11px] block">Deposited / Target</span>
                    <span className="font-mono text-on-surface mt-1 block font-medium">
                      {vault.depositedAmount} / {vault.tokenAmount} TEST
                    </span>
                  </div>

                  <div>
                    <span className="text-outline text-[11px] block">Next Deadline</span>
                    <span className="font-mono text-on-surface mt-1 block">
                      {formatTimestamp(vault.deadline)}
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/"
                      onClick={() => setActiveVaultId(vault.id)}
                      className="px-3 py-1.5 rounded bg-surface-container border border-outline-variant/30 hover:border-outline text-xs text-on-surface transition-colors flex items-center gap-1.5"
                    >
                      <span>View on Dashboard</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    {vault.status === 0 && (
                      <button
                        onClick={() => checkIn(vault.id)}
                        disabled={txPending}
                        className="px-3 py-1.5 rounded bg-primary/20 border border-primary/40 hover:bg-primary/30 text-primary-light text-xs font-mono transition-colors"
                      >
                        Check In Now
                      </button>
                    )}
                  </div>

                  {vault.status === 0 && isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDepositVaultId(vault.id);
                          setShowDepositModal(true);
                        }}
                        className="px-3 py-1.5 rounded bg-surface-container border border-outline-variant/30 hover:border-outline text-xs text-on-surface transition-colors flex items-center gap-1.5"
                      >
                        <Coins className="w-3.5 h-3.5 text-primary" />
                        <span>Deposit More</span>
                      </button>

                      <button
                        onClick={() => {
                          setUpdateVaultId(vault.id);
                          setNewBeneficiary(vault.beneficiary);
                          setShowUpdateModal(true);
                        }}
                        className="px-3 py-1.5 rounded bg-surface-container border border-outline-variant/30 hover:border-outline text-xs text-on-surface transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-outline" />
                        <span>Change Beneficiary</span>
                      </button>

                      <button
                        onClick={() => cancelVault(vault.id)}
                        disabled={txPending}
                        className="px-3 py-1.5 rounded bg-danger/10 border border-danger/30 hover:bg-danger/20 text-danger text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Cancel Vault</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-on-surface pb-3 border-b border-outline-variant/20">
              Deposit Tokens into Vault #{depositVaultId}
            </h3>
            <form onSubmit={handleDepositSubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-mono text-outline uppercase tracking-wider mb-1">
                  TEST Token Amount
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                  <span className="px-3 py-2 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-xs text-on-surface">
                    TEST
                  </span>
                </div>
                <p className="text-[11px] text-outline mt-1.5">
                  Tokens will be safely transferred to the DeadManSwitch contract.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 rounded text-xs text-outline hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={txPending}
                  className="px-5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-medium"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Beneficiary Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-on-surface pb-3 border-b border-outline-variant/20">
              Update Beneficiary for Vault #{updateVaultId}
            </h3>
            <form onSubmit={handleUpdateBeneficiarySubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-mono text-outline uppercase tracking-wider mb-1">
                  New Beneficiary Address
                </label>
                <input
                  type="text"
                  value={newBeneficiary}
                  onChange={(e) => {
                    setNewBeneficiary(e.target.value);
                    setBeneficiaryError("");
                  }}
                  placeholder="0x..."
                  className="w-full bg-surface-container border border-outline-variant/40 rounded px-3 py-2 text-sm font-mono text-on-surface focus:outline-none focus:border-primary"
                />
                {beneficiaryError && (
                  <p className="text-xs text-danger font-mono mt-1">{beneficiaryError}</p>
                )}
                <p className="text-[11px] text-outline mt-1.5">
                  Only the current owner can update the beneficiary while active.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 rounded text-xs text-outline hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={txPending}
                  className="px-5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-medium"
                >
                  Update Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
