"use client";

import React, { useState, useRef, useEffect } from "react";
import { Lock, ShieldCheck, Key, Radio, RotateCw, CheckCircle, AlertTriangle } from "lucide-react";

export default function VaultMechanicalDial() {
  const [rotation, setRotation] = useState(38);
  const [isDragging, setIsDragging] = useState(false);
  const [tilt, setTilt] = useState({ rx: 4, ry: -6 });
  const [activePin, setActivePin] = useState(1);
  const [unlockedState, setUnlockedState] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startAngleRef = useRef(0);
  const startRotationRef = useRef(0);

  // 3D perspective response to cursor
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / (rect.height / 2)) * 8;
    const ry = (x / (rect.width / 2)) * 10;
    setTilt({ rx, ry });
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setTilt({ rx: 3, ry: -4 });
    }
  };

  // Drag to rotate dial
  const handleDialMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    startRotationRef.current = rotation;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      const angleDiff = ((currentAngle - startAngleRef.current) * 180) / Math.PI;
      const newRotation = Math.round((startRotationRef.current + angleDiff) % 360);
      setRotation(newRotation >= 0 ? newRotation : 360 + newRotation);

      // Check tumbler alignment
      const normalized = Math.abs(newRotation % 120);
      if (normalized < 8) {
        setActivePin(3);
        setUnlockedState(true);
      } else if (normalized < 35) {
        setActivePin(2);
        setUnlockedState(false);
      } else {
        setActivePin(1);
        setUnlockedState(false);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, rotation]);

  const stepRotation = (delta: number) => {
    const next = (rotation + delta + 360) % 360;
    setRotation(next);
    const normalized = Math.abs(next % 120);
    setActivePin(normalized < 10 ? 3 : normalized < 40 ? 2 : 1);
  };

  // Hex hash labels along the dial rim
  const hashes = [
    "0x7C66",
    "0x9F01",
    "0x10B9",
    "0xE7F1",
    "0xDEAD",
    "0x5FBD",
    "0x3133",
    "0x8A22",
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full max-w-[460px] select-none"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative rounded-2xl bg-[#0D0F14] border border-[#202533] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.85)] transition-transform duration-150 ease-out"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Top Machine Status Bar */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1A1F2C]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] font-semibold text-zinc-300 tracking-wider uppercase">
              Vault Core Enclave
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
            <span>DIAL: {String(rotation).padStart(3, "0")}°</span>
            <span className="text-zinc-700">|</span>
            <span className={unlockedState ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {unlockedState ? "TUMBLERS ALIGNED" : "LOCKED (3-STAGE)"}
            </span>
          </div>
        </div>

        {/* 3D Dial Assembly Container */}
        <div className="relative flex items-center justify-center my-3 py-4">
          {/* Outer Housing Ring */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-b from-[#1E2330] via-[#12151D] to-[#0A0B0F] p-[2px] shadow-[inset_0_2px_6px_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.8)] flex items-center justify-center relative">
            {/* Degree Tick Marks */}
            <div className="absolute inset-1 rounded-full border border-dashed border-[#282F40]/60 pointer-events-none" />

            {/* Static Outer Bezel Ring with Hex Hashes */}
            {hashes.map((h, i) => {
              const angle = i * 45;
              const rad = (angle * Math.PI) / 180;
              const r = 120; // radius
              return (
                <div
                  key={h}
                  className="absolute font-mono text-[9px] text-zinc-600 tracking-tighter"
                  style={{
                    transform: `translate(${Math.sin(rad) * r}px, ${-Math.cos(rad) * r}px)`,
                  }}
                >
                  {h}
                </div>
              );
            })}

            {/* Interactive Rotating Machine Dial */}
            <div
              onMouseDown={handleDialMouseDown}
              className={`w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-[#131722] border-2 ${
                unlockedState ? "border-emerald-500/70" : "border-[#323A4E]"
              } shadow-[0_8px_24px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.12)] cursor-grab active:cursor-grabbing relative flex items-center justify-center transition-colors duration-200`}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
              }}
            >
              {/* Dial Grips / Grooves */}
              <div className="absolute inset-2 rounded-full border border-[#232938] pointer-events-none" />

              {/* Dial Notch Indicator */}
              <div className="absolute top-1 w-1.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <div className="absolute bottom-1 w-1.5 h-2 rounded-full bg-zinc-600" />
              <div className="absolute left-1 w-2 h-1.5 rounded-full bg-zinc-600" />
              <div className="absolute right-1 w-2 h-1.5 rounded-full bg-zinc-600" />

              {/* Inner Center Hub */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0B0D12] via-[#161B26] to-[#1F2636] border border-[#2D3547] flex flex-col items-center justify-center shadow-inner pointer-events-none">
                <Lock
                  className={`w-6 h-6 transition-colors duration-200 ${
                    unlockedState ? "text-emerald-400" : "text-zinc-400"
                  }`}
                />
                <span className="font-mono text-[9px] text-zinc-400 mt-1 uppercase font-semibold">
                  {unlockedState ? "READY" : "ARMED"}
                </span>
              </div>
            </div>

            {/* Left & Right Mechanical Solenoid Lock Pins */}
            <div
              className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 rounded-l bg-[#1B202C] border-l border-y ${
                activePin >= 1 ? "border-emerald-500/60" : "border-[#2D3547]"
              } transition-colors`}
            />
            <div
              className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 rounded-r bg-[#1B202C] border-r border-y ${
                activePin >= 2 ? "border-emerald-500/60" : "border-[#2D3547]"
              } transition-colors`}
            />
          </div>
        </div>

        {/* Tumbler Alignment Stage Progress */}
        <div className="grid grid-cols-3 gap-2 my-3">
          <div
            className={`p-2 rounded-lg border text-center transition-colors ${
              activePin >= 1
                ? "bg-[#101923] border-emerald-500/40 text-emerald-300"
                : "bg-[#111319] border-[#1D212E] text-zinc-500"
            }`}
          >
            <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400">
              Stage 01
            </span>
            <span className="text-[11px] font-mono font-bold">Proof of Life</span>
          </div>

          <div
            className={`p-2 rounded-lg border text-center transition-colors ${
              activePin >= 2
                ? "bg-[#101923] border-emerald-500/40 text-emerald-300"
                : "bg-[#111319] border-[#1D212E] text-zinc-500"
            }`}
          >
            <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400">
              Stage 02
            </span>
            <span className="text-[11px] font-mono font-bold">Heartbeat Timer</span>
          </div>

          <div
            className={`p-2 rounded-lg border text-center transition-colors ${
              activePin >= 3
                ? "bg-[#101923] border-emerald-500/40 text-emerald-300"
                : "bg-[#111319] border-[#1D212E] text-zinc-500"
            }`}
          >
            <span className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400">
              Stage 03
            </span>
            <span className="text-[11px] font-mono font-bold">Contingency</span>
          </div>
        </div>

        {/* Micro Telemetry Footer & Quick Rotate Knobs */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1A1F2C] text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[10px]">DRAG DIAL TO ROTATE</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => stepRotation(-45)}
              className="px-2 py-1 rounded bg-[#171A24] hover:bg-[#202534] border border-[#272D3E] font-mono text-[10px] text-zinc-300 transition-colors"
            >
              -45°
            </button>
            <button
              type="button"
              onClick={() => stepRotation(45)}
              className="px-2 py-1 rounded bg-[#171A24] hover:bg-[#202534] border border-[#272D3E] font-mono text-[10px] text-zinc-300 transition-colors"
            >
              +45°
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
