"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, User, Lock, Zap, CheckCircle2 } from "lucide-react";
import { shortenAddress } from "@/lib/constants";

interface TokenFlowVisualizerProps {
  ownerAddress: string;
  beneficiaryAddress: string;
  tokenAmount: string;
  isExecuted: boolean;
  isDeadlinePassed: boolean;
  status: number; // 0 ACTIVE, 1 EXECUTED, 2 CANCELLED
}

export default function TokenFlowVisualizer({
  ownerAddress,
  beneficiaryAddress,
  tokenAmount,
  isExecuted,
  isDeadlinePassed,
  status,
}: TokenFlowVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [animating, setAnimating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Derive current state label
  const flowState: "safe" | "danger" | "executed" =
    isExecuted ? "executed" : isDeadlinePassed ? "danger" : "safe";

  // Particle animation along the flow pipe
  const runParticleAnim = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setAnimating(true);
    setShowSuccess(false);

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const startX = W * 0.18;
    const endX = W * 0.82;
    const midY = H / 2;

    // Particle state
    let particles: { x: number; y: number; size: number; speed: number; alpha: number; color: string }[] = [];
    const totalParticles = 18;
    const color = flowState === "danger" ? "#EF4444" : flowState === "executed" ? "#10B981" : "#7C66DC";

    for (let i = 0; i < totalParticles; i++) {
      particles.push({
        x: startX + (i / totalParticles) * (endX - startX) * -0.5,
        y: midY + (Math.random() - 0.5) * 8,
        size: Math.random() * 3.5 + 2,
        speed: 2.2 + Math.random() * 1.4,
        alpha: 0,
        color,
      });
    }

    let allDone = false;
    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw pipe track
      ctx.beginPath();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = flowState === "danger" ? "rgba(239,68,68,0.18)" : "rgba(124,102,220,0.18)";
      ctx.lineWidth = 2;
      ctx.moveTo(startX, midY);
      ctx.lineTo(endX, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      let doneCount = 0;
      for (const p of particles) {
        p.x += p.speed;
        p.alpha = Math.min(1, p.alpha + 0.08);
        if (p.x > endX) {
          doneCount++;
          p.alpha = Math.max(0, p.alpha - 0.1);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.round(p.alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (doneCount === totalParticles) {
        allDone = true;
      }

      if (!allDone) {
        animRef.current = requestAnimationFrame(render);
      } else {
        setAnimating(false);
        setShowSuccess(true);
        ctx.clearRect(0, 0, W, H);
        setTimeout(() => setShowSuccess(false), 2500);
      }
    };

    animRef.current = requestAnimationFrame(render);
  };

  // Auto-trigger a preview animation on mount
  useEffect(() => {
    const t = setTimeout(() => runParticleAnim(), 600);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animRef.current);
    };
  }, [flowState]);

  const stateColors = {
    safe: { border: "border-primary/30", glow: "shadow-primary/10", badge: "bg-primary/10 text-primary border-primary/30", badgeText: "Vault Secured" },
    danger: { border: "border-danger/40", glow: "shadow-danger/20", badge: "bg-danger/10 text-danger border-danger/30", badgeText: "DEADLINE PASSED — Ready to Transfer" },
    executed: { border: "border-secondary/40", glow: "shadow-secondary/20", badge: "bg-secondary/10 text-secondary border-secondary/30", badgeText: "Transfer Complete ✓" },
  };

  const sc = stateColors[flowState];

  return (
    <div className={`w-full rounded-2xl border ${sc.border} bg-[#111318] shadow-lg ${sc.glow} p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-white tracking-tight">
          Live Token Flow
        </div>
        <span className={`text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full border ${sc.badge}`}>
          {sc.badgeText}
        </span>
      </div>

      {/* Accounts + Flow Canvas Row */}
      <div className="relative flex items-center gap-3">
        {/* Owner Card */}
        <div className={`shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border ${flowState === "danger" ? "border-danger/30 bg-danger/5" : "border-primary/20 bg-primary/5"} w-[90px] sm:w-[110px]`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${flowState === "danger" ? "bg-danger/20" : "bg-primary/20"}`}>
            <Lock className={`w-4 h-4 ${flowState === "danger" ? "text-danger" : "text-primary"}`} />
          </div>
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Owner</span>
          <span className="text-[9px] font-mono text-zinc-300 truncate w-full text-center">
            {ownerAddress ? shortenAddress(ownerAddress, 3) : "—"}
          </span>
          <div className={`w-full text-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${flowState === "danger" ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"}`}>
            {tokenAmount} TEST
          </div>
        </div>

        {/* Animated Flow Track Canvas */}
        <div className="flex-1 relative flex flex-col items-center justify-center h-[70px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: "block" }}
          />

          {/* Center Amount Badge floating over the track */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-center pointer-events-none transition-opacity duration-300 ${animating ? "opacity-100" : "opacity-80"}`}
          >
            {showSuccess ? (
              <div className="flex items-center gap-1 bg-secondary/20 border border-secondary/40 text-secondary px-2 py-1 rounded-full text-[10px] font-mono font-bold animate-bounce">
                <CheckCircle2 className="w-3 h-3" />
                <span>{tokenAmount} TEST sent!</span>
              </div>
            ) : (
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${flowState === "danger" ? "border-danger/40 bg-danger/10 text-danger" : "border-primary/30 bg-primary/10 text-primary"}`}>
                {tokenAmount} TEST
              </div>
            )}
          </div>
        </div>

        {/* Beneficiary Card */}
        <div className={`shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border ${isExecuted ? "border-secondary/40 bg-secondary/5" : flowState === "danger" ? "border-danger/20 bg-danger/5" : "border-outline-variant/30 bg-surface-container/40"} w-[90px] sm:w-[110px]`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isExecuted ? "bg-secondary/20" : "bg-zinc-700/40"}`}>
            {isExecuted ? (
              <CheckCircle2 className="w-4 h-4 text-secondary" />
            ) : (
              <User className="w-4 h-4 text-zinc-400" />
            )}
          </div>
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">Heir</span>
          <span className="text-[9px] font-mono text-zinc-300 truncate w-full text-center">
            {beneficiaryAddress ? shortenAddress(beneficiaryAddress, 3) : "—"}
          </span>
          <div className={`w-full text-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${isExecuted ? "bg-secondary/20 text-secondary" : "bg-zinc-700/30 text-zinc-500"}`}>
            {isExecuted ? `+${tokenAmount} TEST` : "Waiting..."}
          </div>
        </div>
      </div>

      {/* Legend Row */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5 text-center">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-0.5">From</div>
          <div className="text-[11px] font-mono text-zinc-300 font-medium truncate">
            {ownerAddress ? shortenAddress(ownerAddress, 4) : "—"}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-0.5">Amount</div>
          <div className={`text-[11px] font-mono font-bold ${flowState === "executed" ? "text-secondary" : flowState === "danger" ? "text-danger" : "text-primary"}`}>
            {tokenAmount} TEST
          </div>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mb-0.5">To</div>
          <div className="text-[11px] font-mono text-zinc-300 font-medium truncate">
            {beneficiaryAddress ? shortenAddress(beneficiaryAddress, 4) : "—"}
          </div>
        </div>
      </div>

      {/* Replay Button */}
      <button
        onClick={runParticleAnim}
        disabled={animating}
        className="w-full text-[11px] font-mono text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 py-1.5 rounded-lg transition-colors"
      >
        {animating ? "▶ Animating transfer..." : "▶ Replay Transfer Animation"}
      </button>
    </div>
  );
}
