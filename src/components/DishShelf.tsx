'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';
import { RotateCcw } from 'lucide-react';

interface DishVariant {
  id: string;
  name: string;
  type: 'plate' | 'glass' | 'mug';
}

const VARIANTS: DishVariant[] = [
  {
    id: 'ceramic-plate',
    name: 'Ceramic Dinner Plate',
    type: 'plate',
  },
  {
    id: 'drinking-glass',
    name: 'Clear Drinking Glass',
    type: 'glass',
  },
  {
    id: 'coffee-mug',
    name: 'Stoneware Coffee Mug',
    type: 'mug',
  },
];

export const DishShelf: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);

  const [variantIndex, setVariantIndex] = useState(0);
  const [isBroken, setIsBroken] = useState(false);
  const [repairCount, setRepairCount] = useState(0);

  const current = VARIANTS[variantIndex];

  // Ghost collision detection to break dish
  useEffect(() => {
    if (isBroken || !itemRef.current) return;

    const rect = itemRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 105) {
        setIsBroken(true);
        if (soundEnabled) ghostAudio.playGlassShatter(volume);
        break;
      }
    }
  }, [ghosts, isBroken, soundEnabled, volume]);

  const handleRestore = () => {
    setIsBroken(false);
    setRepairCount((c) => c + 1);
    setVariantIndex((prev) => (prev + 1) % VARIANTS.length);
    if (soundEnabled) ghostAudio.playMendChime(volume);
  };

  const handleManualBreak = () => {
    if (!isBroken) {
      setIsBroken(true);
      if (soundEnabled) ghostAudio.playGlassShatter(volume);
    }
  };

  return (
    <aside
      ref={containerRef}
      aria-label="Wall Shelf with Dishes"
      className="fixed left-4 sm:left-6 lg:left-10 top-20 z-20 pointer-events-auto select-none hidden lg:block"
      style={{ width: '300px', height: '220px' }}
    >
      {/* ========================================================
          SUBDUED RESTORE BUTTON (Absolute positioning: ZERO layout shift)
          Clean, quiet, minimal — no bouncing, no neon gradients.
          ======================================================== */}
      {isBroken && (
        <button
          type="button"
          onClick={handleRestore}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 rounded-md bg-stone-900/95 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[11px] font-sans shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Restore dish onto shelf"
        >
          <RotateCcw className="w-3 h-3 text-stone-400" />
          <span>Replace Dish</span>
        </button>
      )}

      {/* ========================================================
          NORMAL, GROUNDED EVERYDAY DISHES
          Anchored directly onto the top of the shelf plank (bottom: 80px)
          ======================================================== */}
      <div
        ref={itemRef}
        onClick={handleManualBreak}
        title={isBroken ? 'Broken dish on shelf (Click Replace above)' : `${current.name} (Click to break or ghosts may knock it!)`}
        className="absolute left-1/2 -translate-x-1/2 bottom-[80px] z-10 cursor-pointer flex flex-col items-center justify-end"
        style={{ width: '160px', height: '136px' }}
      >
        {!isBroken ? (
          /* Intact Normal Household Tableware */
          <div className="relative flex flex-col items-center justify-end h-full">
            {/* 1. Classic Ceramic Dinner Plate */}
            {current.type === 'plate' && (
              <div className="relative flex flex-col items-center">
                {/* Minimalist wire plate stand behind */}
                <div className="absolute -bottom-1 w-12 h-6 border-b-2 border-x-2 border-stone-900 rounded-b-sm z-0" />
                {/* Ceramic Plate */}
                <div className="w-28 h-28 sm:w-30 sm:h-30 rounded-full bg-[#f1ece1] border-2 border-[#d5cebf] shadow-md relative flex items-center justify-center z-10">
                  {/* Subtle painted ceramic rim groove */}
                  <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full border border-[#4a3f35]/30 bg-[#ece7dc]" />
                  {/* Center indentation */}
                  <div className="absolute w-16 h-16 rounded-full border border-[#cfc8b8] bg-[#f4efe5]" />
                </div>
              </div>
            )}

            {/* 2. Normal Clear Drinking Glass / Bistro Tumbler */}
            {current.type === 'glass' && (
              <div className="relative flex flex-col items-center">
                {/* Glass Tumbler Body */}
                <div className="w-16 h-24 rounded-b-lg border-2 border-white/30 bg-gradient-to-b from-white/10 via-white/5 to-white/15 backdrop-blur-[1px] shadow-sm relative flex flex-col justify-between overflow-hidden">
                  {/* Top glass rim highlight */}
                  <div className="w-full h-1 bg-white/30" />
                  {/* Vertical fluted glass facets */}
                  <div className="flex justify-evenly h-full opacity-25 py-1">
                    <div className="w-0.5 h-full bg-white/40" />
                    <div className="w-0.5 h-full bg-white/40" />
                    <div className="w-0.5 h-full bg-white/40" />
                  </div>
                  {/* Heavy thick glass base */}
                  <div className="w-full h-3 bg-white/20 border-t border-white/20" />
                </div>
              </div>
            )}

            {/* 3. Everyday Stoneware Coffee Mug */}
            {current.type === 'mug' && (
              <div className="relative flex items-center">
                {/* Ceramic Mug Body */}
                <div className="w-20 h-22 rounded-b-xl bg-[#52443b] border-2 border-[#3d322b] shadow-md relative overflow-hidden flex flex-col justify-between">
                  {/* Top inner lip / coffee depth */}
                  <div className="w-full h-3 bg-[#261e19] border-b border-[#3d322b] rounded-t-sm" />
                  {/* Matte speckled ceramic texture */}
                  <div className="w-full h-full bg-gradient-to-r from-black/20 via-transparent to-white/10" />
                </div>
                {/* Mug Handle */}
                <div className="w-6 h-14 -ml-1 border-4 border-l-0 border-[#52443b] rounded-r-2xl" />
              </div>
            )}
          </div>
        ) : (
          /* Broken State: Real ceramic / glass shards resting flat on the shelf */
          <div className="relative w-40 h-10 flex items-end justify-center">
            {current.type === 'plate' && (
              <>
                <div className="absolute w-8 h-4 bg-[#f1ece1] border border-[#d5cebf] rounded-sm transform -rotate-12 -translate-x-12 translate-y-0.5" />
                <div className="absolute w-10 h-5 bg-[#ece7dc] border border-[#d5cebf] rounded-sm transform rotate-18 -translate-x-4" />
                <div className="absolute w-7 h-4 bg-[#f4efe5] border border-[#d5cebf] rounded-sm transform rotate-45 translate-x-5" />
                <div className="absolute w-9 h-4 bg-[#f1ece1] border border-[#d5cebf] rounded-sm transform -rotate-15 translate-x-14 translate-y-0.5" />
                <div className="absolute w-4 h-2.5 bg-[#e4ded0] border border-[#d5cebf] rounded-sm transform rotate-75 translate-x-0" />
              </>
            )}

            {current.type === 'glass' && (
              <>
                <div className="absolute w-7 h-3 bg-white/25 border border-white/40 rounded-sm transform -rotate-25 -translate-x-10" />
                <div className="absolute w-8 h-4 bg-white/20 border border-white/40 rounded-sm transform rotate-15 -translate-x-2" />
                <div className="absolute w-6 h-3 bg-white/30 border border-white/40 rounded-sm transform -rotate-40 translate-x-6" />
                <div className="absolute w-5 h-2.5 bg-white/20 border border-white/40 rounded-sm transform rotate-60 translate-x-12" />
              </>
            )}

            {current.type === 'mug' && (
              <>
                <div className="absolute w-9 h-5 bg-[#52443b] border border-[#3d322b] rounded-sm transform -rotate-15 -translate-x-10" />
                <div className="absolute w-7 h-4 bg-[#52443b] border border-[#3d322b] rounded-sm transform rotate-30 translate-x-2" />
                {/* Broken handle piece */}
                <div className="absolute w-5 h-8 border-3 border-l-0 border-[#52443b] rounded-r-xl transform rotate-85 translate-x-11 translate-y-1" />
              </>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          THICK SOLID BLACK WALL SHELF (LOCKED AT TOP: 140PX)
          Zero layout shift, zero vertical nudging, pure solid black.
          ======================================================== */}
      <div className="absolute top-[140px] left-0 w-full flex flex-col items-center">
        {/* Main Thick Black Shelf Plank (16px thick, pure black, no highlights) */}
        <div className="w-full h-4 bg-black rounded-[2px]" />

        {/* Heavy Black Wall Brackets Underneath */}
        <div className="w-full flex justify-between px-8 -mt-0.5 pointer-events-none">
          {/* Left Bracket */}
          <div className="flex flex-col items-center">
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
              <rect x="0" y="0" width="8" height="48" fill="#000000" />
              <polygon points="0,42 8,42 38,0 28,0" fill="#000000" />
            </svg>
          </div>

          {/* Right Bracket */}
          <div className="flex flex-col items-center">
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
              <rect x="36" y="0" width="8" height="48" fill="#000000" />
              <polygon points="36,42 44,42 16,0 6,0" fill="#000000" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
};
