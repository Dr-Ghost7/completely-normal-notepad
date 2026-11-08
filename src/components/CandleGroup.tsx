'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';

export const CandleGroup: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);

  const [flameTilt, setFlameTilt] = useState<number>(0);
  const [flameScale, setFlameScale] = useState<number>(1);
  const [flameColor, setFlameColor] = useState<string>('rgba(251, 191, 36, 0.9)');
  const [isLit, setIsLit] = useState<boolean>(true);

  // Monitor ghost proximity to candle
  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let closestDist = Infinity;
    let tilt = 0;
    let customColor = 'rgba(251, 191, 36, 0.9)';

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // 1. If ghost flies right through or very fast nearby: BLOW CANDLE OUT!
      if (isLit && dist < 55 && Math.hypot(ghost.vx, ghost.vy) > 0.6) {
        setIsLit(false);
        if (soundEnabled) ghostAudio.playBlowOut(volume);
        return;
      }

      if (dist < 150 && dist < closestDist) {
        closestDist = dist;
        tilt = -(dx / dist) * Math.min(25, (1 - dist / 150) * 35);

        if (ghost.type === 'wisp') {
          customColor = 'rgba(34, 211, 238, 0.95)';
        } else if (ghost.type === 'regret') {
          customColor = 'rgba(244, 63, 94, 0.95)';
        }
      }
    }

    if (closestDist < 150) {
      setFlameTilt(tilt);
      setFlameScale(1.15);
      setFlameColor(customColor);
    } else {
      setFlameTilt(0);
      setFlameScale(1);
      setFlameColor('rgba(251, 191, 36, 0.9)');
    }
  }, [ghosts, isLit, soundEnabled, volume]);

  return (
    <div
      ref={containerRef}
      onClick={() => setIsLit(!isLit)}
      title={
        isLit
          ? 'Candles lit (Ghosts can blow them out! Click to snuff)'
          : 'Candles extinguished! Click to relight'
      }
      className="fixed left-5 sm:left-10 top-24 z-30 pointer-events-auto select-none flex items-end gap-3 cursor-pointer group"
    >
      {/* 1. Tall Antique Brass Candle */}
      <div className="relative flex flex-col items-center">
        {isLit ? (
          <>
            {/* Ambient Warm Flame Glow */}
            <div
              className="absolute -top-12 w-28 h-28 rounded-full pointer-events-none transition-all duration-300 blur-xl opacity-60"
              style={{
                backgroundColor: flameColor,
                transform: `scale(${flameScale * 1.15})`,
              }}
            />

            {/* Flickering Flame */}
            <div
              className="relative w-4 h-9 rounded-full animate-candle-flame transition-transform duration-150 origin-bottom"
              style={{
                background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
                boxShadow: `0 0 20px ${flameColor}`,
                transform: `rotate(${flameTilt}deg) scale(${flameScale})`,
              }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-2.5 rounded-full bg-blue-400/80 blur-[0.5px]" />
            </div>
            <div className="w-0.5 h-2 bg-neutral-900 mx-auto" />
          </>
        ) : (
          <div className="flex flex-col items-center">
            {/* Extinguished Smoke Tendril */}
            <div className="w-1.5 h-4 bg-neutral-500/40 rounded-full animate-pulse mb-0.5" />
            <div className="w-0.5 h-2 bg-neutral-900" />
          </div>
        )}

        {/* Tall Candle Body with Wax Drips */}
        <div className="relative w-6 h-20 bg-gradient-to-r from-amber-100 via-stone-200 to-amber-200/90 rounded-t-sm shadow-md border-x border-stone-400/30 overflow-hidden">
          <div className="absolute top-0 left-1 w-1.5 h-8 bg-amber-100/90 rounded-b-full shadow-inner" />
          <div className="absolute top-0 right-1 w-1 h-5 bg-amber-100/80 rounded-b-full" />
        </div>

        {/* Heavy Brass Candlestick */}
        <div className="w-10 h-2 bg-amber-700 rounded-t border-t border-amber-500 shadow-sm" />
        <div className="w-14 h-3 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 rounded-b-full shadow-xl border border-amber-600/70" />
      </div>

      {/* 2. Smaller Votive Candle in Saucer */}
      <div className="relative flex flex-col items-center -ml-1">
        {isLit && (
          <div
            className="w-3 h-6 rounded-full animate-candle-flame transition-transform duration-150 origin-bottom mb-0.5"
            style={{
              background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fed7aa 40%, rgba(249, 115, 22, 0.8) 100%)`,
              boxShadow: '0 0 12px rgba(249, 115, 22, 0.6)',
              transform: `rotate(${flameTilt * 0.7}deg) scale(${flameScale * 0.85})`,
            }}
          />
        )}
        <div className="w-7 h-6 bg-amber-100/90 rounded-t-sm border border-stone-400/40 shadow-inner" />
        <div className="w-10 h-2 bg-stone-800 rounded-full border border-stone-600/60 shadow-lg" />
      </div>
    </div>
  );
};
