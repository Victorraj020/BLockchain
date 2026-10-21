"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Context";
import { CONTRACT_ADDRESSES, shortenAddress, formatTimestamp, SEPOLIA_CHAIN_ID } from "@/lib/constants";
import DeadManSwitchABI from "@/contracts/DeadManSwitchABI.json";
import {
  History,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Coins,
  ShieldPlus,
  UserCheck,
  Zap,
  Trash2,
  RefreshCw,
  Filter,
} from "lucide-react";

interface ActivityItem {
  id: string;
  eventName: string;
  vaultId: number;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  details: string;
  account: string;
}

export default function ActivityLogPage() {
  const { chainId, txPending } = useWeb3();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_LOCAL_RPC || "http://127.0.0.1:8545"
      );
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.deadManSwitch,
        DeadManSwitchABI,
        provider
      );

      // Query past events from block 0
      const [
        createdLogs,
        fundedLogs,
        checkedInLogs,
        beneficiaryLogs,
        switchLogs,
        actionLogs,
        cancelledLogs,
      ] = await Promise.all([
        contract.queryFilter(contract.filters.VaultCreated(), 0, "latest"),
        contract.queryFilter(contract.filters.VaultFunded(), 0, "latest"),
        contract.queryFilter(contract.filters.CheckedIn(), 0, "latest"),
        contract.queryFilter(contract.filters.BeneficiaryUpdated(), 0, "latest"),
        contract.queryFilter(contract.filters.SwitchTriggered(), 0, "latest"),
        contract.queryFilter(contract.filters.ActionExecuted(), 0, "latest"),
        contract.queryFilter(contract.filters.VaultCancelled(), 0, "latest"),
      ]);

      const items: ActivityItem[] = [];

      // Helper to process logs
      for (const log of createdLogs as any[]) {
        items.push({
          id: `${log.transactionHash}-${log.index}`,
          eventName: "VaultCreated",
          vaultId: Number(log.args.vaultId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Math.floor(Date.now() / 1000) - (100 - log.blockNumber) * 12,
          details: `Vault initialized with ${ethers.formatEther(log.args.tokenAmount)} TEST for heir ${shortenAddress(log.args.beneficiary, 4)}`,
          account: log.args.owner,
        });
      }

      for (const log of fundedLogs as any[]) {
        items.push({
          id: `${log.transactionHash}-${log.index}`,
          eventName: "VaultFunded",
          vaultId: Number(log.args.vaultId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Math.floor(Date.now() / 1000) - (100 - log.blockNumber) * 12,
          details: `Deposited ${ethers.formatEther(log.args.amountFunded)} TEST (Balance: ${ethers.formatEther(log.args.totalDeposited)} TEST)`,
          account: log.args.funder,
        });
      }

      for (const log of checkedInLogs as any[]) {
        items.push({
          id: `${log.transactionHash}-${log.index}`,
          eventName: "CheckedIn",
          vaultId: Number(log.args.vaultId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Number(log.args.timestamp),
          details: `Proof of life verified. New deadline: ${formatTimestamp(Number(log.args.newDeadline))}`,
          account: log.args.owner,
        });
      }

      for (const log of beneficiaryLogs as any[]) {
        items.push({
          id: `${log.transactionHash}-${log.index}`,
          eventName: "BeneficiaryUpdated",
          vaultId: Number(log.args.vaultId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Math.floor(Date.now() / 1000) - (100 - log.blockNumber) * 12,
          details: `Beneficiary changed to ${shortenAddress(log.args.newBeneficiary, 4)}`,
          account: log.args.newBeneficiary,
        });
      }

      for (const log of switchLogs as any[]) {
        items.push({
          id: `${log.transactionHash}-${log.index}`,
          eventName: "SwitchTriggered",
          vaultId: Number(log.args.vaultId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Number(log.args.timestamp),
          details: `Switch triggered autonomously by caller ${shortenAddress(log.args.caller, 4)}`,
          account: log.args.caller,
        });
      }

      for (const log of actionLogs as any[]) {
        items.push({
          id: `${log.transactionHash}-${log.index}`,
          eventName: "ActionExecuted",
          vaultId: Number(log.args.vaultId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Math.floor(Date.now() / 1000) - (100 - log.blockNumber) * 12,
          details: `Contingency executed: ${ethers.formatEther(log.args.amountTransferred)} TEST sent to beneficiary ${shortenAddress(log.args.beneficiary, 4)}`,
          account: log.args.beneficiary,
        });
      }

      for (const log of cancelledLogs as any[]) {
        items.push({
          id: `${log.transactionHash}-${log.index}`,
          eventName: "VaultCancelled",
          vaultId: Number(log.args.vaultId),
          txHash: log.transactionHash,
          blockNumber: log.blockNumber,
          timestamp: Math.floor(Date.now() / 1000) - (100 - log.blockNumber) * 12,
          details: `Vault cancelled by owner. Refunded ${ethers.formatEther(log.args.refundAmount)} TEST`,
          account: log.args.owner,
        });
      }

      // Sort newest block first
      items.sort((a, b) => b.blockNumber - a.blockNumber);
      setActivities(items);
    } catch (err) {
      console.warn("Could not query contract events:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const copyTx = (txHash: string, id: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getEventBadge = (name: string) => {
    switch (name) {
      case "VaultCreated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary-light font-mono text-[11px]">
            <ShieldPlus className="w-3 h-3" />
            VaultCreated
          </span>
        );
      case "VaultFunded":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary/20 text-secondary font-mono text-[11px]">
            <Coins className="w-3 h-3" />
            VaultFunded
          </span>
        );
      case "CheckedIn":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#064E3B]/60 text-secondary font-mono text-[11px]">
            <ShieldCheck className="w-3 h-3" />
            CheckedIn
          </span>
        );
      case "BeneficiaryUpdated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-warning/20 text-warning font-mono text-[11px]">
            <UserCheck className="w-3 h-3" />
            BeneficiaryUpdated
          </span>
        );
      case "SwitchTriggered":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-danger/20 text-danger font-mono text-[11px]">
            <Zap className="w-3 h-3" />
            SwitchTriggered
          </span>
        );
      case "ActionExecuted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/30 text-primary-light font-mono text-[11px]">
            <Zap className="w-3 h-3" />
            ActionExecuted
          </span>
        );
      case "VaultCancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-outline font-mono text-[11px]">
            <Trash2 className="w-3 h-3" />
            VaultCancelled
          </span>
        );
      default:
        return <span className="font-mono text-xs">{name}</span>;
    }
  };

  const filteredActivities =
    selectedFilter === "ALL"
      ? activities
      : activities.filter((a) => a.eventName === selectedFilter);

  const isSepolia = chainId === SEPOLIA_CHAIN_ID;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-outline mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-on-surface">Activity Log</span>
          </div>
          <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
            Cryptographic Activity & Event Log
          </h1>
          <p className="text-sm text-outline mt-1">
            Immutable blockchain event stream queried directly from the DeadManSwitch smart contract.
          </p>
        </div>

        <button
          onClick={fetchEvents}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-surface-container border border-outline-variant/40 hover:border-outline text-xs text-on-surface font-mono transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Events</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        {["ALL", "CheckedIn", "VaultCreated", "VaultFunded", "SwitchTriggered", "ActionExecuted", "VaultCancelled"].map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                selectedFilter === filter
                  ? "bg-primary text-white font-medium"
                  : "bg-surface-container-low border border-outline-variant/30 text-outline hover:text-on-surface"
              }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* Activity Table */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-outline">
            Querying blockchain event logs...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-outline">
            No events found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-lowest font-mono text-outline uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Vault ID</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Block</th>
                  <th className="py-3 px-4 text-right">Transaction Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 font-mono">
                {filteredActivities.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container/40 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getEventBadge(item.eventName)}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface font-semibold">
                      #{item.vaultId}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface font-sans max-w-xs truncate">
                      {item.details}
                    </td>
                    <td className="py-3.5 px-4 text-outline whitespace-nowrap">
                      {shortenAddress(item.account, 4)}
                    </td>
                    <td className="py-3.5 px-4 text-outline">
                      {item.blockNumber}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-on-surface text-[11px]">
                          {shortenAddress(item.txHash, 4)}
                        </span>
                        <button
                          onClick={() => copyTx(item.txHash, item.id)}
                          className="text-outline hover:text-on-surface p-1 rounded transition-colors"
                          title="Copy Full Transaction Hash"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-secondary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {isSepolia && (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${item.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline p-1"
                            title="View on Etherscan"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
