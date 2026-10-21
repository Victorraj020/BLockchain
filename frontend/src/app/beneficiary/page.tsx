"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import {
  shortenAddress,
  formatInterval,
  formatTimestamp,
  ACTION_TYPES,
} from "@/lib/constants";
import {
  UserCheck,
  ShieldAlert,
  Zap,
  Info,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function BeneficiaryPage() {
  const { account, vaults, triggerSwitch, txPending } = useWeb3();
  const [lookupAddress, setLookupAddress] = useState("");

  const targetAddress = lookupAddress.trim() || account || "";

  // Filter vaults where targetAddress is the beneficiary
  const beneficiaryVaults = vaults.filter(
    (v) =>
      targetAddress &&
      v.beneficiary.toLowerCase() === targetAddress.toLowerCase()
  );

  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-outline mb-1">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-on-surface">Beneficiary Portal</span>
        </div>
        <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
          Beneficiary Contingency Portal
        </h1>
        <p className="text-sm text-outline mt-1">
          Review designated contingency vaults, monitor check-in status, and trigger asset handover when deadlines lapse.
        </p>
      </div>

      {/* Critical Legal & Blockchain Disclaimer Banner */}
      <div className="bg-[#1A1D24] border-l-4 border-warning border border-outline-variant/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-on-surface-variant leading-relaxed">
          <p className="font-semibold text-on-surface text-sm">
            Blockchain Protocol Clarification & Non-Proof Notice
          </p>
          <p className="mt-1">
            Designation as a beneficiary does <strong className="text-on-surface">not</strong> prove legal entitlement, incapacity, or death of the vault creator. A smart contract cannot verify real-world vital signs; it solely monitors whether cryptographic check-ins have lapsed within the configured time parameter. Once the deadline passes without owner renewal, the contract unlocks execution permissions autonomously.
          </p>
        </div>
      </div>

      {/* Address Filter & Search */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-outline w-full sm:w-auto">
          <span>Active Filter:</span>
          <span className="text-on-surface px-2 py-1 rounded bg-surface-container border border-outline-variant/40 font-medium">
            {targetAddress ? shortenAddress(targetAddress, 6) : "None (Connect Wallet or Search)"}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Lookup by address (0x...)"
              value={lookupAddress}
              onChange={(e) => setLookupAddress(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/40 rounded pl-8 pr-3 py-1.5 text-xs font-mono text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
            />
          </div>
          {lookupAddress && (
            <button
              onClick={() => setLookupAddress("")}
              className="text-xs text-outline hover:text-on-surface px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Beneficiary Vaults Display */}
      {beneficiaryVaults.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-12 text-center flex flex-col items-center">
          <UserCheck className="w-10 h-10 text-outline mb-3" />
          <h2 className="text-base font-semibold text-on-surface">No beneficiary assignments found</h2>
          <p className="text-xs text-outline mt-1 max-w-md">
            The address {targetAddress ? shortenAddress(targetAddress, 6) : "currently inspected"} is not listed as the beneficiary on any active or executed contingency vaults.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {beneficiaryVaults.map((vault) => {
            const isEligible = vault.status === 0 && now > vault.deadline;
            const isExecuted = vault.status === 1;
            const isCancelled = vault.status === 2;

            return (
              <div
                key={vault.id}
                className={`bg-surface-container-low border rounded-lg p-5 flex flex-col gap-4 shadow-sm transition-colors ${
                  isEligible
                    ? "border-danger/60 bg-danger/5"
                    : "border-outline-variant/30"
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/20 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface">
                        Vault #{vault.id}
                      </span>
                      <h3 className="text-base font-semibold text-on-surface">{vault.name}</h3>
                    </div>
                    {vault.description && (
                      <p className="text-xs text-outline mt-1">{vault.description}</p>
                    )}
                  </div>

                  <div>
                    {isEligible && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-danger/20 border border-danger/40 text-xs font-mono text-danger font-medium animate-pulse">
                        <Zap className="w-3.5 h-3.5" />
                        <span>ACTION ELIGIBLE FOR TRIGGER</span>
                      </span>
                    )}
                    {!isEligible && vault.status === 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#064E3B]/40 border border-[#10B981]/40 text-xs font-mono text-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>ACTIVE — PENDING DEADLINE</span>
                      </span>
                    )}
                    {isExecuted && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary/20 border border-primary/40 text-xs font-mono text-primary-light">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        <span>ACTION EXECUTED</span>
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-xs font-mono px-3 py-1 rounded bg-[#232730] border border-outline-variant text-outline">
                        CANCELLED BY OWNER
                      </span>
                    )}
                  </div>
                </div>

                {/* Telemetry info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 text-xs">
                  <div>
                    <span className="text-outline text-[11px] block">Vault Creator / Owner</span>
                    <span className="font-mono text-on-surface mt-1 block">
                      {shortenAddress(vault.owner, 4)}
                    </span>
                  </div>

                  <div>
                    <span className="text-outline text-[11px] block">Contingency Action</span>
                    <span className="font-medium text-on-surface mt-1 block">
                      {ACTION_TYPES[vault.actionType]?.title || "Token Transfer"}
                    </span>
                  </div>

                  <div>
                    <span className="text-outline text-[11px] block">Contingency Payout</span>
                    <span className="font-mono text-on-surface mt-1 block font-medium">
                      {vault.tokenAmount} TEST
                    </span>
                  </div>

                  <div>
                    <span className="text-outline text-[11px] block">Check-In Deadline</span>
                    <span className="font-mono text-on-surface mt-1 block">
                      {formatTimestamp(vault.deadline)}
                    </span>
                  </div>
                </div>

                {/* Execution Bar */}
                {isEligible && (
                  <div className="p-4 rounded bg-surface-container border border-danger/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-semibold text-danger">Check-In Deadline Has Elapsed</p>
                      <p className="text-outline mt-0.5">
                        The vault owner failed to perform proof-of-life before the deadline. Smart contract rules allow any authorized caller to trigger the configured action.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerSwitch(vault.id)}
                      disabled={txPending}
                      className="bg-danger hover:bg-danger-hover text-white text-xs font-medium px-5 py-2.5 rounded shadow transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Trigger Switch & Claim</span>
                    </button>
                  </div>
                )}

                {isExecuted && (
                  <div className="p-3 rounded bg-surface-container border border-outline-variant/30 text-xs text-outline font-mono flex items-center justify-between">
                    <span>
                      Tokens ({vault.tokenAmount} TEST) were successfully transferred to your address.
                    </span>
                    <span className="text-secondary font-medium">Completed</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
