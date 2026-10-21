"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Shield,
  UserCheck,
  History,
  Sliders,
  PlusCircle,
  Copy,
  Check,
  Wallet,
  Menu,
  X,
  Lock,
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { shortenAddress } from "@/lib/constants";

export default function Sidebar() {
  const pathname = usePathname();
  const { account, networkName } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutGrid },
    { name: "My Vault", href: "/my-vault", icon: Shield },
    { name: "Create Vault", href: "/create-vault", icon: PlusCircle },
    { name: "Beneficiary", href: "/beneficiary", icon: UserCheck },
    { name: "Activity Log", href: "/activity-log", icon: History },
    { name: "Settings", href: "/settings", icon: Sliders },
  ];

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-outline-variant/40 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-primary/20 border border-primary/50 flex items-center justify-center text-primary">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-on-surface uppercase">
              Dead-Man Switch
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-outline hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-1 p-2 mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-[13px] transition-colors ${
                  isActive
                    ? "bg-surface-container-high text-primary border-l-2 border-primary font-medium"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-outline"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-outline-variant/40 flex flex-col gap-2 bg-surface-container-lowest">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-on-surface-variant text-[11px] truncate max-w-[120px]">
              {networkName}
            </span>
          </div>
          <span className="text-outline text-[11px]">v1.0</span>
        </div>

        {account ? (
          <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/40 rounded text-xs font-mono">
            <div className="flex items-center gap-1.5 truncate">
              <Wallet className="w-3.5 h-3.5 text-outline shrink-0" />
              <span className="text-on-surface text-[11px] truncate">
                {shortenAddress(account, 4)}
              </span>
            </div>
            <button
              onClick={copyAddress}
              className="text-outline hover:text-on-surface transition-colors p-0.5"
              title="Copy Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-outline px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded text-center font-mono">
            Wallet Disconnected
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-surface-container border border-outline-variant/40 rounded text-on-surface shadow-md"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-[230px] bg-surface-container-lowest border-r border-outline-variant/40 z-50 select-none transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
