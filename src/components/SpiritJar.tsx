'use client';

import React, { useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { Sparkles, Unlock, Undo2 } from 'lucide-react';
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
      className="fixed right-4 bottom-6 z-40 w-36 sm:w-44 pointer-events-auto select-none transition-all duration-300 group"
    >
      <div className="relative">
        {/* Antique Wood Cork Stopper */}
        <div className="mx-auto w-20 h-5 bg-gradient-to-b from-[#8b5a2b] via-[#6d441e] to-[#452710] rounded-t-lg border-2 border-[#2e1909] shadow-md flex items-center justify-center relative">
          {trappedGhosts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                releaseAllJarGhosts();
                if (soundEnabled) ghostAudio.playGlassClink(volume);
              }}
              className="absolute -top-3 px-2 py-0.5 rounded-full bg-amber-900/90 hover:bg-rose-900 text-amber-200 border border-amber-600/60 shadow-lg cursor-pointer transition-all flex items-center gap-1 text-[9px] font-mono"
              title="Uncork jar & release all spirits"
            >
              <Unlock className="w-2.5 h-2.5 text-amber-300" />
              <span>Uncork</span>
            </button>
          )}
        </div>

        {/* Jar Neck Ring */}
        <div className="mx-auto w-26 h-2.5 bg-white/10 border-x-2 border-t border-white/30 rounded-t-xl backdrop-blur-sm" />

        {/* Clean Apothecary Glass Chamber */}
        <div className="relative w-full h-56 rounded-3xl bg-gradient-to-b from-white/10 via-white/5 to-purple-950/30 border-2 border-white/25 shadow-[0_12px_36px_rgba(0,0,0,0.6),inset_0_0_24px_rgba(255,255,255,0.1)] backdrop-blur-md overflow-hidden flex flex-col justify-between p-2.5">
          {/* Subtle curved glass specular light sheen */}
          <div className="absolute left-1.5 top-2 bottom-2 w-1.5 rounded-full bg-gradient-to-b from-white/35 via-white/15 to-transparent pointer-events-none" />
          <div className="absolute right-1.5 top-4 bottom-4 w-0.5 rounded-full bg-white/15 pointer-events-none" />

          {/* Eerie Ectoplasmic Glow at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-emerald-500/15 via-purple-600/10 to-transparent pointer-events-none animate-ectoplasm-pulse" />

          {/* Trapped Spirits Area */}
          <div className="relative z-10 flex-1 overflow-y-auto space-y-1.5 pr-0.5 pt-1">
            {trappedGhosts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity">
                <span className="text-2xl filter drop-shadow">👻</span>
              </div>
            ) : (
              trappedGhosts.map((ghost) => (
                <div
                  key={ghost.id}
                  className="group/item relative px-2 py-1 rounded-xl bg-white/90 text-zinc-950 shadow-md border border-white/90 flex items-center justify-between text-xs font-serif animate-bounce duration-1000"
                  style={{ animationDuration: `${2200 + (ghost.createdAt % 1200)}ms` }}
                >
                  <span className="truncate max-w-[70px] sm:max-w-[85px] font-semibold text-[11px]">
                    "{ghost.text}"
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        releaseGhostFromJar(ghost.id);
                        if (soundEnabled) ghostAudio.playGlassClink(volume);
                      }}
                      className="p-0.5 rounded hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                      title="Release spirit"
                    >
                      <Unlock className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => restoreGhost(ghost.id)}
                      className="p-0.5 rounded hover:bg-zinc-200 text-purple-700 transition-colors cursor-pointer"
                      title="Restore into manuscript"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Subtle Bottom Seal Ring */}
          <div className="relative z-10 flex items-center justify-center">
            {trappedGhosts.length > 0 && (
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-purple-200/80 border border-purple-500/20">
                {trappedGhosts.length} trapped
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
