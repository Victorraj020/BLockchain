"use client";

import React, { useState, useEffect } from "react";

interface AegisEmblemProps {
  className?: string;
  size?: number;
}

export default function AegisEmblem({ className = "", size = 32 }: AegisEmblemProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-150 ease-out ${className}`}
      style={{
        width: size,
        height: size,
        transform: `perspective(400px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#252A38" />
            <stop offset="50%" stopColor="#141822" />
            <stop offset="100%" stopColor="#0B0E14" />
          </linearGradient>
          <linearGradient id="rimGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A5568" />
            <stop offset="100%" stopColor="#1A202C" />
          </linearGradient>
          <linearGradient id="coreGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Outer Vault Hexagon / Shield */}
        <polygon
          points="50,6 88,26 88,68 50,94 12,68 12,26"
          fill="url(#shieldGrad)"
          stroke="url(#rimGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Geometric Keyways */}
        <polygon
          points="50,18 78,34 78,66 50,82 22,66 22,34"
          fill="none"
          stroke="#2A3245"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />

        {/* Central Lock Core */}
        <circle cx="50" cy="50" r="16" fill="#0D1017" stroke="#3A445C" strokeWidth="2" />
        <circle cx="50" cy="50" r="8" fill="url(#coreGrad)" />

        {/* Keyhole notch */}
        <path
          d="M50 48 L50 58 M47 57 L53 57"
          stroke="#0D1017"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Active Heartbeat Sensor Dot */}
        <circle cx="50" cy="50" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
