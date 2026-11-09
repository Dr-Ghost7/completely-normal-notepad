'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';
import { RotateCcw } from 'lucide-react';

export const HangingBroom: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isKnocked, setIsKnocked] = useState(false);

  // Monitor ghost collision to knock broom downwards out of view
  useEffect(() => {
    if (isKnocked || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // Broom center of mass (midway down the long besom handle & brush)
    const centerY = rect.top + rect.height * 0.55;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // Collision trigger: ghost sweeps near the broom and knocks it down
      if (dist < 135 && Math.hypot(ghost.vx, ghost.vy) > 0.4) {
        setIsKnocked(true);
        if (soundEnabled) ghostAudio.playBookThud(volume);
        break;
      }
    }
  }, [ghosts, isKnocked, soundEnabled, volume]);

  const handleHangUp = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsKnocked(false);
    if (soundEnabled) ghostAudio.playGlassClink(volume);
  };

  return (
    <aside
      ref={containerRef}
      aria-label="Witch's Besom Broom Hanging from Hook"
      className="fixed left-[19.5rem] lg:left-[21rem] xl:left-[22.5rem] 2xl:left-[24.5rem] top-[24vh] xl:top-[26vh] z-10 pointer-events-auto select-none hidden lg:flex flex-col items-center opacity-70 hover:opacity-90 transition-opacity duration-500"
      style={{ width: '80px', height: '560px' }}
    >
      {/* Wall Hook (Subtle matte cast iron) */}
      <div
        onClick={isKnocked ? () => handleHangUp() : undefined}
        title={isKnocked ? 'Click to retrieve broom' : 'Iron Wall Hook'}
        className={`relative w-5 h-7 flex flex-col items-center z-20 ${
          isKnocked ? 'cursor-pointer hover:scale-110' : ''
        }`}
      >
        {/* Wall mount backplate */}
        <div className="w-3 h-5 bg-[#120e17] rounded-xs border border-black flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#271f30]" />
        </div>
        {/* Iron curved peg */}
        <div className="w-4 h-3.5 border-b-[2.5px] border-r-[2.5px] border-[#120e17] rounded-br-md -mt-1 -ml-1" />
      </div>

      {/* Discreet Retrieve Pill (Shows only when broom has fallen down out of view) */}
      {isKnocked && (
        <button
          type="button"
          onClick={() => handleHangUp()}
          className="mt-2 px-2 py-0.5 rounded bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[10px] font-sans shadow-md flex items-center gap-1 transition-colors cursor-pointer animate-in fade-in duration-300"
          title="Hang broom back on wall hook"
        >
          <RotateCcw className="w-2.5 h-2.5 text-stone-400" />
          <span>Retrieve</span>
        </button>
      )}

      {/* Broom assembly */}
      <div
        style={{
          transformOrigin: 'top center',
          transform: isKnocked
            ? 'translate3d(0, 130vh, 0) rotate(16deg)'
            : 'translate3d(0, 0, 0) rotate(-1deg)',
          opacity: isKnocked ? 0 : 1,
          pointerEvents: isKnocked ? 'none' : 'auto',
          transition: isKnocked
            ? 'transform 0.9s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0.85s ease-in'
            : 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
        }}
        className="relative flex flex-col items-center -mt-2.5"
      >
        {/* Top Hanging Ring */}
        <div className="w-3 h-3.5 rounded-t-full border-t-2 border-x-2 border-[#2b2133] -mb-1" />

        {/* Long Slender Wooden Handle (~370px tall, clean minimal finish) */}
        <div className="w-2.5 h-[370px] bg-gradient-to-r from-[#21160d] via-[#352315] to-[#1c120a] rounded-full shadow-sm" />

        {/* Minimal Dark Hemp Cord Wrap */}
        <div className="w-6 h-4 bg-[#3d2c1c] border-y border-[#23180e] rounded-xs shadow-inner -mt-1 z-10 flex flex-col justify-evenly py-0.5">
          <div className="w-full h-[1px] bg-[#533d28]" />
          <div className="w-full h-[1px] bg-[#533d28]" />
        </div>

        {/* Clean, Minimal Witch's Besom Head (~180px tall) */}
        <div className="relative w-[72px] h-[180px] -mt-1 flex items-center justify-center">
          <svg viewBox="0 0 72 180" className="w-full h-full fill-none overflow-visible">
            <defs>
              <linearGradient id="besomStrawGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#251b12" />
                <stop offset="35%" stopColor="#3d2c1c" />
                <stop offset="70%" stopColor="#342517" />
                <stop offset="100%" stopColor="#20160d" />
              </linearGradient>
            </defs>

            {/* Smooth, iconic witch's besom flared silhouette */}
            <path
              d="M24 0 C22 45 4 110 0 175 C24 172 48 172 72 175 C68 110 50 45 48 0 Z"
              fill="url(#besomStrawGrad)"
            />

            {/* Subtle minimal contour accents (no busy micro-lines) */}
            <path
              d="M28 2 Q22 90 14 172"
              stroke="#4a3724"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <path
              d="M44 2 Q50 90 58 172"
              stroke="#4a3724"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
            <path
              d="M36 2 Q36 90 36 173"
              stroke="#22180f"
              strokeWidth="1.2"
              strokeOpacity="0.5"
            />
          </svg>
        </div>
      </div>
    </aside>
  );
};
