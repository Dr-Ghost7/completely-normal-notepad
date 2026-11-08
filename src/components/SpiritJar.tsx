'use client';

import React, { useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { Sparkles, Unlock, Flame, X, Lock } from 'lucide-react';
import { ghostAudio } from '../lib/ghostAudio';

interface SpiritJarProps {
  onJarBoundsChange?: (bounds: DOMRect | null) => void;
}

export const SpiritJar: React.FC<SpiritJarProps> = ({ onJarBoundsChange }) => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const trapGhostInJar = useGhostStore((state) => state.trapGhostInJar);
  const releaseGhostFromJar = useGhostStore((state) => state.releaseGhostFromJar);
  const releaseAllJarGhosts = useGhostStore((state) => state.releaseAllJarGhosts);
  const restoreGhost = useGhostStore((state) => state.restoreGhost);
  const showJar = useGhostStore((state) => state.settings.showJar);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const jarRef = useRef<HTMLDivElement>(null);

  // Keep jar bounding box synced for drag-and-drop hit detection
  useEffect(() => {
    const updateBounds = () => {
      if (jarRef.current) {
        const rect = jarRef.current.getBoundingClientRect();
        if (onJarBoundsChange) onJarBoundsChange(rect);
        // Also register globally for GhostLayer physics
        (window as unknown as { spiritJarRect: DOMRect }).spiritJarRect = rect;
      } else {
        if (onJarBoundsChange) onJarBoundsChange(null);
        (window as unknown as { spiritJarRect: null }).spiritJarRect = null;
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds);
    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds);
    };
  }, [onJarBoundsChange, showJar]);

  if (!showJar) return null;

  const trappedGhosts = ghosts.filter((g) => g.isTrappedInJar);

  return (
    <aside
      ref={jarRef}
      aria-label="Spirit Punishment Jar"
      className="fixed right-3 bottom-6 z-40 w-44 sm:w-52 pointer-events-auto select-none transition-all duration-300"
    >
      <div className="relative group">
        {/* Cork Stopper with Talisman Rune */}
        <div className="mx-auto w-24 h-6 bg-gradient-to-b from-[#8b5a2b] via-[#6d441e] to-[#4a2e13] rounded-t-lg border-2 border-[#3d240c] shadow-md flex items-center justify-between px-2 text-[9px] font-mono text-amber-200">
          <span className="flex items-center gap-1 font-bold text-amber-300">
            <Lock className="w-2.5 h-2.5 text-amber-400" />
            SEAL
          </span>
          {trappedGhosts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                releaseAllJarGhosts();
                if (soundEnabled) ghostAudio.playGlassClink(volume);
              }}
              className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 hover:bg-rose-900 text-amber-200 border border-amber-600/50 cursor-pointer transition-colors flex items-center gap-0.5"
              title="Uncork jar and release all trapped spirits"
            >
              <Unlock className="w-2.5 h-2.5 text-amber-300" />
              <span>Free</span>
            </button>
          )}
        </div>

        {/* Jar Neck Ring */}
        <div className="mx-auto w-32 h-3 bg-white/10 border-x-2 border-t-2 border-white/30 rounded-t-xl backdrop-blur-sm shadow-inner" />

        {/* Jar Glass Chamber */}
        <div className="relative w-full h-64 rounded-3xl bg-gradient-to-b from-white/15 via-white/5 to-purple-950/40 border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_0_20px_rgba(255,255,255,0.15)] backdrop-blur-md overflow-hidden flex flex-col justify-between p-3">
          {/* Glass Curved Highlight Glare */}
          <div className="absolute left-2 top-2 bottom-2 w-2 rounded-full bg-gradient-to-b from-white/40 via-white/20 to-transparent pointer-events-none" />
          <div className="absolute right-2 top-4 bottom-4 w-1 rounded-full bg-white/15 pointer-events-none" />

          {/* Ectoplasm Fog at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-emerald-500/20 via-purple-600/15 to-transparent pointer-events-none animate-ectoplasm-pulse" />

          {/* Jar Header & Info */}
          <div className="relative z-10 text-center">
            <h3 className="font-gothic text-[11px] font-bold text-purple-200 tracking-wider flex items-center justify-center gap-1">
              <span>Punishment Jar</span>
            </h3>
            <p className="text-[9px] text-purple-300/70 font-mono">
              {trappedGhosts.length === 0
                ? 'Drop unruly ghosts here'
                : `${trappedGhosts.length} spirit${trappedGhosts.length === 1 ? '' : 's'} imprisoned`}
            </p>
          </div>

          {/* Trapped Ghosts Container */}
          <div className="relative z-10 flex-1 my-2 overflow-y-auto space-y-1.5 max-h-[145px] pr-1">
            {trappedGhosts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-2">
                <div className="w-8 h-8 rounded-full border border-dashed border-purple-400/40 flex items-center justify-center text-purple-400/60 mb-1 animate-pulse">
                  👻
                </div>
                <span className="text-[10px] text-purple-300/50 italic font-serif">
                  Drag &amp; drop wandering ghosts here to keep your manuscript calm
                </span>
              </div>
            ) : (
              trappedGhosts.map((ghost) => (
                <div
                  key={ghost.id}
                  className="group/item relative px-2.5 py-1.5 rounded-xl bg-white/90 text-zinc-950 shadow-md border border-white/80 flex items-center justify-between text-xs font-serif animate-bounce duration-1000"
                  style={{ animationDuration: `${2000 + (ghost.createdAt % 1500)}ms` }}
                >
                  <span className="truncate max-w-[95px] font-semibold">
                    "{ghost.text}"
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover/item:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        releaseGhostFromJar(ghost.id);
                        if (soundEnabled) ghostAudio.playGlassClink(volume);
                      }}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                      title="Release from jar"
                    >
                      <Unlock className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => restoreGhost(ghost.id)}
                      className="p-1 rounded hover:bg-zinc-200 text-zinc-800 transition-colors cursor-pointer"
                      title="Restore directly into notepad"
                    >
                      <Sparkles className="w-3 h-3 text-purple-700" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Jar Base Pedestal */}
          <div className="relative z-10 pt-1 border-t border-purple-800/40 flex items-center justify-between text-[9px] font-mono text-purple-300/70">
            <span>Glass Vessel</span>
            <span className="text-emerald-400/90 font-bold">
              {trappedGhosts.length > 0 ? 'Enchanted' : 'Dormant'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
