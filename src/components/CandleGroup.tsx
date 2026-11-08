'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';

export const CandleGroup: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);

  const [flameTilt, setFlameTilt] = useState<number>(0);
  const [flameScale, setFlameScale] = useState<number>(1);
  const [flameColor, setFlameColor] = useState<string>('rgba(251, 191, 36, 0.9)');
  const [isLit, setIsLit] = useState<boolean>(true);

  // Monitor ghost proximity to candelabra
  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let closestDist = Infinity;
    let tilt = 0;
    let customColor = 'rgba(251, 191, 36, 0.9)';

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // 1. Ghost blowout: If a ghost flies fast near the candelabra, it blows the flames out!
      if (isLit && dist < 65 && Math.hypot(ghost.vx, ghost.vy) > 0.6) {
        setIsLit(false);
        if (soundEnabled) ghostAudio.playBlowOut(volume);
        return;
      }

      // 2. Draft tilt: Flames tilt away from passing ghosts
      if (dist < 150 && dist < closestDist) {
        closestDist = dist;
        tilt = -(dx / dist) * Math.min(24, (1 - dist / 150) * 32);

        if (ghost.type === 'wisp') {
          customColor = 'rgba(34, 211, 238, 0.95)';
        } else if (ghost.type === 'regret') {
          customColor = 'rgba(244, 63, 94, 0.95)';
        }
      }
    }

    if (closestDist < 150) {
      setFlameTilt(tilt);
      setFlameScale(1.15);
      setFlameColor(customColor);
    } else {
      setFlameTilt(0);
      setFlameScale(1);
      setFlameColor('rgba(251, 191, 36, 0.9)');
    }
  }, [ghosts, isLit, soundEnabled, volume]);

  const toggleLit = () => {
    const next = !isLit;
    setIsLit(next);
    if (next && soundEnabled) {
      ghostAudio.playMendChime(volume);
    } else if (!next && soundEnabled) {
      ghostAudio.playBlowOut(volume);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={toggleLit}
      title={
        isLit
          ? 'Matte Wrought-Iron Candelabra (Click to snuff • Ghosts can blow it out!)'
          : 'Extinguished Candelabra (Click to rekindle the flames)'
      }
      className="fixed left-4 sm:left-6 bottom-4 z-30 pointer-events-auto select-none cursor-pointer group"
      style={{ width: '260px', height: '320px' }}
    >
      {/* 1. AMBIENT GLOW (Only present when lit, absolute so geometry never shifts) */}
      <div
        className={`absolute -top-14 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none transition-opacity duration-500 blur-3xl ${
          isLit ? 'opacity-65' : 'opacity-0'
        }`}
        style={{
          backgroundColor: flameColor,
          transform: `scale(${flameScale * 1.15})`,
        }}
      />

      {/* 2. THE THREE CANDLE FLAMES (Positioned directly over each wick - Zero layout shift) */}
      {/* Left Flame */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none transition-opacity duration-300 origin-bottom ${
          isLit ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: '15.55%',
          top: '15.9%',
          transform: `rotate(${flameTilt * 0.9}deg) scale(${flameScale * 0.95})`,
        }}
      >
        <div
          className="w-4 h-10 rounded-full animate-candle-flame"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
            boxShadow: `0 0 20px ${flameColor}`,
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-3 rounded-full bg-blue-400/80 blur-[0.5px]" />
        </div>
      </div>

      {/* Center Flame (Commanding Center Pillar) */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none transition-opacity duration-300 origin-bottom ${
          isLit ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: '50.0%',
          top: '5.45%',
          transform: `rotate(${flameTilt}deg) scale(${flameScale * 1.1})`,
        }}
      >
        <div
          className="w-5 h-12 rounded-full animate-candle-flame"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
            boxShadow: `0 0 26px ${flameColor}`,
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-3.5 rounded-full bg-blue-400/80 blur-[0.5px]" />
        </div>
      </div>

      {/* Right Flame */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none transition-opacity duration-300 origin-bottom ${
          isLit ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: '84.44%',
          top: '17.27%',
          transform: `rotate(${flameTilt * 0.85}deg) scale(${flameScale * 0.95})`,
        }}
      >
        <div
          className="w-4 h-10 rounded-full animate-candle-flame"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
            boxShadow: `0 0 20px ${flameColor}`,
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-3 rounded-full bg-blue-400/80 blur-[0.5px]" />
        </div>
      </div>

      {/* 3. SMOKE WISPS WHEN UNLIT (Drifting up from charred wicks) */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-opacity duration-500 ${
          !isLit ? 'opacity-65' : 'opacity-0'
        }`}
        style={{ left: '15.55%', top: '15.9%' }}
      >
        <div className="w-1.5 h-5 bg-neutral-400/50 rounded-full animate-pulse blur-[0.5px]" />
      </div>
      <div
        className={`absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-opacity duration-500 ${
          !isLit ? 'opacity-75' : 'opacity-0'
        }`}
        style={{ left: '50.0%', top: '5.45%' }}
      >
        <div className="w-2 h-7 bg-neutral-400/60 rounded-full animate-pulse blur-[0.5px]" />
      </div>
      <div
        className={`absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-opacity duration-500 ${
          !isLit ? 'opacity-65' : 'opacity-0'
        }`}
        style={{ left: '84.44%', top: '17.27%' }}
      >
        <div className="w-1.5 h-5 bg-neutral-400/50 rounded-full animate-pulse blur-[0.5px]" />
      </div>

      {/* 4. CLEAN, SOLID MATTE WROUGHT-IRON CANDELABRA (Bold, uncluttered silhouette) */}
      <svg
        viewBox="0 0 180 220"
        className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* --- HEAVY STEPPED WROUGHT-IRON BASE --- */}
        <rect x="58" y="206" width="64" height="8" rx="2" fill="#15121b" />
        <rect x="70" y="196" width="40" height="10" rx="1.5" fill="#181520" />
        <rect x="76" y="190" width="28" height="6" rx="1" fill="#15121b" />

        {/* --- CLEAN FORGED ARMS --- */}
        {/* Left Sweeping Arm */}
        <path
          d="M90 145 C60 145 28 135 28 104"
          stroke="#15121b"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right Sweeping Arm */}
        <path
          d="M90 145 C120 145 152 135 152 104"
          stroke="#15121b"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- SOLID CENTRAL SHAFT --- */}
        <rect x="85" y="86" width="10" height="106" rx="1" fill="#15121b" />

        {/* --- CANDLE HOLDER CUPS (BOBECHES) --- */}
        <ellipse cx="28" cy="104" rx="12" ry="3.5" fill="#181520" />
        <ellipse cx="90" cy="86" rx="14" ry="4" fill="#181520" />
        <ellipse cx="152" cy="104" rx="12" ry="3.5" fill="#181520" />

        {/* --- THREE AGED CANDLES & CHARRED WICKS --- */}
        {/* LEFT CANDLE */}
        <g id="leftCandle">
          <rect x="21" y="44" width="14" height="60" rx="1.5" fill="#dcd5c0" />
          {/* Subtle natural wax drip */}
          <path d="M22 46 C21 54 23 60 22 70" stroke="#cfc7b0" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="28" cy="44" rx="7" ry="2" fill="#c7bfa8" />
          {/* Charred Wick */}
          <path d="M28 44 Q29 38 28 35" stroke="#120f0c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="35" r="1" fill="#000000" />
        </g>

        {/* CENTER PILLAR CANDLE */}
        <g id="centerCandle">
          <rect x="81" y="24" width="18" height="62" rx="2" fill="#ded7c3" />
          {/* Subtle natural wax drip */}
          <path d="M83 26 C82 36 84 46 83 58" stroke="#cfc7b0" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <ellipse cx="90" cy="24" rx="9" ry="2.5" fill="#c7bfa8" />
          {/* Charred Wick */}
          <path d="M90 24 Q89 16 90 12" stroke="#120f0c" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <circle cx="90" cy="12" r="1.1" fill="#000000" />
        </g>

        {/* RIGHT CANDLE */}
        <g id="rightCandle">
          <rect x="145" y="48" width="14" height="56" rx="1.5" fill="#dcd5c0" />
          {/* Subtle natural wax drip */}
          <path d="M157 50 C158 58 156 64 157 74" stroke="#cfc7b0" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="152" cy="48" rx="7" ry="2" fill="#c7bfa8" />
          {/* Charred Wick */}
          <path d="M152 48 Q153 42 152 38" stroke="#120f0c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <circle cx="152" cy="38" r="1" fill="#000000" />
        </g>
      </svg>
    </div>
  );
};

