"use client";

import React, { useState, useEffect } from "react";

interface AegisEmblemProps {
  className?: string;
  size?: number;
}

export default function AegisEmblem({ className = "", size = 80 }: AegisEmblemProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
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
      {/* 3D Geometric Aegis Guardian Emblem */}
      <svg
        viewBox="0 0 318.6 318.6"
        width={size}
        height={size}
        className="drop-shadow-[0_8px_25px_rgba(124,102,220,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Left Crest */}
        <polygon
          points="70.3,55.9 127.5,108.2 111.7,40.1"
          fill="#7C66DC"
          stroke="#7C66DC"
          strokeWidth="2"
        />
        {/* Outer Right Crest */}
        <polygon
          points="248.3,55.9 206.9,40.1 191.1,108.2"
          fill="#6C55CF"
          stroke="#6C55CF"
          strokeWidth="2"
        />

        {/* Crest Insides */}
        <polygon points="70.3,55.9 111.7,40.1 89.2,26.4" fill="#CABEFF" />
        <polygon points="248.3,55.9 229.4,26.4 206.9,40.1" fill="#CABEFF" />

        {/* Center Forehead Crystal */}
        <polygon
          points="159.3,71.2 111.7,40.1 127.5,108.2 159.3,135.5"
          fill="#5B44BE"
        />
        <polygon
          points="159.3,71.2 159.3,135.5 191.1,108.2 206.9,40.1"
          fill="#4A34AC"
        />

        {/* Forehead Bridge */}
        <polygon points="159.3,71.2 206.9,40.1 159.3,25.2" fill="#7C66DC" />
        <polygon points="159.3,71.2 159.3,25.2 111.7,40.1" fill="#6C55CF" />

        {/* Cheek Plate Left */}
        <polygon
          points="58.9,139.8 127.5,108.2 70.3,55.9"
          fill="#6C55CF"
        />
        <polygon
          points="58.9,139.8 96.5,185.3 127.5,108.2"
          fill="#CABEFF"
        />

        {/* Cheek Plate Right */}
        <polygon
          points="259.7,139.8 248.3,55.9 191.1,108.2"
          fill="#5B44BE"
        />
        <polygon
          points="259.7,139.8 191.1,108.2 222.1,185.3"
          fill="#CABEFF"
        />

        {/* Eye Visors */}
        <polygon
          points="127.5,108.2 96.5,185.3 159.3,135.5"
          fill="#8B77E6"
        />
        <polygon
          points="191.1,108.2 159.3,135.5 222.1,185.3"
          fill="#7C66DC"
        />

        {/* Lower Core Shield */}
        <polygon
          points="159.3,135.5 96.5,185.3 133.7,218.4 159.3,178.6"
          fill="#6C55CF"
        />
        <polygon
          points="159.3,135.5 159.3,178.6 184.9,218.4 222.1,185.3"
          fill="#5B44BE"
        />

        {/* Chin Apex */}
        <polygon
          points="159.3,212.1 133.7,218.4 148.6,242.2 159.3,239.5"
          fill="#CABEFF"
        />
        <polygon
          points="159.3,212.1 159.3,239.5 170,242.2 184.9,218.4"
          fill="#1C1F28"
        />

        {/* Center Keystone */}
        <polygon
          points="159.3,178.6 148.6,204.3 159.3,212.1 170,204.3"
          fill="#10B981"
        />

        {/* Left Sensor Eye */}
        <polygon
          points="106.8,154.2 96.5,185.3 125.1,170.8"
          fill="#0D0E12"
        />
        {/* Right Sensor Eye */}
        <polygon
          points="211.8,154.2 193.5,170.8 222.1,185.3"
          fill="#0D0E12"
        />

        {/* Glowing Dynamic Pupil Beacons */}
        <circle
          cx={112 + mousePos.x * 0.3}
          cy={165 + mousePos.y * 0.3}
          r="3.5"
          fill="#10B981"
          className="animate-pulse"
        />
        <circle
          cx={206 + mousePos.x * 0.3}
          cy={165 + mousePos.y * 0.3}
          r="3.5"
          fill="#10B981"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}
