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

  // Monitor ghost collision to knock broom off its hook
  useEffect(() => {
    if (isKnocked || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 95 && Math.hypot(ghost.vx, ghost.vy) > 0.65) {
        setIsKnocked(true);
        if (soundEnabled) ghostAudio.playBookThud(volume);
        break;
      }
    }
  }, [ghosts, isKnocked, soundEnabled, volume]);

  const handleHangUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsKnocked(false);
    if (soundEnabled) ghostAudio.playGlassClink(volume);
  };

  return (
    <aside
      ref={containerRef}
      aria-label="Old Straw Broom on Wall Hook"
      className="fixed left-2 sm:left-3 lg:left-5 top-16 z-10 pointer-events-auto select-none hidden lg:flex flex-col items-center opacity-65 hover:opacity-90 transition-opacity duration-500"
      style={{ width: '48px', height: '240px' }}
    >
      {/* Re-hang button if knocked down */}
      {isKnocked && (
        <button
          type="button"
          onClick={handleHangUp}
          className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 px-2 py-0.5 rounded bg-stone-900/95 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[10px] font-sans shadow-md flex items-center gap-1 transition-colors cursor-pointer"
          title="Hang broom back on wall hook"
        >
          <RotateCcw className="w-2.5 h-2.5 text-stone-400" />
          <span>Hang</span>
        </button>
      )}

      {/* Cast Iron Wall Hook (Fixed on wall) */}
      <div className="relative w-4 h-6 flex flex-col items-center z-10">
        {/* Wall mount plate */}
        <div className="w-2 h-4 bg-[#141018] rounded-xs border border-black" />
        {/* Hook curve */}
        <div className="w-3.5 h-3 border-b-2 border-r-2 border-[#141018] rounded-br-md -mt-1 -ml-1" />
      </div>

      {/* The Broom (Hanging or Knocked off hook) */}
      <div
        onClick={isKnocked ? handleHangUp : undefined}
        title={isKnocked ? 'Broom knocked off wall (Click to hang back up)' : 'Worn Straw Broom (Ghosts can knock it off its hook!)'}
        style={{
          transformOrigin: 'top center',
          transform: isKnocked ? 'translate3d(-10px, 45px, 0) rotate(38deg)' : 'rotate(-2deg)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={`relative flex flex-col items-center cursor-pointer ${
          isKnocked ? 'hover:scale-105' : 'hover:rotate-1'
        }`}
      >
        {/* Hanging loop / leather strap */}
        <div className="w-2 h-3 rounded-t-full border-t border-x border-[#4a3520] -mb-1" />

        {/* Gnarled Weathered Wood Handle */}
        <div className="w-2 h-36 bg-gradient-to-r from-[#322316] via-[#433120] to-[#251910] rounded-full shadow-sm" />

        {/* Twine wrap binding the bristles */}
        <div className="w-5 h-2.5 bg-[#6b4e31] border-y border-[#3d2916] rounded-xs shadow-inner -mt-0.5 z-10" />

        {/* Straw / Twig Broom Head */}
        <div className="relative w-9 h-18 -mt-0.5 overflow-hidden flex flex-col items-center">
          {/* Bristle Straws Silhouette */}
          <svg viewBox="0 0 36 72" className="w-full h-full fill-none">
            {/* Straw mass */}
            <path
              d="M12 0 C10 18 2 48 0 72 C12 70 24 70 36 72 C34 48 26 18 24 0 Z"
              fill="#423220"
            />
            {/* Individual straw stroke highlights */}
            <path d="M14 0 Q10 35 4 72" stroke="#5a442d" strokeWidth="1.2" />
            <path d="M18 0 Q18 35 18 72" stroke="#523d28" strokeWidth="1" />
            <path d="M22 0 Q26 35 32 72" stroke="#5a442d" strokeWidth="1.2" />
            <path d="M16 2 Q14 40 10 70" stroke="#684f35" strokeWidth="0.8" />
            <path d="M20 2 Q22 40 26 70" stroke="#684f35" strokeWidth="0.8" />
          </svg>
        </div>
      </div>
    </aside>
  );
};
