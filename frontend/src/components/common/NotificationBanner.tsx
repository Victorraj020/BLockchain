"use client";

import React from "react";
import { useWeb3 } from "@/context/Web3Context";
import { CheckCircle2, AlertCircle, Loader2, X, ExternalLink, Copy } from "lucide-react";
import { shortenAddress } from "@/lib/constants";

export default function NotificationBanner() {
  const {
    txPending,
    txError,
    txSuccessMessage,
    lastTxHash,
    chainId,
    clearNotifications,
  } = useWeb3();

  if (!txPending && !txError && !txSuccessMessage) return null;

  const isSepolia = chainId === 11155111;
  const explorerUrl = isSepolia && lastTxHash ? `https://sepolia.etherscan.io/tx/${lastTxHash}` : null;

  const copyTxHash = () => {
    if (lastTxHash) {
      navigator.clipboard.writeText(lastTxHash);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom duration-200">
      {/* Pending State */}
      {txPending && (
        <div className="bg-[#14161B] border border-primary/40 rounded-lg p-4 shadow-xl flex items-start gap-3 text-on-surface">
          <Loader2 className="w-5 h-5 text-primary animate-spin mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-primary">Transaction in Progress</p>
            <p className="text-on-surface-variant text-xs mt-0.5">
              {txSuccessMessage || "Confirming transaction on the blockchain. Please wait..."}
            </p>
            {lastTxHash && (
              <p className="font-mono text-[11px] text-outline mt-1.5 truncate">
                Tx: {shortenAddress(lastTxHash, 8)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {!txPending && txSuccessMessage && (
        <div className="bg-[#14161B] border border-secondary/40 rounded-lg p-4 shadow-xl flex items-start gap-3 text-on-surface">
          <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-secondary">Success</p>
            <p className="text-on-surface-variant text-xs mt-0.5">{txSuccessMessage}</p>
            {lastTxHash && (
              <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-outline">
                <span>Tx: {shortenAddress(lastTxHash, 6)}</span>
                <button
                  onClick={copyTxHash}
                  className="hover:text-on-surface p-0.5 rounded transition-colors"
                  title="Copy Tx Hash"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-0.5 ml-1"
                  >
                    <span>View on Etherscan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
          <button
            onClick={clearNotifications}
            className="text-outline hover:text-on-surface transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error State */}
      {!txPending && txError && (
        <div className="bg-[#14161B] border border-danger/40 rounded-lg p-4 shadow-xl flex items-start gap-3 text-on-surface">
          <AlertCircle className="w-5 h-5 text-danger mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-danger">Transaction Notice</p>
            <p className="text-on-surface-variant text-xs mt-0.5 break-words">{txError}</p>
          </div>
          <button
            onClick={clearNotifications}
            className="text-outline hover:text-on-surface transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
