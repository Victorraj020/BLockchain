"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import {
  CONTRACT_ADDRESSES,
  LOCAL_CHAIN_ID,
  SEPOLIA_CHAIN_ID,
  SUPPORTED_NETWORKS,
  shortenAddress,
} from "@/lib/constants";
import {
  Sliders,
  Coins,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Server,
  Layers,
  Key,
  ShieldAlert,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const {
    account,
    chainId,
    switchNetwork,
    claimFaucet,
    txPending,
    tokenBalance,
  } = useWeb3();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Well-known Hardhat default accounts for local MetaMask import
  const hardhatTestAccounts = [
    {
      role: "Account #0 (Deployer / Vault Owner)",
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      privateKey:
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    },
    {
      role: "Account #1 (Default Heir / Beneficiary)",
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      privateKey:
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    },
    {
      role: "Account #2 (Third-Party Trigger / Keeper)",
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      privateKey:
        "0x5de4111afa1a4b9340f6c245970c0c2a71a06709f61b0a7019685a49c288fae1",
    },
  ];

  return (
    <div className="max-w-4xl flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="flex items-center gap-1.5 font-mono text-xs text-outline mb-1">
          <span>Workspace</span>
          <span>/</span>
          <span className="text-on-surface">Settings</span>
        </div>
        <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
          System Configuration & Developer Hub
        </h1>
        <p className="text-sm text-outline mt-1">
          Manage local RPC parameters, inspect deployed contract artifacts, claim test tokens, and access dev test keys.
        </p>
      </div>

      {/* Network Configuration */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
        <div className="flex items-center gap-2 pb-4 border-b border-outline-variant/20">
          <Server className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-on-surface">Blockchain Network Status</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Hardhat Local */}
          <div
            className={`p-4 rounded border transition-colors ${
              chainId === LOCAL_CHAIN_ID
                ? "bg-primary/10 border-primary"
                : "bg-surface-container border-outline-variant/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-on-surface">Hardhat Localhost</span>
              {chainId === LOCAL_CHAIN_ID ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/20 text-secondary">
                  Active
                </span>
              ) : (
                <button
                  onClick={() => switchNetwork(LOCAL_CHAIN_ID)}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  Switch
                </button>
              )}
            </div>
            <p className="font-mono text-[11px] text-outline mt-2">Chain ID: 31337</p>
            <p className="font-mono text-[11px] text-outline">RPC: http://127.0.0.1:8545</p>
          </div>

          {/* Sepolia Testnet */}
          <div
            className={`p-4 rounded border transition-colors ${
              chainId === SEPOLIA_CHAIN_ID
                ? "bg-primary/10 border-primary"
                : "bg-surface-container border-outline-variant/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-on-surface">Ethereum Sepolia</span>
              {chainId === SEPOLIA_CHAIN_ID ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/20 text-secondary">
                  Active
                </span>
              ) : (
                <button
                  onClick={() => switchNetwork(SEPOLIA_CHAIN_ID)}
                  className="text-xs text-primary hover:underline font-mono"
                >
                  Switch
                </button>
              )}
            </div>
            <p className="font-mono text-[11px] text-outline mt-2">Chain ID: 11155111</p>
            <p className="font-mono text-[11px] text-outline">Explorer: sepolia.etherscan.io</p>
          </div>
        </div>
      </div>

      {/* Contract Deployments */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
        <div className="flex items-center gap-2 pb-4 border-b border-outline-variant/20">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-on-surface">Deployed Smart Contracts</h2>
        </div>

        <div className="divide-y divide-outline-variant/20 mt-2 text-xs">
          {/* DeadManSwitch */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-medium text-on-surface">DeadManSwitch.sol</span>
              <p className="text-[11px] text-outline">
                Main vault controller, deadline logic, and execution state machine.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-on-surface bg-surface-container px-2 py-1 rounded border border-outline-variant/30">
                {CONTRACT_ADDRESSES.deadManSwitch}
              </span>
              <button
                onClick={() => copyText(CONTRACT_ADDRESSES.deadManSwitch, "dms")}
                className="text-outline hover:text-on-surface p-1 rounded"
              >
                {copiedKey === "dms" ? (
                  <Check className="w-3.5 h-3.5 text-secondary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* TestToken */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-medium text-on-surface">TestToken.sol (TEST)</span>
              <p className="text-[11px] text-outline">
                Mock ERC-20 token with public faucet for local and testnet simulation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-on-surface bg-surface-container px-2 py-1 rounded border border-outline-variant/30">
                {CONTRACT_ADDRESSES.testToken}
              </span>
              <button
                onClick={() => copyText(CONTRACT_ADDRESSES.testToken, "token")}
                className="text-outline hover:text-on-surface p-1 rounded"
              >
                {copiedKey === "token" ? (
                  <Check className="w-3.5 h-3.5 text-secondary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Test Token Faucet */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-on-surface">Test Token Faucet (TEST)</h2>
          </div>
          <span className="font-mono text-xs text-outline">
            Current Balance: <strong className="text-on-surface">{tokenBalance} TEST</strong>
          </span>
        </div>

        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-outline max-w-lg">
            <p>
              Claim 1,000 TEST tokens directly to your connected wallet. These are exclusively for testing the contingency vault on local or testnet environments and have zero real-world monetary value.
            </p>
          </div>
          <button
            onClick={() => claimFaucet()}
            disabled={txPending}
            className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-medium px-5 py-2.5 rounded shadow transition-colors flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claim 1,000 TEST</span>
          </button>
        </div>
      </div>

      {/* Local Hardhat Test Wallets */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
          <Key className="w-4 h-4 text-warning" />
          <h2 className="text-sm font-semibold text-on-surface">
            Local Hardhat Test Accounts (Pre-Funded with 10,000 ETH)
          </h2>
        </div>
        <p className="text-xs text-outline mt-2 mb-4">
          Import these well-known local test private keys into your Web3 wallet to easily test the owner, beneficiary, and trigger roles:
        </p>

        <div className="space-y-3 text-xs font-mono">
          {hardhatTestAccounts.map((acc, idx) => (
            <div
              key={idx}
              className="p-3 rounded bg-surface-container border border-outline-variant/30 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between font-sans">
                <span className="font-semibold text-on-surface text-xs">{acc.role}</span>
                <span className="text-[10px] text-secondary font-mono">Local Test Account</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-outline">
                <span>Address: {acc.address}</span>
                <button
                  onClick={() => copyText(acc.address, `addr-${idx}`)}
                  className="hover:text-on-surface"
                  title="Copy Address"
                >
                  {copiedKey === `addr-${idx}` ? (
                    <Check className="w-3 h-3 text-secondary" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-outline">
                <span className="truncate max-w-md">Private Key: {acc.privateKey}</span>
                <button
                  onClick={() => copyText(acc.privateKey, `pk-${idx}`)}
                  className="hover:text-on-surface"
                  title="Copy Private Key"
                >
                  {copiedKey === `pk-${idx}` ? (
                    <Check className="w-3 h-3 text-secondary" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
