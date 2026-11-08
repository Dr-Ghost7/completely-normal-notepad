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
    // Target the lower half of the broom where ghosts are likely to fly
    const centerY = rect.top + rect.height * 0.6;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // Collision trigger: broom gets knocked off its hook and plunges down out of view
      if (dist < 130 && Math.hypot(ghost.vx, ghost.vy) > 0.45) {
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
      aria-label="Old Straw Broom Hanging Between Dishes and Notepad"
      className="fixed left-[20.5rem] lg:left-[21.5rem] xl:left-[23rem] 2xl:left-[25rem] top-10 z-10 pointer-events-auto select-none hidden lg:flex flex-col items-center opacity-70 hover:opacity-95 transition-opacity duration-500"
      style={{ width: '84px', height: '480px' }}
    >
      {/* Heavy Cast Iron Wall Hook (Fixed firmly to wall) */}
      <div
        onClick={isKnocked ? () => handleHangUp() : undefined}
        title={isKnocked ? 'Click to retrieve broom' : 'Cast Iron Wall Hook'}
        className={`relative w-6 h-8 flex flex-col items-center z-20 ${
          isKnocked ? 'cursor-pointer hover:scale-110' : ''
        }`}
      >
        {/* Wall mount plate with bolt */}
        <div className="w-3.5 h-6 bg-[#110d16] rounded-xs border border-black flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#2d2438]" />
        </div>
        {/* Hook curve reaching up */}
        <div className="w-5 h-4 border-b-3 border-r-3 border-[#110d16] rounded-br-lg -mt-1.5 -ml-1.5" />
      </div>

      {/* Subdued Retrieve Button (Appears below hook when broom has fallen out of view) */}
      {isKnocked && (
        <button
          type="button"
          onClick={() => handleHangUp()}
          className="mt-2 px-2.5 py-0.5 rounded bg-stone-900/95 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[10px] font-sans shadow-md flex items-center gap-1 transition-colors cursor-pointer animate-in fade-in duration-300"
          title="Retrieve broom and hang back on hook"
        >
          <RotateCcw className="w-2.5 h-2.5 text-stone-400" />
          <span>Retrieve</span>
        </button>
      )}

      {/* ========================================================
          WAY BIGGER LIFE-SIZED OLD STRAW BROOM
          When knocked by a ghost, plunges downwards out of view!
          ======================================================== */}
      <div
        style={{
          transformOrigin: 'top center',
          transform: isKnocked
            ? 'translate3d(0, 130vh, 0) rotate(18deg)'
            : 'translate3d(0, 0, 0) rotate(-1deg)',
          opacity: isKnocked ? 0 : 1,
          pointerEvents: isKnocked ? 'none' : 'auto',
          transition: isKnocked
            ? 'transform 0.9s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0.85s ease-in'
            : 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
        }}
        className="relative flex flex-col items-center -mt-3"
      >
        {/* Iron Hanging Ring at top of handle */}
        <div className="w-3.5 h-4 rounded-t-full border-t-2 border-x-2 border-[#2b2133] -mb-1" />

        {/* Gnarled Weathered Long Wooden Handle (300px long) */}
        <div className="w-3 h-[300px] bg-gradient-to-r from-[#24170e] via-[#382618] to-[#1c1108] rounded-full shadow-sm relative">
          {/* Subtle wood grain knots */}
          <div className="absolute top-20 left-0.5 w-1 h-2 rounded-full bg-[#180e07]" />
          <div className="absolute top-48 right-0.5 w-1 h-3 rounded-full bg-[#180e07]" />
        </div>

        {/* Thick Twine Cord Binding Collars */}
        <div className="w-7 h-4 bg-[#543d25] border-y-2 border-[#2d1f11] rounded-xs shadow-inner -mt-1 z-10 flex flex-col justify-evenly py-0.5">
          <div className="w-full h-0.5 bg-[#6d5133]" />
          <div className="w-full h-0.5 bg-[#6d5133]" />
        </div>

        {/* Bushy Rustic Straw Broom Head (160px long, flared silhouette) */}
        <div className="relative w-[76px] h-[160px] -mt-1 overflow-hidden flex flex-col items-center">
          <svg viewBox="0 0 76 160" className="w-full h-full fill-none">
            {/* Dark inner straw mass */}
            <path
              d="M26 0 C22 40 4 100 0 160 C25 155 51 155 76 160 C72 100 54 40 50 0 Z"
              fill="#38291a"
            />
            {/* Straw layers & individual twig lines */}
            <path d="M30 0 Q22 75 8 160" stroke="#4f3b26" strokeWidth="2.5" />
            <path d="M38 0 Q38 80 38 160" stroke="#483522" strokeWidth="2.5" />
            <path d="M46 0 Q54 75 68 160" stroke="#4f3b26" strokeWidth="2.5" />

            <path d="M34 2 Q28 85 18 155" stroke="#5c442c" strokeWidth="1.8" />
            <path d="M42 2 Q48 85 58 155" stroke="#5c442c" strokeWidth="1.8" />

            <path d="M31 10 Q24 95 12 150" stroke="#6b5135" strokeWidth="1.2" />
            <path d="M45 10 Q52 95 64 150" stroke="#6b5135" strokeWidth="1.2" />
            <path d="M38 10 Q36 100 32 155" stroke="#6b5135" strokeWidth="1.2" />
            <path d="M38 10 Q40 100 44 155" stroke="#6b5135" strokeWidth="1.2" />

            {/* Jagged bottom straw ends */}
            <path
              d="M0 160 L5 152 L10 160 L16 153 L22 160 L28 154 L34 160 L40 152 L46 160 L52 153 L58 160 L64 154 L70 160 L76 156"
              stroke="#302316"
              strokeWidth="1.5"
            />
          </svg>
        </div>
      </div>
    </aside>
  );
};
