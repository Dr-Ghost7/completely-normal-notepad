'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { Unlock } from 'lucide-react';
import { ghostAudio } from '../lib/ghostAudio';

interface SpiritJarProps {
  onJarBoundsChange?: (bounds: DOMRect | null) => void;
}

interface JarGhostPhysics {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  seed: number;
  isSad: boolean;
}

export const SpiritJar: React.FC<SpiritJarProps> = ({ onJarBoundsChange }) => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const releaseGhostFromJar = useGhostStore((state) => state.releaseGhostFromJar);
  const releaseAllJarGhosts = useGhostStore((state) => state.releaseAllJarGhosts);
  const restoreGhost = useGhostStore((state) => state.restoreGhost);
  const showJar = useGhostStore((state) => state.settings.showJar);
  const reducedMotion = useGhostStore((state) => state.settings.reducedMotion);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const jarRef = useRef<HTMLDivElement>(null);
  const chamberRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Physics tracking for floating spirits inside the jar chamber
  const physicsMapRef = useRef<Map<string, JarGhostPhysics>>(new Map());
  const ghostElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const animFrameRef = useRef<number | null>(null);

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

  const trappedGhosts = ghosts.filter((g) => g.isTrappedInJar);

  // Synchronize physics objects with current trapped ghosts
  useEffect(() => {
    const currentMap = physicsMapRef.current;
    const currentIds = new Set(trappedGhosts.map((g) => g.id));

    // Remove released ghosts from physics
    Array.from(currentMap.keys()).forEach((id) => {
      if (!currentIds.has(id)) {
        currentMap.delete(id);
        ghostElementsRef.current.delete(id);
      }
    });

    // Add newly trapped ghosts
    trappedGhosts.forEach((g) => {
      if (!currentMap.has(g.id)) {
        const isSad = g.type === 'regret';
        currentMap.set(g.id, {
          id: g.id,
          x: 14 + Math.random() * 50,
          y: isSad ? 150 + Math.random() * 60 : 25 + Math.random() * 110,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          phase: Math.random() * Math.PI * 2,
          seed: (g.createdAt % 1000) * 0.01,
          isSad,
        });
      }
    });
  }, [trappedGhosts]);

  // 60 FPS Physics Simulation: Spirits float, wander, bob, and bounce inside the jar!
  useEffect(() => {
    if (reducedMotion) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.06);
      lastTime = currentTime;

      const chamberEl = chamberRef.current;
      const chamberRect = chamberEl?.getBoundingClientRect();
      const chamberWidth = chamberRect?.width || 170;
      const chamberHeight = chamberRect?.height || 300;

      // Inner glass boundaries allowing comfortable margins for ghost pills
      const minX = 8;
      const maxX = Math.max(60, chamberWidth - 88);
      const minY = 12;
      const maxY = Math.max(160, chamberHeight - 44);

      const physicsMap = physicsMapRef.current;

      physicsMap.forEach((p, id) => {
        const el = ghostElementsRef.current.get(id);
        if (!el) return;

        p.phase += dt * 2.2;

        if (p.isSad) {
          // Sad regret spirits sink mournfully toward the bottom ectoplasm, but bob gently in the fluid
          p.vx += Math.cos(p.phase * 0.6 + p.seed) * 9 * dt;
          p.vy += Math.sin(p.phase * 0.5 + p.seed) * 7 * dt;

          // Buoyant cushion in the bottom green pool
          if (p.y > maxY - 35) {
            p.vy -= 22 * dt; // buoyant lift from ectoplasm
          } else {
            p.vy += 5 * dt; // gentle sinking gravity
          }
        } else {
          // Happy / curious spirits drift freely all through the jar
          p.vx += Math.cos(p.phase * 0.75 + p.seed) * 16 * dt;
          p.vy += Math.sin(p.phase * 0.6 + p.seed * 1.4) * 14 * dt;

          // Gentle buoyancy (spirits wanting to float up toward the cork)
          if (p.y < minY + 35) {
            p.vy += 9 * dt; // deflect down from cork
          } else {
            p.vy -= 4.5 * dt; // gentle rise
          }
        }

        // Velocity damping
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Position integration
        p.x += p.vx * 60 * dt;
        p.y += p.vy * 60 * dt;

        // Soft wall collisions (rebounds off curved glass jar edges)
        if (p.x < minX) {
          p.x = minX;
          p.vx = Math.abs(p.vx) * 0.75 + 0.3;
        } else if (p.x > maxX) {
          p.x = maxX;
          p.vx = -Math.abs(p.vx) * 0.75 - 0.3;
        }

        if (p.y < minY) {
          p.y = minY;
          p.vy = Math.abs(p.vy) * 0.75 + 0.3;
        } else if (p.y > maxY) {
          p.y = maxY;
          p.vy = -Math.abs(p.vy) * 0.75 - 0.3;
        }

        // Apply smooth 3D translation & organic tilt
        const tilt = Math.max(-12, Math.min(12, p.vx * 3.5 + Math.sin(p.phase) * 2));
        el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${tilt.toFixed(1)}deg)`;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [reducedMotion]);

  if (!showJar) return null;

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

        {/* Jar neck ring */}
        <div className="mx-auto w-32 sm:w-36 h-4 bg-white/10 border-x-2 border-t border-white/30 rounded-t-lg backdrop-blur-sm shadow-inner relative z-30 flex items-center">
          {/* Twine cord around neck */}
          <div className="absolute inset-x-0 h-1.5 bg-[#785028] border-y border-[#3d2410] shadow-xs" />

          {/* Warning tag assembly */}
          <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-auto select-none transition-transform duration-300 origin-top hover:rotate-[-2deg] -rotate-3 flex flex-col items-center">
            {/* Knot on cord */}
            <div className="w-3.5 h-3 rounded-full bg-[#5c3a1c] border border-[#331e0c] shadow-xs flex items-center justify-center z-10">
              <div className="w-1.5 h-1 bg-[#7a4e28] rounded-full" />
            </div>

            {/* Twine string */}
            <svg width="24" height="24" viewBox="0 0 24 24" className="overflow-visible block -mt-0.5">
              <path
                d="M 9 0 C 8 8, 11 16, 12 22"
                stroke="#8c6138"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 15 0 C 16 8, 13 16, 12 22"
                stroke="#7a522e"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
              {/* Bottom knot securing into eyelet */}
              <circle cx="12" cy="22" r="2" fill="#5c3a1c" stroke="#331e0c" strokeWidth="0.5" />
            </svg>

            {/* Tag card */}
            <div className="relative w-[76px] -mt-1 bg-[#dfd4b8] border border-[#a69168] shadow-lg rounded-[2px] py-1.5 px-1.5 flex flex-col items-center">
              {/* Eyelet hole */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#3d2e1b] border border-[#a69168] -mt-2 mb-1 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-[#dfd4b8]" />
              </div>

              <span className="text-[9.5px] font-mono font-black text-[#851818] tracking-wider uppercase text-center select-none leading-none">
                DON&apos;T OPEN
              </span>
            </div>
          </div>
        </div>

        {/* Clear glass chamber */}
        <div
          ref={chamberRef}
          className={`relative w-full h-72 sm:h-80 rounded-3xl transition-all duration-300 overflow-hidden flex flex-col justify-between p-3 border-2 backdrop-blur-md ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_40px_rgba(52,211,153,0.7)] scale-105'
              : 'border-white/30 bg-gradient-to-b from-white/10 via-white/5 to-purple-950/30 shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_0_25px_rgba(255,255,255,0.12)]'
          }`}
        >
          {/* Glass Curved Specular Glare */}
          <div className="absolute left-2 top-2 bottom-2 w-2 rounded-full bg-gradient-to-b from-white/40 via-white/15 to-transparent pointer-events-none" />
          <div className="absolute right-2 top-4 bottom-4 w-1 rounded-full bg-white/20 pointer-events-none" />

          {/* Bottom Ectoplasm Pool (Where sad ghosts linger and bob) */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-500/25 via-purple-700/15 to-transparent pointer-events-none animate-ectoplasm-pulse" />

          {/* Drop indicator overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-emerald-950/70 text-emerald-200 animate-in fade-in duration-150">
              <span className="text-3xl animate-bounce">🏺</span>
              <span className="text-xs font-serif font-bold mt-1 tracking-wider uppercase">
                Drop to Seal!
              </span>
            </div>
          )}

          {/* Floating spirits inside chamber */}
          <div className="relative w-full h-full">
            {trappedGhosts.map((ghost) => {
              const isSad = ghost.type === 'regret';

              return (
                <div
                  key={ghost.id}
                  ref={(el) => {
                    if (el) ghostElementsRef.current.set(ghost.id, el);
                    else ghostElementsRef.current.delete(ghost.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    willChange: 'transform',
                  }}
                  className={`z-20 group/ghost px-2 py-1 rounded-xl shadow-lg border flex items-center gap-1 text-[11px] font-serif transition-colors cursor-pointer select-none ${
                    isSad
                      ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border-rose-500/50 shadow-rose-950/50'
                      : 'bg-white/85 hover:bg-white text-zinc-950 border-white shadow-black/20'
                  }`}
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
                    &ldquo;{ghost.text}&rdquo;
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      releaseGhostFromJar(ghost.id);
                      if (soundEnabled) ghostAudio.playGlassClink(volume);
                    }}
                    className="p-0.5 rounded hover:bg-black/10 text-current transition-colors cursor-pointer"
                    title="Release spirit from jar"
                  >
                    <Unlock className="w-2.5 h-2.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
