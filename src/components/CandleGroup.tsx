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
          ? 'Gothic Wrought-Iron Candelabra (Click to snuff • Ghosts can blow it out!)'
          : 'Extinguished Candelabra (Click to rekindle the flames)'
      }
      className="fixed left-5 sm:left-8 bottom-6 z-30 pointer-events-auto select-none cursor-pointer group"
      style={{ width: '180px', height: '220px' }}
    >
      {/* 1. AMBIENT GLOW (Only present when lit, absolute so geometry never shifts) */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none transition-opacity duration-500 blur-2xl ${
          isLit ? 'opacity-65' : 'opacity-0'
        }`}
        style={{
          backgroundColor: flameColor,
          transform: `scale(${flameScale * 1.1})`,
        }}
      />

      {/* 2. THE THREE CANDLE FLAMES (Fixed absolute positions above each wick - NEVER causes layout shift) */}
      {/* Left Flame */}
      <div
        className={`absolute top-6 left-[28px] -translate-x-1/2 flex flex-col items-center pointer-events-none transition-opacity duration-300 origin-bottom ${
          isLit ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `rotate(${flameTilt * 0.9}deg) scale(${flameScale * 0.9})`,
        }}
      >
        <div
          className="w-3 h-7 rounded-full animate-candle-flame"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
            boxShadow: `0 0 16px ${flameColor}`,
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full bg-blue-400/80 blur-[0.5px]" />
        </div>
      </div>

      {/* Center Flame (Taller, Center of Candelabra) */}
      <div
        className={`absolute top-1 left-[90px] -translate-x-1/2 flex flex-col items-center pointer-events-none transition-opacity duration-300 origin-bottom ${
          isLit ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `rotate(${flameTilt}deg) scale(${flameScale * 1.05})`,
        }}
      >
        <div
          className="w-4 h-9 rounded-full animate-candle-flame"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
            boxShadow: `0 0 22px ${flameColor}`,
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-2.5 rounded-full bg-blue-400/80 blur-[0.5px]" />
        </div>
      </div>

      {/* Right Flame */}
      <div
        className={`absolute top-7 left-[152px] -translate-x-1/2 flex flex-col items-center pointer-events-none transition-opacity duration-300 origin-bottom ${
          isLit ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: `rotate(${flameTilt * 0.85}deg) scale(${flameScale * 0.9})`,
        }}
      >
        <div
          className="w-3 h-7 rounded-full animate-candle-flame"
          style={{
            background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
            boxShadow: `0 0 16px ${flameColor}`,
          }}
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full bg-blue-400/80 blur-[0.5px]" />
        </div>
      </div>

      {/* 3. SMOKE WISPS WHEN UNLIT (Drifting up from charred wicks) */}
      <div
        className={`absolute top-5 left-[28px] -translate-x-1/2 pointer-events-none transition-opacity duration-500 ${
          !isLit ? 'opacity-60' : 'opacity-0'
        }`}
      >
        <div className="w-1 h-3.5 bg-neutral-400/50 rounded-full animate-pulse blur-[0.5px]" />
      </div>
      <div
        className={`absolute top-0 left-[90px] -translate-x-1/2 pointer-events-none transition-opacity duration-500 ${
          !isLit ? 'opacity-70' : 'opacity-0'
        }`}
      >
        <div className="w-1 h-5 bg-neutral-400/60 rounded-full animate-pulse blur-[0.5px]" />
      </div>
      <div
        className={`absolute top-6 left-[152px] -translate-x-1/2 pointer-events-none transition-opacity duration-500 ${
          !isLit ? 'opacity-60' : 'opacity-0'
        }`}
      >
        <div className="w-1 h-3.5 bg-neutral-400/50 rounded-full animate-pulse blur-[0.5px]" />
      </div>

      {/* 4. SOLID GOTHIC WROUGHT-IRON CANDELABRA & WEATHERED WAX CANDLES (100% Fixed Vector Geometry) */}
      <svg
        viewBox="0 0 180 220"
        className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Tarnished Wrought Iron Gradient */}
          <linearGradient id="ironGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e1b24" />
            <stop offset="35%" stopColor="#3d3748" />
            <stop offset="70%" stopColor="#1e1a24" />
            <stop offset="100%" stopColor="#110d18" />
          </linearGradient>

          {/* Aged Bone Wax Gradient */}
          <linearGradient id="agedWax" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#dcd5be" />
            <stop offset="25%" stopColor="#f3eee0" />
            <stop offset="65%" stopColor="#e3dbcb" />
            <stop offset="100%" stopColor="#b6ad94" />
          </linearGradient>

          {/* Wax Drips Highlight */}
          <linearGradient id="waxDrips" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#faf7ed" />
            <stop offset="100%" stopColor="#c8bfa7" />
          </linearGradient>

          {/* Iron Shadow */}
          <filter id="ironShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="2" stdDeviation="1" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* --- WROUGHT IRON BASE & SCROLL FEET --- */}
        {/* Ornate Scrolled Base Feet */}
        <path
          d="M48 214 Q60 200 90 200 Q120 200 132 214 Q115 218 90 218 Q65 218 48 214 Z"
          fill="url(#ironGrad)"
          stroke="#0b0811"
          strokeWidth="1.5"
        />
        {/* Left claw curl */}
        <path
          d="M48 214 Q38 217 34 212 Q30 204 38 198 Q42 195 44 200"
          stroke="url(#ironGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right claw curl */}
        <path
          d="M132 214 Q142 217 146 212 Q150 204 142 198 Q138 195 136 200"
          stroke="url(#ironGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Base pedestal collar */}
        <path
          d="M78 200 L102 200 L99 188 L81 188 Z"
          fill="url(#ironGrad)"
          stroke="#0c0912"
          strokeWidth="1.2"
        />

        {/* --- MAIN CENTRAL COLUMN WITH GOTHIC KNOTS --- */}
        <rect x="85" y="90" width="10" height="100" rx="1.5" fill="url(#ironGrad)" stroke="#0c0912" strokeWidth="1" />
        {/* Decorative iron rings on stem */}
        <ellipse cx="90" cy="172" rx="8" ry="2.5" fill="url(#ironGrad)" stroke="#0c0912" strokeWidth="1" />
        <ellipse cx="90" cy="142" rx="7.5" ry="2.2" fill="url(#ironGrad)" stroke="#0c0912" strokeWidth="1" />
        <ellipse cx="90" cy="115" rx="7" ry="2" fill="url(#ironGrad)" stroke="#0c0912" strokeWidth="1" />

        {/* --- FORGED CURVING ARMS --- */}
        {/* Left Sweeping Arm */}
        <path
          d="M87 145 C65 145 32 135 28 106"
          stroke="url(#ironGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          filter="url(#ironShadow)"
        />
        {/* Left inner scroll flourish */}
        <path
          d="M32 120 C36 138 52 142 65 140"
          stroke="url(#ironGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Sweeping Arm */}
        <path
          d="M93 145 C115 145 148 135 152 106"
          stroke="url(#ironGrad)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          filter="url(#ironShadow)"
        />
        {/* Right inner scroll flourish */}
        <path
          d="M148 120 C144 138 128 142 115 140"
          stroke="url(#ironGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- CANDLE SCONCES & WAX DRIP TRAYS (BOBECHES) --- */}
        {/* Left Sconce & Bobeche */}
        <path
          d="M16 104 Q28 112 40 104 Q35 112 28 113 Q21 112 16 104 Z"
          fill="url(#ironGrad)"
          stroke="#0b0811"
          strokeWidth="1.2"
        />
        {/* Center Sconce & Bobeche */}
        <path
          d="M76 88 Q90 96 104 88 Q99 96 90 97 Q81 96 76 88 Z"
          fill="url(#ironGrad)"
          stroke="#0b0811"
          strokeWidth="1.2"
        />
        {/* Right Sconce & Bobeche */}
        <path
          d="M140 104 Q152 112 164 104 Q159 112 152 113 Q145 112 140 104 Z"
          fill="url(#ironGrad)"
          stroke="#0b0811"
          strokeWidth="1.2"
        />

        {/* --- AGED, SPOOKY DRIPPING WAX CANDLES --- */}
        {/* LEFT CANDLE: Medium, uneven with drips */}
        <g id="leftCandle">
          {/* Melted Wax Overflowing into Bobeche */}
          <path d="M19 105 Q28 110 37 105 Q32 108 28 108 Q24 108 19 105 Z" fill="url(#waxDrips)" />
          {/* Candle Shaft */}
          <rect x="21" y="44" width="14" height="61" rx="1.5" fill="url(#agedWax)" stroke="#746c57" strokeWidth="0.8" />
          {/* Jagged dripping wax trails */}
          <path d="M22 46 C21 54 24 58 23 68 C22 75 25 82 24 88" stroke="url(#waxDrips)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M33 46 C34 52 32 58 33 64" stroke="url(#waxDrips)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M27 48 C28 55 26 60 27 66" stroke="url(#waxDrips)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Wax Drip Teardrops */}
          <circle cx="23.5" cy="89" r="1.4" fill="#faf7ed" />
          {/* Concave melted wax top pool */}
          <ellipse cx="28" cy="44" rx="7" ry="2" fill="#c3ba9f" stroke="#7e755f" strokeWidth="0.8" />
          {/* Charred Black Wick (NEVER disappears) */}
          <path d="M28 44 Q29 38 28 35" stroke="#181512" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          {/* Burnt wick ash tip */}
          <circle cx="28" cy="35" r="1" fill="#000000" />
        </g>

        {/* CENTER CANDLE: Tall, stately gothic pillar candle with heavy wax folds */}
        <g id="centerCandle">
          {/* Melted Wax in Tray */}
          <path d="M79 89 Q90 94 101 89 Q95 93 90 93 Q85 93 79 89 Z" fill="url(#waxDrips)" />
          {/* Candle Shaft */}
          <rect x="81" y="24" width="18" height="66" rx="2" fill="url(#agedWax)" stroke="#746c57" strokeWidth="0.8" />
          {/* Heavy weeping wax drips */}
          <path d="M83 25 C82 35 86 42 84 56 C83 66 85 74 84 81" stroke="url(#waxDrips)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M96 25 C97 34 94 40 96 50 C98 58 95 65 96 72" stroke="url(#waxDrips)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M89 26 C90 38 88 48 90 60" stroke="url(#waxDrips)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="84" cy="82" r="1.7" fill="#faf7ed" />
          <circle cx="96" cy="73" r="1.5" fill="#faf7ed" />
          {/* Concave melted top pool */}
          <ellipse cx="90" cy="24" rx="9" ry="2.5" fill="#c3ba9f" stroke="#7e755f" strokeWidth="0.8" />
          {/* Charred Twisted Wick (NEVER disappears) */}
          <path d="M90 24 Q89 16 90 12" stroke="#181512" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="90" cy="12" r="1.2" fill="#000000" />
        </g>

        {/* RIGHT CANDLE: Slightly crooked / melted shorter candle */}
        <g id="rightCandle">
          {/* Melted Wax in Tray */}
          <path d="M143 105 Q152 110 161 105 Q156 108 152 108 Q148 108 143 105 Z" fill="url(#waxDrips)" />
          {/* Crooked Candle Shaft */}
          <path
            d="M145 50 Q146 75 145 105 L159 105 Q160 75 159 50 Z"
            fill="url(#agedWax)"
            stroke="#746c57"
            strokeWidth="0.8"
          />
          {/* Wax drips */}
          <path d="M147 52 C146 60 148 68 147 78 C146 84 148 92 147 96" stroke="url(#waxDrips)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M157 52 C158 62 155 70 157 80" stroke="url(#waxDrips)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="147" cy="97" r="1.4" fill="#faf7ed" />
          {/* Concave top pool */}
          <ellipse cx="152" cy="50" rx="7" ry="2" fill="#c3ba9f" stroke="#7e755f" strokeWidth="0.8" />
          {/* Charred Wick (NEVER disappears) */}
          <path d="M152 50 Q153 42 152 38" stroke="#181512" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <circle cx="152" cy="38" r="1" fill="#000000" />
        </g>
      </svg>
    </div>
  );
};
