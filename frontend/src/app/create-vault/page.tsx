"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Context";
import {
  INTERVAL_OPTIONS,
  ACTION_TYPES,
  shortenAddress,
  formatInterval,
} from "@/lib/constants";
import {
  ShieldPlus,
  Coins,
  FileCode,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
} from "lucide-react";

export default function CreateVaultPage() {
  const router = useRouter();
  const { account, isConnected, connectWallet, approveAndCreateVault, txPending } = useWeb3();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [checkInInterval, setCheckInInterval] = useState(60); // Default to 1-minute demo interval
  const [actionType, setActionType] = useState(0); // 0: Transfer Tokens
  const [tokenAmount, setTokenAmount] = useState("100");
  const [payloadHash, setPayloadHash] = useState("");

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = "Vault name is required.";
    }

    if (!beneficiary.trim()) {
      errs.beneficiary = "Beneficiary address is required.";
    } else if (!ethers.isAddress(beneficiary.trim())) {
      errs.beneficiary = "Invalid Ethereum address format (must start with 0x...).";
    } else if (account && beneficiary.trim().toLowerCase() === account.toLowerCase()) {
      errs.beneficiary = "Beneficiary cannot be your own wallet address.";
    }

    if (!checkInInterval || checkInInterval < 60) {
      errs.checkInInterval = "Check-in interval must be at least 60 seconds.";
    }

    if (actionType === 0) {
      if (!tokenAmount || parseFloat(tokenAmount) <= 0 || isNaN(parseFloat(tokenAmount))) {
        errs.tokenAmount = "Please specify a positive TEST token handover amount.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }
    if (validateForm()) {
      setShowReviewModal(true);
    }
  };

  const handleFinalSubmit = async () => {
    setShowReviewModal(false);
    const result = await approveAndCreateVault({
      name: name.trim(),
      description: description.trim(),
      beneficiary: beneficiary.trim(),
      checkInInterval,
      actionType,
      tokenAmount: actionType === 0 ? tokenAmount.trim() : "0",
      payloadHash: payloadHash.trim() || "ipfs://QmDefaultContingencyManifestHash",
    });

    if (result.success) {
      router.push("/");
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-outline mb-1">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-on-surface">Create Vault</span>
        </div>
        <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
          Initialize Contingency Vault
        </h1>
        <p className="text-sm text-outline mt-1">
          Configure autonomous proof-of-life parameters, beneficiary designations, and emergency handover actions.
        </p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleReview} className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 flex flex-col gap-6">
        {/* Vault Name & Description */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1.5">
              Vault Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="e.g. Master Contingency Vault #01"
              className={`w-full bg-surface-container border ${
                errors.name ? "border-danger" : "border-outline-variant/40"
              } focus:border-primary rounded px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none`}
            />
            {errors.name && <p className="text-xs text-danger mt-1 font-mono">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1.5">
              Vault Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Private contingency instructions, emergency notes or vault purpose..."
              className="w-full bg-surface-container border border-outline-variant/40 focus:border-primary rounded px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
          </div>
        </div>

        {/* Check-In Interval */}
        <div className="pt-4 border-t border-outline-variant/20">
          <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-2">
            Check-In Interval <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTERVAL_OPTIONS.map((opt) => (
              <div
                key={opt.value}
                onClick={() => setCheckInInterval(opt.value)}
                className={`cursor-pointer p-3 rounded border transition-all ${
                  checkInInterval === opt.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-surface-container border-outline-variant/30 hover:border-outline text-on-surface-variant"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-on-surface">{opt.label}</span>
                  {checkInInterval === opt.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  )}
                </div>
                <p className="text-[11px] text-outline mt-1">{opt.description}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-outline mt-2 font-mono">
            * Note: For local demonstration, the 1-minute interval is recommended for rapid testing.
          </p>
        </div>

        {/* Beneficiary Address */}
        <div className="pt-4 border-t border-outline-variant/20">
          <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-1.5">
            Beneficiary Wallet Address <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => {
              setBeneficiary(e.target.value);
              if (errors.beneficiary) setErrors({ ...errors, beneficiary: "" });
            }}
            placeholder="0x..."
            className={`w-full bg-surface-container border font-mono ${
              errors.beneficiary ? "border-danger" : "border-outline-variant/40"
            } focus:border-primary rounded px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none`}
          />
          {errors.beneficiary && (
            <p className="text-xs text-danger mt-1 font-mono">{errors.beneficiary}</p>
          )}
          <p className="text-[11px] text-outline mt-1">
            The Ethereum address authorized to trigger and receive the contingency handover upon missed check-in.
          </p>
        </div>

        {/* Action Type Selection */}
        <div className="pt-4 border-t border-outline-variant/20">
          <label className="block text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-2">
            Contingency Action <span className="text-danger">*</span>
          </label>
          <div className="flex flex-col gap-2.5">
            {ACTION_TYPES.map((act) => (
              <div
                key={act.id}
                onClick={() => setActionType(act.id)}
                className={`cursor-pointer p-3.5 rounded border transition-all ${
                  actionType === act.id
                    ? "bg-primary/10 border-primary"
                    : "bg-surface-container border-outline-variant/30 hover:border-outline"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-on-surface">{act.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-outline font-mono">
                      {act.subtitle}
                    </span>
                  </div>
                  {actionType === act.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-xs text-outline mt-1">{act.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Details based on Action Type */}
        {actionType === 0 && (
          <div className="p-4 rounded bg-surface-container border border-outline-variant/40 flex flex-col gap-2">
            <label className="block text-xs font-mono text-on-surface uppercase tracking-wider">
              TEST Token Handover Amount <span className="text-danger">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                min="0"
                value={tokenAmount}
                onChange={(e) => {
                  setTokenAmount(e.target.value);
                  if (errors.tokenAmount) setErrors({ ...errors, tokenAmount: "" });
                }}
                className={`w-full bg-surface-container-low border ${
                  errors.tokenAmount ? "border-danger" : "border-outline-variant/40"
                } focus:border-primary rounded px-3 py-2 text-sm font-mono text-on-surface focus:outline-none`}
              />
              <span className="px-3 py-2 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-xs text-on-surface">
                TEST
              </span>
            </div>
            {errors.tokenAmount && (
              <p className="text-xs text-danger font-mono">{errors.tokenAmount}</p>
            )}
            <p className="text-[11px] text-outline">
              Requires explicit ERC-20 token approval in MetaMask before vault creation.
            </p>
          </div>
        )}

        {actionType !== 0 && (
          <div className="p-4 rounded bg-surface-container border border-outline-variant/40 flex flex-col gap-2">
            <label className="block text-xs font-mono text-on-surface uppercase tracking-wider">
              Encrypted Payload / IPFS CID Reference
            </label>
            <input
              type="text"
              value={payloadHash}
              onChange={(e) => setPayloadHash(e.target.value)}
              placeholder="e.g. ipfs://QmEncryptedSecretPayloadCid..."
              className="w-full bg-surface-container-low border border-outline-variant/40 focus:border-primary rounded px-3 py-2 text-sm font-mono text-on-surface focus:outline-none"
            />
            <p className="text-[11px] text-outline">
              Decentralized pointer to client-side encrypted secret payload. Plaintext secrets are never stored on-chain.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
          <p className="text-xs text-outline font-mono">
            Requires on-chain smart contract deployment transaction.
          </p>
          <button
            type="submit"
            disabled={txPending}
            className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-medium px-6 py-2.5 rounded shadow transition-colors flex items-center gap-2"
          >
            <ShieldPlus className="w-4 h-4" />
            <span>Review & Initialize Vault</span>
          </button>
        </div>
      </form>

      {/* Confirmation Summary Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-on-surface pb-3 border-b border-outline-variant/20">
              Confirm Vault Deployment
            </h3>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-outline">Vault Name</span>
                <span className="text-on-surface font-medium">{name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-outline">Check-In Frequency</span>
                <span className="text-on-surface font-mono font-medium">
                  {formatInterval(checkInInterval)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-outline">Beneficiary</span>
                <span className="text-on-surface font-mono">
                  {shortenAddress(beneficiary, 6)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/10">
                <span className="text-outline">Action</span>
                <span className="text-on-surface">
                  {ACTION_TYPES[actionType]?.title}
                </span>
              </div>
              {actionType === 0 && (
                <div className="flex justify-between py-1 border-b border-outline-variant/10">
                  <span className="text-outline">Token Handover</span>
                  <span className="text-on-surface font-mono font-medium">
                    {tokenAmount} TEST
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 rounded bg-surface-container border border-outline-variant/30 text-xs text-outline mb-4">
              <p>
                Clicking confirm will request your signature in MetaMask to create the vault
                {actionType === 0 ? " and deposit the configured test tokens." : "."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded text-xs text-outline hover:text-on-surface transition-colors"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={txPending}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-medium px-5 py-2 rounded shadow transition-colors flex items-center gap-1.5"
              >
                <span>Deploy to Blockchain</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
