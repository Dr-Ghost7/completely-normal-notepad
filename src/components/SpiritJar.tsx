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
              className="absolute -top-3.5 px-2.5 py-0.5 rounded-full bg-amber-900/95 hover:bg-rose-900 text-amber-200 border border-amber-500/70 shadow-xl cursor-pointer transition-all flex items-center gap-1 text-[10px] font-mono animate-bounce"
              title="Uncork jar & release all trapped spirits"
            >
              <Unlock className="w-3 h-3 text-amber-300" />
              <span>Uncork</span>
            </button>
          )}
        </div>

        {/* Jar Neck Ring */}
        <div className="mx-auto w-32 h-3 bg-white/10 border-x-2 border-t border-white/30 rounded-t-xl backdrop-blur-sm shadow-inner" />

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
            {trappedGhosts.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
                <span className="text-3xl filter drop-shadow">👻</span>
              </div>
            ) : (
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
                      {/* Spectral Eyeholes */}
                      <span className="flex items-center gap-0.5 opacity-80">
                        <span className="w-1 h-1.5 rounded-full bg-zinc-950 inline-block" />
                        <span className="w-1 h-1.5 rounded-full bg-zinc-950 inline-block" />
                      </span>
                      <span
                        className={`font-bold truncate max-w-[65px] ${
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
                      {/* Sad Spectral Eyeholes */}
                      <span className="flex items-center gap-0.5 opacity-90">
                        <span className="w-1 h-1.5 rounded-full bg-rose-950 inline-block" />
                        <span className="w-1 h-1.5 rounded-full bg-rose-950 inline-block" />
                      </span>
                      <span
                        className={`font-bold truncate max-w-[65px] text-rose-950 ${
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
