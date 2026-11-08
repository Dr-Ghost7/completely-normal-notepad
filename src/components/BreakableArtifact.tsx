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
    border: 'border-amber-400/70',
    shardColors: ['#f8fafc', '#fef08a', '#f1f5f9', '#fed7aa'],
  },
  {
    id: 'alchemist-goblet',
    name: 'Emerald Alchemist Glass',
    type: 'goblet',
    color: 'bg-gradient-to-b from-emerald-400/20 via-emerald-600/40 to-teal-950/80',
    glow: 'rgba(52, 211, 153, 0.5)',
    border: 'border-emerald-400/80',
    shardColors: ['#34d399', '#059669', '#10b981', '#065f46'],
  },
  {
    id: 'obsidian-mirror',
    name: 'Obsidian Scrying Dish',
    type: 'mirror',
    color: 'bg-gradient-to-tr from-black via-purple-950 to-neutral-900',
    glow: 'rgba(192, 132, 252, 0.5)',
    border: 'border-purple-500/70',
    shardColors: ['#1e1b4b', '#3b0764', '#0f172a', '#2e1065'],
  },
];

export const BreakableArtifact: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);
  const [variantIndex, setVariantIndex] = useState(0);
  const [isBroken, setIsBroken] = useState(false);
  const [repairCount, setRepairCount] = useState(0);

  const current = VARIANTS[variantIndex];

  // Ghost collision detection to break artifact
  useEffect(() => {
    if (isBroken || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 80) {
        setIsBroken(true);
        if (soundEnabled) ghostAudio.playGlassShatter(volume);
        break;
      }
    }
  }, [ghosts, isBroken, soundEnabled, volume]);

  const handleRestore = () => {
    setIsBroken(false);
    setRepairCount((c) => c + 1);
    // Cycle to next fun variant on restore!
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
    <div
      ref={containerRef}
      className="fixed right-6 sm:right-10 top-24 z-30 pointer-events-auto select-none flex flex-col items-center group"
    >
      {/* Restore Button when shattered */}
      {isBroken && (
        <button
          type="button"
          onClick={handleRestore}
          className="mb-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-700 via-rose-700 to-purple-800 text-white font-serif text-[11px] font-medium shadow-xl shadow-amber-950/60 border border-amber-400/80 cursor-pointer flex items-center gap-1.5 animate-bounce"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Mend Artifact</span>
        </button>
      )}

      {/* Artifact Render */}
      <div
        onClick={handleManualBreak}
        title={isBroken ? 'Shattered artifact! Click Mend above to restore' : `${current.name} (Click or let ghosts break it!)`}
        className="relative w-20 h-20 cursor-pointer flex items-center justify-center"
      >
        {!isBroken ? (
          /* INTACT ARTIFACT */
          <div
            className={`relative rounded-full transition-transform duration-300 group-hover:scale-105 shadow-xl ${
              current.type === 'goblet'
                ? 'w-14 h-18 rounded-b-3xl'
                : 'w-18 h-18 rounded-full'
            } ${current.color} border-2 ${current.border}`}
            style={{ boxShadow: `0 0 20px ${current.glow}` }}
          >
            {/* Specular curved glint */}
            <div className="absolute top-2 left-2 w-4 h-2 rounded-full bg-white/40 blur-[0.5px]" />

            {/* Golden Kintsugi / Occult Inscription Detail if previously repaired */}
            {repairCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-70">
                <span className="text-[10px] text-amber-400 font-serif font-bold animate-pulse">
                  ✧ 🪞 ✧
                </span>
              </div>
            )}
          </div>
        ) : (
          /* SHATTERED SHARDS */
          <div className="relative w-20 h-20">
            {/* Shard 1 */}
            <div
              className="absolute top-1 left-2 w-7 h-7 rounded-tl-xl border border-amber-300/80 shadow-md transform -rotate-18 -translate-x-3 -translate-y-2 animate-in duration-200"
              style={{ backgroundColor: current.shardColors[0] }}
            />
            {/* Shard 2 */}
            <div
              className="absolute top-2 right-1 w-8 h-6 rounded-tr-lg border border-amber-300/80 shadow-md transform rotate-25 translate-x-4 -translate-y-1"
              style={{ backgroundColor: current.shardColors[1] }}
            />
            {/* Shard 3 */}
            <div
              className="absolute bottom-1 left-3 w-8 h-8 rounded-bl-2xl border border-amber-300/80 shadow-md transform rotate-45 -translate-x-2 translate-y-3"
              style={{ backgroundColor: current.shardColors[2] }}
            />
            {/* Shard 4 */}
            <div
              className="absolute bottom-2 right-2 w-6 h-7 rounded-br-lg border border-amber-300/80 shadow-md transform -rotate-30 translate-x-3 translate-y-2"
              style={{ backgroundColor: current.shardColors[3] }}
            />
          </div>
        )}
      </div>

      {/* Artifact Title / Subtext */}
      <span className="mt-1 text-[9px] font-mono text-purple-300/60 uppercase tracking-wider text-center">
        {isBroken ? 'Shattered' : current.name}
      </span>
    </div>
  );
};
