'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { Sparkles, Unlock, RotateCcw } from 'lucide-react';
import { ghostAudio } from '../lib/ghostAudio';

interface SpiritJarProps {
  onJarBoundsChange?: (bounds: DOMRect | null) => void;
}

export const SpiritJar: React.FC<SpiritJarProps> = ({ onJarBoundsChange }) => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const releaseGhostFromJar = useGhostStore((state) => state.releaseGhostFromJar);
  const releaseAllJarGhosts = useGhostStore((state) => state.releaseAllJarGhosts);
  const restoreGhost = useGhostStore((state) => state.restoreGhost);
  const showJar = useGhostStore((state) => state.settings.showJar);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const jarRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Keep jar bounding box synced for drag-and-drop hit detection
  useEffect(() => {
    const updateBounds = () => {
      if (jarRef.current) {
        const rect = jarRef.current.getBoundingClientRect();
        if (onJarBoundsChange) onJarBoundsChange(rect);
        (window as unknown as { spiritJarRect: DOMRect }).spiritJarRect = rect;
      } else {
        if (onJarBoundsChange) onJarBoundsChange(null);
        (window as unknown as { spiritJarRect: null }).spiritJarRect = null;
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds);

    const handleGhostDragMove = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; isDragging: boolean }>;
      if (!customEvent.detail || !jarRef.current) return;
      const { x, y, isDragging } = customEvent.detail;
      if (!isDragging) {
        setIsDragOver(false);
        return;
      }
      const rect = jarRef.current.getBoundingClientRect();
      const over =
        x >= rect.left - 30 &&
        x <= rect.right + 30 &&
        y >= rect.top - 30 &&
        y <= rect.bottom + 30;
      setIsDragOver(over);
    };

    window.addEventListener('ghost-drag-move', handleGhostDragMove);

    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds);
      window.removeEventListener('ghost-drag-move', handleGhostDragMove);
    };
  }, [onJarBoundsChange, showJar]);

  if (!showJar) return null;

  const trappedGhosts = ghosts.filter((g) => g.isTrappedInJar);

  // Separate sad regret ghosts from happy/neutral floating ghosts
  const sadGhosts = trappedGhosts.filter((g) => g.type === 'regret');
  const happyGhosts = trappedGhosts.filter((g) => g.type !== 'regret');

  return (
    <aside
      ref={jarRef}
      aria-label="Spirit Punishment Jar"
      className="fixed right-4 sm:right-8 bottom-6 z-40 w-44 sm:w-52 pointer-events-auto select-none transition-all duration-300 group"
    >
      <div className="relative">
        {/* Antique Wood Cork Stopper */}
        <div className="mx-auto w-24 h-6 bg-gradient-to-b from-[#8b5a2b] via-[#6d441e] to-[#452710] rounded-t-lg border-2 border-[#2e1909] shadow-md flex items-center justify-center relative">
          {trappedGhosts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                releaseAllJarGhosts();
                if (soundEnabled) ghostAudio.playGlassClink(volume);
              }}
              className="absolute -top-3 px-2.5 py-0.5 rounded-md bg-stone-900/95 hover:bg-stone-800 text-amber-200 border border-amber-600/70 shadow-lg cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-mono"
              title="Uncork jar & release all trapped spirits"
            >
              <Unlock className="w-3 h-3 text-amber-300" />
              <span>Uncork</span>
            </button>
          )}
        </div>

        {/* Jar Neck Ring with Twine String Wrap */}
        <div className="mx-auto w-32 h-3.5 bg-white/10 border-x-2 border-t border-white/30 rounded-t-xl backdrop-blur-sm shadow-inner relative flex items-center justify-center">
          {/* Hemp Twine Cord Wrapped Around Neck */}
          <div className="absolute inset-x-2 h-1 bg-[#7d5631] border-y border-[#4a2e15] rounded-full shadow-sm" />
          {/* Twine Knot */}
          <div className="absolute left-7 w-2.5 h-2.5 rounded-full bg-[#6d4624] border border-[#3e2410] -top-0.5 shadow-sm" />
        </div>

        {/* ========================================================
            SMALL RUSTIC HORROR SPECIMEN TAG
            "something simple, one-two words"
            ======================================================== */}
        <div className="absolute left-6 top-3 z-30 pointer-events-auto select-none transition-transform duration-300 origin-top-left hover:rotate-[-3deg] -rotate-6">
          {/* Natural Twine String Loop from Neck into Tag Eyelet */}
          <svg width="24" height="18" viewBox="0 0 24 18" className="overflow-visible block ml-6">
            <path
              d="M 6 0 Q 7 8, 12 16 Q 16 8, 17 0"
              stroke="#8c6138"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
            />
            {/* Knot at Eyelet */}
            <circle cx="12" cy="16" r="1.8" fill="#5c3a1c" />
          </svg>

          {/* Simple Small Weathered Tag */}
          <div className="relative w-[76px] -mt-0.5 bg-[#dfd4b8] border border-[#a69168] shadow-lg rounded-[2px] py-1.5 px-1.5 flex flex-col items-center">
            {/* Tag Eyelet Hole */}
            <div className="w-2 h-2 rounded-full bg-[#3d2e1b] border border-[#a69168] -mt-2 mb-1 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-[#dfd4b8]" />
            </div>

            {/* Simple 2 Words */}
            <span className="text-[9.5px] font-mono font-black text-[#851818] tracking-wider uppercase text-center select-none leading-none">
              DON&apos;T OPEN
            </span>
          </div>
        </div>

        {/* Clear Glass Chamber with Visible Floating Ghosts */}
        <div
          className={`relative w-full h-72 sm:h-80 rounded-3xl transition-all duration-300 overflow-hidden flex flex-col justify-between p-3 border-2 backdrop-blur-md ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_40px_rgba(52,211,153,0.7)] scale-105'
              : 'border-white/30 bg-gradient-to-b from-white/10 via-white/5 to-purple-950/30 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_0_25px_rgba(255,255,255,0.12)]'
          }`}
        >
          {/* Glass Curved Specular Glare */}
          <div className="absolute left-2 top-2 bottom-2 w-2 rounded-full bg-gradient-to-b from-white/40 via-white/15 to-transparent pointer-events-none" />
          <div className="absolute right-2 top-4 bottom-4 w-1 rounded-full bg-white/20 pointer-events-none" />

          {/* Bottom Ectoplasm Pool (Where sad ghosts linger) */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-500/25 via-purple-700/15 to-transparent pointer-events-none animate-ectoplasm-pulse" />

          {/* Drop indicator prompt when dragging ghost over jar */}
          {isDragOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-emerald-950/70 text-emerald-200 animate-in fade-in duration-150">
              <span className="text-3xl animate-bounce">🏺</span>
              <span className="text-xs font-serif font-bold mt-1 tracking-wider uppercase">
                Drop to Seal!
              </span>
            </div>
          )}

          {/* VISIBLE FLOATING GHOSTS INSIDE THE JAR */}
          <div className="relative w-full h-full">
            {trappedGhosts.length > 0 && (
              <>
                {/* 1. UPPER & MIDDLE SECTION: Happy / Mischievous Ghosts Floating High */}
                {happyGhosts.map((ghost, idx) => {
                  // Distribute horizontally and vertically across the upper/mid jar
                  const topPos = 16 + idx * 36;
                  const leftPos = 10 + (idx % 2) * 24;

                  return (
                    <div
                      key={ghost.id}
                      style={{
                        top: `${Math.min(140, topPos)}px`,
                        left: `${leftPos}px`,
                        animationDuration: `${1800 + (ghost.createdAt % 800)}ms`,
                      }}
                      className="absolute z-20 group/ghost px-2 py-1 rounded-xl bg-white/95 text-zinc-950 shadow-lg border border-white flex items-center gap-1 text-[11px] font-serif animate-bounce transition-transform cursor-pointer hover:scale-110"
                      onClick={() => restoreGhost(ghost.id)}
                      title={`"${ghost.text}" — Click to pluck out and return to notepad`}
                    >
                      <span
                        className={`font-bold truncate max-w-[70px] px-0.5 ${
                          ghost.fontFamily === 'wingdings'
                            ? 'font-wingdings text-xs tracking-wider'
                            : ghost.fontFamily === 'papyrus'
                            ? 'font-papyrus'
                            : ghost.fontFamily === 'modern'
                            ? 'font-sans-undertale'
                            : 'font-serif'
                        }`}
                      >
                        "{ghost.text}"
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          releaseGhostFromJar(ghost.id);
                          if (soundEnabled) ghostAudio.playGlassClink(volume);
                        }}
                        className="p-0.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                        title="Release spirit"
                      >
                        <Unlock className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}

                {/* 2. BOTTOM SECTION: Sad Regret Ghosts Floating Down at the Bottom */}
                {sadGhosts.map((ghost, idx) => {
                  const bottomPos = 12 + idx * 28;
                  const leftPos = 12 + ((idx + 1) % 2) * 22;

                  return (
                    <div
                      key={ghost.id}
                      style={{
                        bottom: `${bottomPos}px`,
                        left: `${leftPos}px`,
                        animationDuration: `${2800 + (ghost.createdAt % 1000)}ms`,
                      }}
                      className="absolute z-20 group/ghost px-2 py-1 rounded-xl bg-rose-100/95 text-rose-950 shadow-md border border-rose-300 flex items-center gap-1 text-[11px] font-serif animate-pulse transition-transform cursor-pointer hover:scale-110"
                      onClick={() => restoreGhost(ghost.id)}
                      title={`"${ghost.text}" (Sad Regret Ghost) — Sinking mournfully at bottom. Click to restore.`}
                    >
                      <span
                        className={`font-bold truncate max-w-[70px] px-0.5 text-rose-950 ${
                          ghost.fontFamily === 'wingdings'
                            ? 'font-wingdings text-xs tracking-wider'
                            : ghost.fontFamily === 'papyrus'
                            ? 'font-papyrus'
                            : ghost.fontFamily === 'modern'
                            ? 'font-sans-undertale'
                            : 'font-serif'
                        }`}
                      >
                        "{ghost.text}"
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          releaseGhostFromJar(ghost.id);
                          if (soundEnabled) ghostAudio.playGlassClink(volume);
                        }}
                        className="p-0.5 rounded hover:bg-rose-200 text-rose-900 transition-colors cursor-pointer"
                        title="Release from bottom"
                      >
                        <Unlock className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
