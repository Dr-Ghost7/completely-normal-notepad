'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';
import { RotateCcw } from 'lucide-react';

export const Hourglass: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [isTipped, setIsTipped] = useState<boolean>(false);
  const [tipDirection, setTipDirection] = useState<'left' | 'right'>('right');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [sandProgress, setSandProgress] = useState<number>(30); // 0 (empty top) to 100 (full top)

  // Sand trickling animation loop (only flows when upright)
  useEffect(() => {
    if (isTipped) return;

    const interval = setInterval(() => {
      setSandProgress((prev) => {
        if (prev <= 2) {
          // Auto loop or pause at empty
          return 98;
        }
        return prev - 0.5;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isTipped]);

  // Monitor ghost collision to tip the hourglass over
  useEffect(() => {
    if (isTipped || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // Ghost collision with kinetic force tips it over
      if (dist < 105 && Math.hypot(ghost.vx, ghost.vy) > 0.6) {
        setIsTipped(true);
        setTipDirection(ghost.vx > 0 ? 'right' : 'left');
        if (soundEnabled) ghostAudio.playGlassClink(volume);
        break;
      }
    }
  }, [ghosts, isTipped, soundEnabled, volume]);

  const handleRightHourglass = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTipped(false);
    if (soundEnabled) ghostAudio.playGlassClink(volume);
  };

  const handleFlip = () => {
    if (isTipped) {
      setIsTipped(false);
      if (soundEnabled) ghostAudio.playGlassClink(volume);
      return;
    }
    // Flip upside down
    setIsFlipped((prev) => !prev);
    setSandProgress(95);
    if (soundEnabled) ghostAudio.playGlassClink(volume);
  };

  // Top sand height vs bottom sand height
  const topSandPct = sandProgress;
  const bottomSandPct = 100 - sandProgress;

  return (
    <aside
      ref={containerRef}
      aria-label="Antique Occult Hourglass"
      className="fixed left-72 sm:left-80 bottom-4 z-20 pointer-events-auto select-none hidden lg:flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity duration-300"
      style={{ width: '64px', height: '120px' }}
    >
      {/* Subdued Right / Reset Button if Tipped */}
      {isTipped && (
        <button
          type="button"
          onClick={handleRightHourglass}
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded bg-stone-900/95 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[10px] font-sans shadow-md flex items-center gap-1 transition-colors cursor-pointer"
          title="Set hourglass upright"
        >
          <RotateCcw className="w-2.5 h-2.5 text-stone-400" />
          <span>Right</span>
        </button>
      )}

      {/* The Physical Hourglass (Can be upright, flipped, or tipped on its side) */}
      <div
        onClick={handleFlip}
        title={
          isTipped
            ? 'Hourglass tipped over! (Click to set upright)'
            : 'Antique Occult Hourglass (Click to invert • Spirits can tip it over!)'
        }
        style={{
          transformOrigin: 'bottom center',
          transform: isTipped
            ? tipDirection === 'right'
              ? 'translate3d(14px, 14px, 0) rotate(78deg)'
              : 'translate3d(-14px, 14px, 0) rotate(-78deg)'
            : isFlipped
            ? 'rotate(180deg)'
            : 'rotate(0deg)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="relative w-14 h-24 flex flex-col items-center justify-between cursor-pointer"
      >
        {/* Top Dark Wrought-Iron Cap */}
        <div className="w-14 h-2.5 bg-[#141118] border border-[#2b2433] rounded-sm shadow-md flex items-center justify-between px-1 z-20">
          <div className="w-1 h-1 rounded-full bg-[#3d3348]" />
          <div className="w-1 h-1 rounded-full bg-[#3d3348]" />
        </div>

        {/* 3 Turned Support Pillars (Left, Right, and Back) */}
        <div className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-[#1a1520] border-x border-black z-20" />
        <div className="absolute right-1 top-2.5 bottom-2.5 w-1 bg-[#1a1520] border-x border-black z-20" />

        {/* Glass Bulbs Chamber (SVG Geometry) */}
        <svg
          viewBox="0 0 56 80"
          className="w-14 h-20 z-10 overflow-visible fill-none"
        >
          <defs>
            {/* Dark Occult Purple Sand Gradient */}
            <linearGradient id="purpleSand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
          </defs>

          {/* Glass Chamber Outline */}
          <path
            d="M 12 4 Q 12 36, 26 40 Q 12 44, 12 76 L 44 76 Q 44 44, 30 40 Q 44 36, 44 4 Z"
            fill="rgba(255, 255, 255, 0.04)"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.2"
          />

          {/* Upper Glass Specular Glare */}
          <path d="M 15 8 Q 15 28, 22 34" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1" fill="none" />
          <path d="M 15 72 Q 15 52, 22 46" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" fill="none" />

          {/* TOP BULB SAND (Draining) */}
          <clipPath id="topBulbClip">
            <path d="M 12 4 Q 12 36, 26 40 Q 44 36, 44 4 Z" />
          </clipPath>
          <rect
            x="10"
            y={4 + 34 * (1 - topSandPct / 100)}
            width="36"
            height="36"
            fill="url(#purpleSand)"
            clipPath="url(#topBulbClip)"
          />

          {/* CONTINUOUS TRICKLING STREAM THROUGH WAIST (Only when upright and sand remaining) */}
          {!isTipped && topSandPct > 2 && (
            <line
              x1="28"
              y1="38"
              x2="28"
              y2={76 - 30 * (bottomSandPct / 100)}
              stroke="#d8b4fe"
              strokeWidth="1.4"
              strokeDasharray="2,2"
              className="animate-pulse"
            />
          )}

          {/* BOTTOM BULB SAND PILE (Accumulating cone) */}
          <clipPath id="bottomBulbClip">
            <path d="M 26 40 Q 12 44, 12 76 L 44 76 Q 44 44, 30 40 Z" />
          </clipPath>
          <path
            d={`M 14 76 Q 28 ${76 - 28 * (bottomSandPct / 100)}, 42 76 Z`}
            fill="url(#purpleSand)"
            clipPath="url(#bottomBulbClip)"
          />
        </svg>

        {/* Bottom Dark Wrought-Iron Cap */}
        <div className="w-14 h-2.5 bg-[#141118] border border-[#2b2433] rounded-sm shadow-md flex items-center justify-between px-1 z-20">
          <div className="w-1 h-1 rounded-full bg-[#3d3348]" />
          <div className="w-1 h-1 rounded-full bg-[#3d3348]" />
        </div>
      </div>
    </aside>
  );
};
