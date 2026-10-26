"use client";

import React, { useState, useEffect } from "react";
import { formatTimestamp } from "@/lib/constants";
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface CountdownTimerProps {
  deadline: number;
  lastCheckIn: number;
  status: number; // 0: ACTIVE, 1: EXECUTED, 2: CANCELLED
}

export default function CountdownTimer({
  deadline,
  lastCheckIn,
  status,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    function calculateTime() {
      const now = Math.floor(Date.now() / 1000);
      const diff = deadline - now;

      if (diff <= 0 || status !== 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: diff <= 0 && status === 0,
        });
        return;
      }

      const days = Math.floor(diff / (24 * 3600));
      const hours = Math.floor((diff % (24 * 3600)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
      });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline, status]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const getStatusBadge = () => {
    if (status === 1) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/20 border border-primary/40 text-[11px] font-mono text-primary-light font-medium tracking-wide">
          <CheckCircle className="w-3.5 h-3.5 text-primary" />
          <span>ACTION EXECUTED</span>
        </div>
      );
    }
    if (status === 2) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#232730] border border-outline-variant text-[11px] font-mono text-on-surface-variant font-medium tracking-wide">
          <span>VAULT CANCELLED</span>
        </div>
      );
    }
    if (timeLeft.isExpired) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-danger/20 border border-danger/50 text-[11px] font-mono text-danger font-medium tracking-wide animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>DEADLINE LAPSED (TRIGGERABLE)</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#064E3B]/40 border border-[#10B981]/40 text-[11px] font-mono text-secondary font-medium tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
        <span>ACTIVE VAULT</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header telemetry info */}
      <div className="flex flex-col gap-1.5 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge()}
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline font-medium">
            DEADLINE COUNTDOWN
          </span>
        </div>
        <div className="text-[10px] font-mono text-outline flex items-center gap-1 flex-wrap">
          <Clock className="w-3 h-3 shrink-0" />
          <span>Next deadline:</span>
          <span className="text-on-surface font-medium">
            {formatTimestamp(deadline)}
          </span>
        </div>
      </div>

      {/* Tabular Monospace Countdown — always 4-col, fully contained inside card */}
      <div className="grid grid-cols-4 gap-1.5 w-full">
        {(["DAYS", "HRS", "MIN", "SEC"] as const).map((label, i) => {
          const vals = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds];
          return (
            <div
              key={label}
              className={`border rounded-lg py-2.5 text-center transition-colors ${
                timeLeft.isExpired
                  ? "bg-danger/10 border-danger/40"
                  : "bg-surface-container border-outline-variant/40"
              }`}
            >
              <div
                className={`font-mono text-xl font-semibold tabular-nums leading-none ${
                  timeLeft.isExpired ? "text-danger" : "text-on-surface"
                }`}
              >
                {pad(vals[i])}
              </div>
              <div className="font-mono text-[9px] tracking-wider text-outline uppercase mt-1">
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
