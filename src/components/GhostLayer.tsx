'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { Ghost } from '../types/ghost';
import { getCaretOffsetFromPoint } from '../lib/caretHelpers';
import { ghostAudio } from '../lib/ghostAudio';
import { Sparkles, Clock, Compass, Undo2 } from 'lucide-react';

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
  const setDraggingGhost = useGhostStore((state) => state.setDraggingGhost);
  const isExorcising = useGhostStore((state) => state.isExorcising);
  const exorcismProgress = useGhostStore((state) => state.exorcismProgress);
  const reducedMotion = useGhostStore((state) => state.settings.reducedMotion);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const [hoveredGhostId, setHoveredGhostId] = useState<string | null>(null);
  const [activeDraggingId, setActiveDraggingId] = useState<string | null>(null);

  const ghostsRef = useRef<Ghost[]>(ghosts);
  ghostsRef.current = ghosts;

  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Track global mouse position for cursor avoidance
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  /**
   * Main 60fps Physics & Simulation Loop
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

      let changed = false;

      const updated = currentGhosts.map((ghost) => {
        // If actively being dragged by pointer, let pointer events control position
        if (ghost.isDragging) {
          return ghost;
        }

        let { x, y, vx, vy, wobblePhase, scale, opacity } = ghost;
        wobblePhase += dt * 2.5;

        // 1. EXORCISM VORTEX PHYSICS: If exorcising, spiral toward screen center
        if (isExorcising) {
          changed = true;
          const dx = centerX - x;
          const dy = centerY - y;
          const dist = Math.hypot(dx, dy) || 1;

          // Pull force towards center
          const pullForce = 450 * (1 + exorcismProgress * 2);
          const pullX = (dx / dist) * pullForce * dt;
          const pullY = (dy / dist) * pullForce * dt;

          // Tangential swirl force (creates the whirlpool vortex effect!)
          const swirlFactor = 320 * (1 + exorcismProgress * 3);
          const swirlX = (-dy / dist) * swirlFactor * dt;
          const swirlY = (dx / dist) * swirlFactor * dt;

          vx = vx * 0.85 + (pullX + swirlX);
          vy = vy * 0.85 + (pullY + swirlY);

          x += vx * dt;
          y += vy * dt;

          // Shrink and fade as exorcism reaches climax
          scale = Math.max(0.2, 1 - exorcismProgress * 0.8);
          opacity = Math.max(0.1, 1 - exorcismProgress * 0.9);

          return { ...ghost, x, y, vx, vy, wobblePhase, scale, opacity };
        }

        // 2. NORMAL WANDERING PHYSICS BY ARCHETYPE
        if (ghost.type === 'wisp') {
          // Rapid twitchy gnat jitter
          vx += (Math.random() - 0.5) * 40 * dt;
          vy += (Math.random() - 0.5) * 40 * dt - 1.2 * dt; // upward drift
          // Dampening
          vx *= 0.96;
          vy *= 0.96;
        } else if (ghost.type === 'regret') {
          // Anchored spring force back to deletion spot (originX, originY)
          const anchorDx = ghost.originX - x;
          const anchorDy = ghost.originY - y;
          const springK = 0.8;
          vx += anchorDx * springK * dt;
          vy += anchorDy * springK * dt;

          // Gentle mournful sinusoidal hover
          vx += Math.sin(wobblePhase) * 6 * dt;
          vy += Math.cos(wobblePhase * 0.8) * 6 * dt;

          vx *= 0.92;
          vy *= 0.92;
        } else if (ghost.type === 'sentence') {
          // Slow, heavy oceanic drift
          vx += Math.cos(wobblePhase * 0.5) * 4 * dt;
          vy += Math.sin(wobblePhase * 0.5) * 3 * dt - 0.4 * dt;
          vx *= 0.98;
          vy *= 0.98;
        } else {
          // Word ghost: gentle wander
          vx += Math.sin(wobblePhase) * 12 * dt;
          vy += Math.cos(wobblePhase * 0.9) * 10 * dt - 0.6 * dt;
          vx *= 0.95;
          vy *= 0.95;
        }

        // 3. CURSOR EVASION: Word ghosts dodge mouse cursor!
        if (ghost.type === 'word' || ghost.type === 'poltergeist') {
          const mdx = x - mouse.x;
          const mdy = y - mouse.y;
          const mDist = Math.hypot(mdx, mdy);
          const avoidanceRadius = 130;

          if (mDist < avoidanceRadius && mDist > 0) {
            const evadeStrength = (1 - mDist / avoidanceRadius) * 220;
            vx += (mdx / mDist) * evadeStrength * dt;
            vy += (mdy / mDist) * evadeStrength * dt;

            if (mDist < 50 && soundEnabled && Math.random() < 0.05) {
              ghostAudio.playDodge(volume);
            }
          }
        }

        // Apply velocity to position
        x += vx;
        y += vy;

        // 4. SCREEN BOUNDARY BOUNCING / WRAPPING
        const padding = 20;
        if (x < padding) {
          x = padding;
          vx = Math.abs(vx) * 0.8;
        } else if (x > viewportWidth - 80) {
          x = viewportWidth - 80;
          vx = -Math.abs(vx) * 0.8;
        }

        if (y < padding + 50) {
          y = padding + 50;
          vy = Math.abs(vy) * 0.8;
        } else if (y > viewportHeight - 50) {
          y = viewportHeight - 50;
          vy = -Math.abs(vy) * 0.8;
        }

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
  }, [reducedMotion, isExorcising, exorcismProgress, updateGhostPositions, soundEnabled, volume]);

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

    // Check if dragging over the notepad editor
    const editorEl = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
    if (editorEl) {
      const offset = getCaretOffsetFromPoint(e.clientX, e.clientY, editorEl);
      setDropTargetOffset(offset);
    } else {
      setDropTargetOffset(null);
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

    const editorEl = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
    let charOffset: number | null = null;

    if (editorEl) {
      charOffset = getCaretOffsetFromPoint(e.clientX, e.clientY, editorEl);
    }

    setDropTargetOffset(null);

    // If dropped over editor (or near it), restore ghost into text!
    if (charOffset !== null) {
      restoreGhost(draggedId, charOffset);
    } else {
      // Check if dropped within editor bounding box
      if (editorEl) {
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
    }
  };

  if (ghosts.length === 0) {
    return null;
  }

  // REDUCED MOTION MODE: Render static shelf along bottom margin
  if (reducedMotion) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 p-3 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md shadow-xl flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-400 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Resting Spirits ({ghosts.length}):</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {ghosts.map((ghost) => (
            <div
              key={ghost.id}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-serif border shadow-sm shrink-0 ${ghost.colorTheme.background} ${ghost.colorTheme.border} ${ghost.colorTheme.text}`}
            >
              <span>"{ghost.text}"</span>
              <button
                type="button"
                onClick={() => restoreGhost(ghost.id)}
                className="ml-1 p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
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
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    >
      {ghosts.map((ghost) => {
        const isHovered = hoveredGhostId === ghost.id;
        const isDragging = ghost.id === activeDraggingId;
        const timeAgo = Math.max(1, Math.round((Date.now() - ghost.createdAt) / 1000));

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
              boxShadow: `0 4px 20px rgba(0, 0, 0, 0.35), 0 0 16px ${ghost.colorTheme.glow}`,
              touchAction: 'none',
            }}
            className={`pointer-events-auto absolute top-0 left-0 select-none cursor-grab active:cursor-grabbing transition-shadow duration-300 rounded-xl px-3 py-1.5 text-sm font-serif border-2 backdrop-blur-sm flex items-center gap-1.5 ${
              ghost.colorTheme.background
            } ${ghost.colorTheme.border} ${ghost.colorTheme.text} ${
              isDragging
                ? 'ring-2 ring-cyan-400 scale-110 shadow-2xl z-50'
                : 'z-40 hover:scale-105'
            } ${ghost.type === 'wisp' ? 'animate-wisp-flicker text-xs' : ''}`}
          >
            {/* Ghost text content */}
            <span className="font-serif tracking-normal leading-tight">
              {ghost.text}
            </span>

            {/* Quick restore icon on hover */}
            {isHovered && !isDragging && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreGhost(ghost.id);
                }}
                className="ml-1 p-0.5 rounded hover:bg-white/20 transition-colors cursor-pointer text-stone-300"
                title="Click to restore into text"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            )}

            {/* History Tooltip on Hover */}
            {isHovered && !isDragging && (
              <div
                className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 rounded-xl bg-stone-950/95 border border-stone-800 text-stone-200 shadow-2xl backdrop-blur-md text-[11px] font-sans z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 mb-1.5 font-mono text-[10px]">
                  <span className="uppercase tracking-wider font-semibold text-cyan-300">
                    {ghost.type} Ghost
                  </span>
                  <span className="flex items-center gap-1 text-stone-400">
                    <Clock className="w-3 h-3" />
                    {timeAgo}s ago
                  </span>
                </div>

                {ghost.contextSentence ? (
                  <p className="italic text-stone-300 line-clamp-2">
                    "...{ghost.contextSentence.trim()}..."
                  </p>
                ) : (
                  <p className="text-stone-400">Deleted from manuscript</p>
                )}

                <div className="mt-2 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Drag &amp; drop to return</span>
                  <span className="text-cyan-400 font-mono">Catch me</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
