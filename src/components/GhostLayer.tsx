'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { Ghost } from '../types/ghost';
import { getCaretOffsetFromPoint } from '../lib/caretHelpers';
import { ghostAudio } from '../lib/ghostAudio';
import { Sparkles, Clock, Undo2, Lock } from 'lucide-react';

interface GhostLayerProps {
  onGhostDrop: (ghostId: string, charOffset: number | null) => void;
  setDropTargetOffset: (offset: number | null) => void;
}

export const GhostLayer: React.FC<GhostLayerProps> = ({
  onGhostDrop,
  setDropTargetOffset,
}) => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const updateGhostPositions = useGhostStore((state) => state.updateGhostPositions);
  const restoreGhost = useGhostStore((state) => state.restoreGhost);
  const trapGhostInJar = useGhostStore((state) => state.trapGhostInJar);
  const setDraggingGhost = useGhostStore((state) => state.setDraggingGhost);
  const isExorcising = useGhostStore((state) => state.isExorcising);
  const exorcismProgress = useGhostStore((state) => state.exorcismProgress);
  const reducedMotion = useGhostStore((state) => state.settings.reducedMotion);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const [hoveredGhostId, setHoveredGhostId] = useState<string | null>(null);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ghostsRef = useRef<Ghost[]>(ghosts);
  ghostsRef.current = ghosts;

  // Track mouse coordinates and velocity for aerodynamic wind wakes
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const mouseVelocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastMouseMoveTimeRef = useRef<number>(0);

  // Typing caret position for typing shockwaves & curiosity
  const activeCaretPosRef = useRef<{ x: number; y: number; lastTime: number }>({
    x: -1000,
    y: -1000,
    lastTime: 0,
  });

  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Track mouse position and velocity
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(0.01, (now - lastMouseMoveTimeRef.current) / 1000);
      lastMouseMoveTimeRef.current = now;

      const vx = (e.clientX - lastMousePosRef.current.x) / dt;
      const vy = (e.clientY - lastMousePosRef.current.y) / dt;

      lastMousePosRef.current = { x: mousePosRef.current.x, y: mousePosRef.current.y };
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      mouseVelocityRef.current = { vx, vy };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Listen for typing activity from the Editor
  useEffect(() => {
    const handleCaretActivity = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; action: string }>;
      if (!customEvent.detail) return;

      const { x, y, action } = customEvent.detail;
      activeCaretPosRef.current = { x, y, lastTime: Date.now() };

      if (action === 'type') {
        // Disperse nearby ghosts away from typing caret!
        const currentGhosts = ghostsRef.current;
        let didScatter = false;

        const updated = currentGhosts.map((ghost) => {
          if (ghost.isDragging || ghost.isTrappedInJar) return ghost;
          const kdx = ghost.x - x;
          const kdy = ghost.y - y;
          const dist = Math.hypot(kdx, kdy) || 1;

          if (dist < 180) {
            didScatter = true;
            const power = (1 - dist / 180) * 18;
            return {
              ...ghost,
              vx: ghost.vx + (kdx / dist) * power,
              vy: ghost.vy + (kdy / dist) * power,
            };
          }
          return ghost;
        });

        if (didScatter) {
          updateGhostPositions(updated);
          if (soundEnabled && Math.random() < 0.2) {
            ghostAudio.playTypingGust(volume);
          }
        }
      }
    };

    window.addEventListener('editor-caret-activity', handleCaretActivity);
    return () => window.removeEventListener('editor-caret-activity', handleCaretActivity);
  }, [updateGhostPositions, soundEnabled, volume]);

  /**
   * Main 60fps Physics & Simulation Loop
   * - Eliminates constant upward negative gravity: ghosts roam entire screen!
   * - Cursor wind wake
   * - Soft boundary repulsion
   * - Evasion & curious drift
   */
  useEffect(() => {
    if (reducedMotion) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const currentGhosts = ghostsRef.current;
      if (currentGhosts.length === 0) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const centerX = viewportWidth / 2;
      const centerY = viewportHeight / 2;
      const mouse = mousePosRef.current;
      const mouseVel = mouseVelocityRef.current;
      const mouseSpeed = Math.hypot(mouseVel.vx, mouseVel.vy);
      const caret = activeCaretPosRef.current;
      const timeSinceType = Date.now() - caret.lastTime;

      let changed = false;

      const updated = currentGhosts.map((ghost) => {
        // If trapped in punishment jar or being dragged, ignore free physics
        if (ghost.isDragging || ghost.isTrappedInJar) {
          return ghost;
        }

        let { x, y, vx, vy, wobblePhase, scale, opacity } = ghost;
        wobblePhase += dt * 2.2;

        // 1. EXORCISM VORTEX PHYSICS
        if (isExorcising) {
          changed = true;
          const dx = centerX - x;
          const dy = centerY - y;
          const dist = Math.hypot(dx, dy) || 1;

          const pullForce = 460 * (1 + exorcismProgress * 2);
          const pullX = (dx / dist) * pullForce * dt;
          const pullY = (dy / dist) * pullForce * dt;

          const swirlFactor = 340 * (1 + exorcismProgress * 3);
          const swirlX = (-dy / dist) * swirlFactor * dt;
          const swirlY = (dx / dist) * swirlFactor * dt;

          vx = vx * 0.85 + (pullX + swirlX);
          vy = vy * 0.85 + (pullY + swirlY);

          x += vx * dt;
          y += vy * dt;

          scale = Math.max(0.2, 1 - exorcismProgress * 0.8);
          opacity = Math.max(0.1, 1 - exorcismProgress * 0.9);

          return { ...ghost, x, y, vx, vy, wobblePhase, scale, opacity };
        }

        // 2. TRUE 2D WANDERING (Gentle, graceful, easy to catch!)
        const seed = (ghost.createdAt % 1000) * 0.01;

        if (ghost.type === 'wisp') {
          // Light twitchy spark
          vx += (Math.random() - 0.5) * 28 * dt;
          vy += (Math.random() - 0.5) * 28 * dt;
          vx *= 0.94;
          vy *= 0.94;
        } else if (ghost.type === 'regret') {
          // Anchored spring force back to exact coordinate where it was deleted
          const anchorDx = ghost.originX - x;
          const anchorDy = ghost.originY - y;
          const springK = 0.5;
          vx += anchorDx * springK * dt;
          vy += anchorDy * springK * dt;

          vx += Math.sin(wobblePhase * 0.5) * 4 * dt;
          vy += Math.cos(wobblePhase * 0.4) * 4 * dt;

          vx *= 0.92;
          vy *= 0.92;
        } else if (ghost.type === 'sentence') {
          // Broad, oceanic drift across screen
          vx += Math.cos(wobblePhase * 0.3 + seed) * 6 * dt;
          vy += Math.sin(wobblePhase * 0.25 + seed * 1.3) * 6 * dt;
          vx *= 0.97;
          vy *= 0.97;
        } else {
          // Word ghost / Poltergeist: Slow, graceful float
          vx += Math.sin(wobblePhase * 0.45 + seed) * 9 * dt;
          vy += Math.cos(wobblePhase * 0.4 + seed * 1.5) * 9 * dt;
          vx *= 0.95;
          vy *= 0.95;
        }

        // 3. CURSOR ATTRACTION / SLOWDOWN (Effortlessly Catchable!)
        const mdx = x - mouse.x;
        const mdy = y - mouse.y;
        const mDist = Math.hypot(mdx, mdy);

        // When cursor approaches within 90px, the ghost slows down into your grasp
        if (mDist < 90) {
          vx *= 0.82;
          vy *= 0.82;
        }

        // B) Cursor Aerodynamic Wind Wake: Only very fast swipes create a light breeze
        if (mouseSpeed > 600 && mDist < 120 && mDist > 0) {
          const windFactor = (1 - mDist / 120) * 0.02;
          vx += mouseVel.vx * windFactor;
          vy += mouseVel.vy * windFactor;
        }

        // 4. CURIOUS DRIFT: If author pauses typing for > 2.5s, ghost peers curiously at writing line
        if (timeSinceType > 2500 && timeSinceType < 12000 && caret.x > 0) {
          const cdx = caret.x - x;
          const cdy = caret.y - y;
          const cDist = Math.hypot(cdx, cdy);
          if (cDist > 120 && cDist < 450) {
            // Very slow, curious crawl toward writing line
            vx += (cdx / cDist) * 12 * dt;
            vy += (cdy / cDist) * 12 * dt;
          }
        }

        // Apply velocity to position
        x += vx;
        y += vy;

        // 5. SOFT BOUNDARY REPULSION (Keeps ghosts roaming all 4 screen margins)
        const topBound = 85;
        const bottomBound = viewportHeight - 85;
        const leftBound = 70;
        const rightBound = viewportWidth - 85;

        if (y < topBound) {
          vy += ((topBound - y) / 35) * 110 * dt;
        } else if (y > bottomBound) {
          vy -= ((y - bottomBound) / 35) * 110 * dt;
        }

        if (x < leftBound) {
          vx += ((leftBound - x) / 35) * 110 * dt;
        } else if (x > rightBound) {
          vx -= ((x - rightBound) / 35) * 110 * dt;
        }

        // Hard clamp backup
        x = Math.max(20, Math.min(viewportWidth - 90, x));
        y = Math.max(50, Math.min(viewportHeight - 60, y));

        changed = true;
        return { ...ghost, x, y, vx, vy, wobblePhase };
      });

      if (changed) {
        updateGhostPositions(updated);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    reducedMotion,
    isExorcising,
    exorcismProgress,
    updateGhostPositions,
    soundEnabled,
    volume,
  ]);

  /**
   * Pointer Drag & Drop Handlers for "Catch & Return"
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, ghost: Ghost) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setActiveDraggingId(ghost.id);
    setDraggingGhost(ghost.id);

    dragOffsetRef.current = {
      x: e.clientX - ghost.x,
      y: e.clientY - ghost.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDraggingId) return;

    const currentX = e.clientX - dragOffsetRef.current.x;
    const currentY = e.clientY - dragOffsetRef.current.y;

    // Check if dragging near Punishment Jar
    const jarEl = document.querySelector('[aria-label="Spirit Punishment Jar"]') as HTMLElement | null;
    const jarRect = jarEl?.getBoundingClientRect() || (window as unknown as { spiritJarRect?: DOMRect }).spiritJarRect;
    const isOverJar = jarRect &&
      e.clientX >= jarRect.left - 45 &&
      e.clientX <= jarRect.right + 45 &&
      e.clientY >= jarRect.top - 45 &&
      e.clientY <= jarRect.bottom + 45;

    window.dispatchEvent(
      new CustomEvent('ghost-drag-move', {
        detail: { x: e.clientX, y: e.clientY, isDragging: true },
      })
    );

    if (isOverJar) {
      setDropTargetOffset(null);
    } else {
      // Check if dragging over the notepad editor
      const editorEl = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
      if (editorEl) {
        const offset = getCaretOffsetFromPoint(e.clientX, e.clientY, editorEl);
        setDropTargetOffset(offset);
      } else {
        setDropTargetOffset(null);
      }
    }

    // Update dragging ghost position directly
    const updated = ghostsRef.current.map((g) => {
      if (g.id === activeDraggingId) {
        return {
          ...g,
          x: currentX,
          y: currentY,
          vx: 0,
          vy: 0,
        };
      }
      return g;
    });

    updateGhostPositions(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDraggingId) return;

    const draggedId = activeDraggingId;
    setActiveDraggingId(null);
    setDraggingGhost(null);
    setDropTargetOffset(null);

    window.dispatchEvent(
      new CustomEvent('ghost-drag-move', {
        detail: { x: e.clientX, y: e.clientY, isDragging: false },
      })
    );

    // 1. Check if dropped over the Punishment Spirit Jar!
    const jarEl = document.querySelector('[aria-label="Spirit Punishment Jar"]') as HTMLElement | null;
    const jarRect = jarEl?.getBoundingClientRect() || (window as unknown as { spiritJarRect?: DOMRect }).spiritJarRect;
    if (jarRect) {
      if (
        e.clientX >= jarRect.left - 45 &&
        e.clientX <= jarRect.right + 45 &&
        e.clientY >= jarRect.top - 45 &&
        e.clientY <= jarRect.bottom + 45
      ) {
        trapGhostInJar(draggedId);
        return;
      }
    }

    // 2. Check if dropped over editor (or near it) for text re-insertion
    const editorEl = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
    let charOffset: number | null = null;

    if (editorEl) {
      charOffset = getCaretOffsetFromPoint(e.clientX, e.clientY, editorEl);
    }

    if (charOffset !== null) {
      restoreGhost(draggedId, charOffset);
    } else if (editorEl) {
      const rect = editorEl.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        restoreGhost(draggedId);
      }
    }
  };

  // Only render free-roaming ghosts here (trapped spirits live in the Punishment Jar)
  const roamingGhosts = ghosts.filter((g) => !g.isTrappedInJar);

  if (!isMounted || roamingGhosts.length === 0) {
    return null;
  }

  // REDUCED MOTION MODE
  if (reducedMotion) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 p-3 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Resting Spirits ({roamingGhosts.length}):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {roamingGhosts.map((ghost) => (
            <div
              key={ghost.id}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-serif border shadow-sm shrink-0 ${ghost.colorTheme.background} ${ghost.colorTheme.border} ${ghost.colorTheme.text}`}
            >
              <span>"{ghost.text}"</span>
              <button
                type="button"
                onClick={() => restoreGhost(ghost.id)}
                className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors cursor-pointer"
                title="Restore back into notepad"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {roamingGhosts.map((ghost) => {
        const isHovered = hoveredGhostId === ghost.id;
        const isDragging = ghost.id === activeDraggingId;
        const timeAgo = isMounted
          ? Math.max(1, Math.round((Date.now() - ghost.createdAt) / 1000))
          : 1;

        return (
          <div
            key={ghost.id}
            onPointerDown={(e) => handlePointerDown(e, ghost)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => setHoveredGhostId(ghost.id)}
            onMouseLeave={() => setHoveredGhostId(null)}
            style={{
              transform: `translate3d(${ghost.x}px, ${ghost.y}px, 0) scale(${ghost.scale})`,
              opacity: ghost.opacity,
              boxShadow: `0 6px 24px rgba(0, 0, 0, 0.45), 0 0 22px ${ghost.colorTheme.glow}`,
              touchAction: 'none',
            }}
            className={`pointer-events-auto absolute top-0 left-0 select-none cursor-grab active:cursor-grabbing transition-shadow duration-300 rounded-2xl px-3 py-1.5 text-sm border-2 backdrop-blur-md flex items-center gap-1.5 ${
              ghost.colorTheme.background
            } ${ghost.colorTheme.border} ${ghost.colorTheme.text} ${
              isDragging
                ? 'ring-2 ring-cyan-400 scale-110 shadow-2xl z-50'
                : 'z-40 hover:scale-105'
            } ${ghost.type === 'wisp' ? 'animate-wisp-flicker text-xs' : ''}`}
          >
            {/* Iconic Ghost Sheet Face: Spectral Eye Holes */}
            <div
              className="flex items-center gap-1 px-0.5 opacity-80 shrink-0"
              title="Spectral eyes"
            >
              <span className="w-1.5 h-2 rounded-full bg-zinc-950 inline-block shadow-inner" />
              <span className="w-1.5 h-2 rounded-full bg-zinc-950 inline-block shadow-inner" />
            </div>

            {/* Ghost text content */}
            <span
              className={`tracking-normal leading-tight px-0.5 ${
                ghost.fontFamily === 'wingdings'
                  ? 'font-wingdings text-base tracking-widest'
                  : ghost.fontFamily === 'papyrus'
                  ? 'font-papyrus font-semibold tracking-wide'
                  : ghost.fontFamily === 'modern'
                  ? 'font-sans-undertale'
                  : ghost.fontFamily === 'typewriter'
                  ? 'font-typewriter text-xs sm:text-sm'
                  : ghost.fontFamily === 'script'
                  ? 'font-script text-base sm:text-lg'
                  : 'font-serif font-bold'
              }`}
            >
              {ghost.text}
            </span>

            {/* Quick Action Icons on Hover */}
            {isHovered && !isDragging && (
              <div className="flex items-center gap-1 ml-1 animate-in fade-in duration-100">
                {/* Trap into punishment jar */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    trapGhostInJar(ghost.id);
                  }}
                  className="p-1 rounded-md bg-black/10 hover:bg-black/20 text-zinc-900 transition-colors cursor-pointer"
                  title="Seal in Punishment Jar"
                >
                  <Lock className="w-3 h-3" />
                </button>

                {/* Restore into text */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    restoreGhost(ghost.id);
                  }}
                  className="p-1 rounded-md bg-black/10 hover:bg-black/20 text-zinc-900 transition-colors cursor-pointer"
                  title="Click to restore into text"
                >
                  <Undo2 className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* History Tooltip on Hover */}
            {isHovered && !isDragging && (
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-2xl bg-[#0e0417]/98 border border-purple-800/80 text-purple-100 shadow-2xl backdrop-blur-md text-[11px] font-sans z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-purple-800/60 pb-1.5 mb-1.5 font-mono text-[10px]">
                  <span className="uppercase tracking-wider font-semibold text-rose-300">
                    {ghost.type} Ghost
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <Clock className="w-3 h-3" />
                    {timeAgo}s ago
                  </span>
                </div>

                {ghost.contextSentence ? (
                  <p className="italic text-purple-200 line-clamp-2">
                    "...{ghost.contextSentence.trim()}..."
                  </p>
                ) : (
                  <p className="text-purple-400">Deleted from manuscript</p>
                )}

                <div className="mt-2 pt-1.5 border-t border-purple-800/60 flex items-center justify-between text-[10px] text-purple-300">
                  <span>Drag into text or Punishment Jar</span>
                  <span className="text-rose-400 font-mono">Catch me</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
