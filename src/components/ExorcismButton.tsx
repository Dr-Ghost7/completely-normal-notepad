'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { Flame, Sparkles } from 'lucide-react';

export const ExorcismButton: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const startExorcism = useGhostStore((state) => state.startExorcism);
  const updateExorcismProgress = useGhostStore((state) => state.updateExorcismProgress);
  const cancelExorcism = useGhostStore((state) => state.cancelExorcism);
  const completeExorcism = useGhostStore((state) => state.completeExorcism);

  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const HOLD_DURATION_MS = 2000; // 2 seconds hold to cleanse

  const handlePointerDown = (e: React.PointerEvent | React.KeyboardEvent) => {
    if (ghosts.length === 0) return;
    setIsPressing(true);
    setProgress(0);
    startTimeRef.current = performance.now();
    startExorcism();
  };

  const handlePointerUp = useCallback(() => {
    if (!isPressing) return;
    setIsPressing(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    cancelExorcism();
  }, [isPressing, cancelExorcism]);

  useEffect(() => {
    if (!isPressing) return;

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / HOLD_DURATION_MS);
      setProgress(currentProgress);
      updateExorcismProgress(currentProgress);

      if (currentProgress >= 1) {
        setIsPressing(false);
        setProgress(0);
        startTimeRef.current = null;
        completeExorcism();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPressing, completeExorcism, updateExorcismProgress]);

  // Clean up on unmount or blur
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isPressing) handlePointerUp();
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('blur', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('blur', handleGlobalUp);
    };
  }, [isPressing, handlePointerUp]);

  const hasGhosts = ghosts.length > 0;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!isPressing) handlePointerDown(e);
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handlePointerUp();
          }
        }}
        disabled={!hasGhosts}
        title={hasGhosts ? 'Hold to banish all wandering spirits in a vortex' : 'No spirits to banish'}
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-serif tracking-wide transition-all duration-300 select-none cursor-pointer ${
          hasGhosts
            ? isPressing
              ? 'bg-rose-950 text-rose-100 shadow-xl shadow-rose-900/60 ring-2 ring-rose-500 scale-95 border border-rose-500'
              : 'bg-[#1a0926]/90 hover:bg-rose-950/80 text-purple-200 hover:text-rose-100 border border-purple-800/60 hover:border-rose-500/80 shadow-md shadow-purple-950/50'
            : 'bg-[#12071c]/40 text-purple-400/40 border border-purple-950/60 cursor-not-allowed opacity-50'
        }`}
      >
        {/* Radial Progress Rune */}
        <div className="relative w-5 h-5 flex items-center justify-center">
          <svg className="w-5 h-5 -rotate-90 transform" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-purple-900/40"
              strokeWidth="4"
              fill="transparent"
            />
            {isPressing && (
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-rose-500 transition-all duration-75"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            )}
          </svg>

          <span className="absolute inset-0 flex items-center justify-center">
            {isPressing ? (
              <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
            ) : (
              <Sparkles className="w-3 h-3 text-purple-400 group-hover:text-rose-300 transition-colors" />
            )}
          </span>
        </div>

        <span className="font-serif">
          {isPressing ? 'Banishing...' : 'Hold to Exorcise'}
        </span>

        {hasGhosts && (
          <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-rose-900/60 text-rose-300 font-mono border border-rose-700/50">
            {ghosts.length}
          </span>
        )}
      </button>

      {/* Pulsing spectral crimson aura when pressing */}
      {isPressing && (
        <span
          className="absolute -inset-1 rounded-xl bg-rose-600/30 blur-md pointer-events-none animate-ping"
          style={{ animationDuration: '1s' }}
        />
      )}
    </div>
  );
};
