'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';
import { Sparkles, Wand2 } from 'lucide-react';

interface ArtifactVariant {
  id: string;
  name: string;
  type: 'plate' | 'goblet' | 'mirror';
  color: string;
  glow: string;
  border: string;
  shardColors: string[];
}

const VARIANTS: ArtifactVariant[] = [
  {
    id: 'kintsugi-plate',
    name: 'Celestial Porcelain Plate',
    type: 'plate',
    color: 'bg-gradient-to-br from-stone-100 via-purple-100 to-amber-50',
    glow: 'rgba(251, 191, 36, 0.4)',
    border: 'border-amber-400/80',
    shardColors: ['#f8fafc', '#fef08a', '#f1f5f9', '#fed7aa', '#e2e8f0'],
  },
  {
    id: 'alchemist-goblet',
    name: 'Emerald Alchemist Chalice',
    type: 'goblet',
    color: 'bg-gradient-to-b from-emerald-400/20 via-emerald-600/40 to-teal-950/80',
    glow: 'rgba(52, 211, 153, 0.5)',
    border: 'border-emerald-400/90',
    shardColors: ['#34d399', '#059669', '#10b981', '#065f46', '#022c22'],
  },
  {
    id: 'obsidian-mirror',
    name: 'Obsidian Scrying Dish',
    type: 'mirror',
    color: 'bg-gradient-to-tr from-black via-purple-950 to-neutral-900',
    glow: 'rgba(192, 132, 252, 0.5)',
    border: 'border-purple-500/80',
    shardColors: ['#1e1b4b', '#3b0764', '#0f172a', '#2e1065', '#020617'],
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

      // Collision trigger (enlarged hit radius for bigger dishes)
      if (dist < 110) {
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
      className="fixed left-4 sm:left-6 lg:left-10 top-18 sm:top-22 z-20 pointer-events-auto select-none hidden lg:flex flex-col items-center"
      style={{ width: '300px' }}
    >
      {/* Restoring Mend Button (Floats right above dish when broken) */}
      {isBroken && (
        <button
          type="button"
          onClick={handleRestore}
          className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-700 via-rose-700 to-purple-800 text-white font-serif text-xs font-semibold shadow-2xl border border-amber-400 cursor-pointer flex items-center gap-1.5 animate-bounce hover:scale-105 transition-transform"
          title="Mend dish with mystical golden kintsugi"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Mend ({repairCount > 0 ? `Restored ×${repairCount}` : 'Restore'})</span>
        </button>
      )}

      {/* ========================================================
          ENLARGED DISH / CHALICE / OBJECT
          Rests firmly on top of the solid black shelf plank
          ======================================================== */}
      <div
        ref={itemRef}
        onClick={handleManualBreak}
        title={isBroken ? 'Shattered artifact on black shelf' : `${current.name} (Click to break or ghosts may shatter it!)`}
        className="relative cursor-pointer transition-transform hover:scale-102 flex flex-col items-center justify-end"
        style={{ minHeight: '144px' }}
      >
        {!isBroken ? (
          /* Intact State */
          <div className="relative flex flex-col items-center">
            {/* 1. Large Celestial Porcelain Plate */}
            {current.type === 'plate' && (
              <div className="relative flex flex-col items-center">
                {/* Black Display Easel Stand Behind Plate */}
                <div className="absolute -bottom-1 w-18 h-7 bg-black rounded-t-sm z-0" />
                <div
                  className={`w-32 h-32 sm:w-34 sm:h-34 rounded-full border-3 ${current.border} ${current.color} shadow-2xl relative overflow-hidden flex items-center justify-center z-10`}
                  style={{ boxShadow: `0 8px 24px ${current.glow}` }}
                >
                  {/* Decorative crackle ring */}
                  <div className="w-22 h-22 rounded-full border border-purple-400/40 bg-black/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400/80 animate-pulse" />
                  </div>
                  {/* Gold rim accent lines */}
                  <div className="absolute inset-1.5 rounded-full border border-amber-300/40 pointer-events-none" />
                </div>
              </div>
            )}

            {/* 2. Large Emerald Alchemist Chalice */}
            {current.type === 'goblet' && (
              <div className="flex flex-col items-center z-10">
                {/* Goblet Cup */}
                <div
                  className={`w-20 h-22 rounded-b-3xl border-3 ${current.border} ${current.color} shadow-2xl relative overflow-hidden flex items-center justify-center`}
                  style={{ boxShadow: `0 8px 24px ${current.glow}` }}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-400/35 blur-[3px]" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-emerald-300/50 blur-[1px]" />
                </div>
                {/* Thick Solid Black Stem */}
                <div className="w-4 h-8 bg-black border-x border-neutral-900" />
                {/* Heavy Solid Black Base */}
                <div className="w-18 h-3.5 rounded-full bg-black border border-neutral-900" />
              </div>
            )}

            {/* 3. Large Obsidian Scrying Dish */}
            {current.type === 'mirror' && (
              <div className="relative flex flex-col items-center z-10">
                <div className="absolute -bottom-1 w-18 h-7 bg-black rounded-t-sm z-0" />
                <div
                  className={`w-32 h-32 sm:w-34 sm:h-34 rounded-full border-3 ${current.border} ${current.color} shadow-2xl relative overflow-hidden flex items-center justify-center z-10`}
                  style={{ boxShadow: `0 8px 26px ${current.glow}` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-300/15 to-transparent" />
                  <div className="w-20 h-20 rounded-full border-2 border-purple-500/50 bg-purple-950/60 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 blur-[3px]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Shattered Shards State (Scattered across the shelf plank) */
          <div className="w-44 h-20 relative flex items-center justify-center">
            <div
              className="absolute w-7 h-4 rounded-sm transform -rotate-45 -translate-x-12 translate-y-4"
              style={{ backgroundColor: current.shardColors[0] }}
            />
            <div
              className="absolute w-8 h-5 rounded-sm transform rotate-18 -translate-x-3 translate-y-3"
              style={{ backgroundColor: current.shardColors[1] }}
            />
            <div
              className="absolute w-6 h-3.5 rounded-sm transform rotate-55 translate-x-5 translate-y-2"
              style={{ backgroundColor: current.shardColors[2] }}
            />
            <div
              className="absolute w-7 h-4.5 rounded-sm transform -rotate-25 translate-x-12 translate-y-5"
              style={{ backgroundColor: current.shardColors[3] }}
            />
            <div
              className="absolute w-5 h-3 rounded-sm transform rotate-85 -translate-x-7 translate-y-5"
              style={{ backgroundColor: current.shardColors[4] }}
            />
            <div
              className="absolute w-4 h-2.5 rounded-sm transform -rotate-65 translate-x-18 translate-y-5"
              style={{ backgroundColor: current.shardColors[0] }}
            />
          </div>
        )}
      </div>

      {/* ========================================================
          THICK SOLID BLACK WALL SHELF
          "like those wall shelf and bigger and thicker, no highlights, just black"
          ======================================================== */}
      <div className="relative w-full flex flex-col items-center">
        {/* Main Thick Black Shelf Plank (16px thick, pure black, no highlights) */}
        <div className="w-full h-4 bg-black rounded-[2px]" />

        {/* Heavy Black Wall Brackets Underneath */}
        <div className="w-full flex justify-between px-8 -mt-0.5 pointer-events-none">
          {/* Left Heavy Bracket */}
          <div className="flex flex-col items-center">
            {/* L-bracket angled strut */}
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
              {/* Vertical wall leg */}
              <rect x="0" y="0" width="8" height="48" fill="#000000" />
              {/* Heavy diagonal brace */}
              <polygon points="0,42 8,42 38,0 28,0" fill="#000000" />
            </svg>
          </div>

          {/* Right Heavy Bracket */}
          <div className="flex flex-col items-center">
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
              {/* Vertical wall leg */}
              <rect x="36" y="0" width="8" height="48" fill="#000000" />
              {/* Heavy diagonal brace */}
              <polygon points="36,42 44,42 16,0 6,0" fill="#000000" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
};
