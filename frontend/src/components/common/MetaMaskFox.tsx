"use client";

import React, { useState, useEffect } from "react";

interface MetaMaskFoxProps {
  className?: string;
  size?: number;
}

export default function MetaMaskFox({ className = "", size = 80 }: MetaMaskFoxProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized offset from center of screen (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-100 ease-out ${className}`}
      style={{
        width: size,
        height: size,
        transform: `perspective(500px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
      }}
    >
      {/* SVG geometric MetaMask-style fox head with layered polygon shading */}
      <svg
        viewBox="0 0 318.6 318.6"
        width={size}
        height={size}
        className="drop-shadow-[0_8px_20px_rgba(246,133,27,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Left Ear */}
        <polygon
          points="70.3,55.9 127.5,108.2 111.7,40.1"
          fill="#E2761B"
          stroke="#E2761B"
          strokeWidth="2"
        />
        {/* Outer Right Ear */}
        <polygon
          points="248.3,55.9 206.9,40.1 191.1,108.2"
          fill="#E2761B"
          stroke="#E2761B"
          strokeWidth="2"
        />

        {/* Ear Insides */}
        <polygon points="70.3,55.9 111.7,40.1 89.2,26.4" fill="#D7C1B3" />
        <polygon points="248.3,55.9 229.4,26.4 206.9,40.1" fill="#D7C1B3" />

        {/* Forehead Center Polygons */}
        <polygon
          points="159.3,71.2 111.7,40.1 127.5,108.2 159.3,135.5"
          fill="#E4761B"
        />
        <polygon
          points="159.3,71.2 159.3,135.5 191.1,108.2 206.9,40.1"
          fill="#CD6116"
        />

        {/* Forehead Bridge */}
        <polygon points="159.3,71.2 206.9,40.1 159.3,25.2" fill="#E4761B" />
        <polygon points="159.3,71.2 159.3,25.2 111.7,40.1" fill="#CD6116" />

        {/* Cheek Left */}
        <polygon
          points="58.9,139.8 127.5,108.2 70.3,55.9"
          fill="#E4761B"
        />
        <polygon
          points="58.9,139.8 96.5,185.3 127.5,108.2"
          fill="#D7C1B3"
        />

        {/* Cheek Right */}
        <polygon
          points="259.7,139.8 248.3,55.9 191.1,108.2"
          fill="#CD6116"
        />
        <polygon
          points="259.7,139.8 191.1,108.2 222.1,185.3"
          fill="#D7C1B3"
        />

        {/* Eyes Backing & Cheeks */}
        <polygon
          points="127.5,108.2 96.5,185.3 159.3,135.5"
          fill="#F6851B"
        />
        <polygon
          points="191.1,108.2 159.3,135.5 222.1,185.3"
          fill="#E2761B"
        />

        {/* Snout Upper */}
        <polygon
          points="159.3,135.5 96.5,185.3 133.7,218.4 159.3,178.6"
          fill="#F6851B"
        />
        <polygon
          points="159.3,135.5 159.3,178.6 184.9,218.4 222.1,185.3"
          fill="#E2761B"
        />

        {/* Nose Lower & Mouth */}
        <polygon
          points="159.3,212.1 133.7,218.4 148.6,242.2 159.3,239.5"
          fill="#C0AD9E"
        />
        <polygon
          points="159.3,212.1 159.3,239.5 170,242.2 184.9,218.4"
          fill="#161616"
        />

        {/* True Nose Black Tip */}
        <polygon
          points="159.3,178.6 148.6,204.3 159.3,212.1 170,204.3"
          fill="#233447"
        />

        {/* Left Eye */}
        <polygon
          points="106.8,154.2 96.5,185.3 125.1,170.8"
          fill="#24292E"
        />
        {/* Right Eye */}
        <polygon
          points="211.8,154.2 193.5,170.8 222.1,185.3"
          fill="#24292E"
        />

        {/* Eye pupils / highlights with subtle shift based on mouse */}
        <circle
          cx={112 + mousePos.x * 0.3}
          cy={165 + mousePos.y * 0.3}
          r="3"
          fill="#00FFFF"
          className="animate-pulse"
        />
        <circle
          cx={206 + mousePos.x * 0.3}
          cy={165 + mousePos.y * 0.3}
          r="3"
          fill="#00FFFF"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}
