'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGhostStore } from '../store/ghostStore';

export const OccultCandle: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const candleRef = useRef<HTMLDivElement>(null);

  const [flameTilt, setFlameTilt] = useState<number>(0);
  const [flameScale, setFlameScale] = useState<number>(1);
  const [flameColor, setFlameColor] = useState<string>('rgba(251, 191, 36, 0.9)');
  const [isLit, setIsLit] = useState<boolean>(true);

  // Monitor ghost proximity to candle
  useEffect(() => {
    if (!isLit || !candleRef.current) return;

    const candleRect = candleRef.current.getBoundingClientRect();
    const candleCenterX = candleRect.left + candleRect.width / 2;
    const candleCenterY = candleRect.top + candleRect.height / 2;

    let closestDist = Infinity;
    let tilt = 0;
    let customColor = 'rgba(251, 191, 36, 0.9)';

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - candleCenterX;
      const dy = ghost.y - candleCenterY;
      const dist = Math.hypot(dx, dy);

      if (dist < 140 && dist < closestDist) {
        closestDist = dist;
        // Draft blows flame away from incoming ghost!
        tilt = -(dx / dist) * Math.min(25, (1 - dist / 140) * 35);
        if (ghost.type === 'wisp') {
          customColor = 'rgba(34, 211, 238, 0.95)';
        } else if (ghost.type === 'regret') {
          customColor = 'rgba(244, 63, 94, 0.95)';
        }
      }
    }

    if (closestDist < 140) {
      setFlameTilt(tilt);
      setFlameScale(1.15);
      setFlameColor(customColor);
    } else {
      setFlameTilt(0);
      setFlameScale(1);
      setFlameColor('rgba(251, 191, 36, 0.9)');
    }
  }, [ghosts, isLit]);

  return (
    <div
      ref={candleRef}
      onClick={() => setIsLit(!isLit)}
      title={isLit ? 'Click to snuff candle flame' : 'Click to rekindle candle flame'}
      className="fixed left-4 bottom-8 z-30 flex flex-col items-center cursor-pointer select-none group pointer-events-auto"
    >
      {/* Candle Flame & Dynamic Glow */}
      <div className="relative flex flex-col items-center">
        {isLit ? (
          <>
            {/* Ambient Radial Flame Light */}
            <div
              className="absolute -top-10 w-24 h-24 rounded-full pointer-events-none transition-all duration-300 blur-xl opacity-60"
              style={{
                backgroundColor: flameColor,
                transform: `scale(${flameScale * 1.1})`,
              }}
            />

            {/* Flickering Animated Flame */}
            <div
              className="relative w-4 h-8 rounded-full animate-candle-flame transition-transform duration-150 origin-bottom"
              style={{
                background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 30%, ${flameColor} 70%, transparent 100%)`,
                boxShadow: `0 0 16px ${flameColor}`,
                transform: `rotate(${flameTilt}deg) scale(${flameScale})`,
              }}
            >
              {/* Inner hot blue core */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-2.5 rounded-full bg-blue-400/80 blur-[0.5px]" />
            </div>

            {/* Candle Wick */}
            <div className="w-0.5 h-2 bg-neutral-900 mx-auto" />
          </>
        ) : (
          <div className="flex flex-col items-center">
            {/* Extinguished smoke wisp */}
            <div className="w-1 h-3 bg-neutral-600/40 rounded-full animate-pulse mb-0.5" />
            <div className="w-0.5 h-2 bg-neutral-900" />
          </div>
        )}
      </div>

      {/* Wax Pillar with Drips */}
      <div className="relative w-5 h-16 bg-gradient-to-r from-amber-100 via-stone-200 to-amber-200/90 rounded-t-sm shadow-md border-x border-stone-400/30 overflow-hidden">
        {/* Wax drip details */}
        <div className="absolute top-0 left-1 w-1.5 h-6 bg-amber-100/90 rounded-b-full shadow-inner" />
        <div className="absolute top-0 right-1 w-1 h-4 bg-amber-100/80 rounded-b-full" />
      </div>

      {/* Antique Brass Candlestick Holder */}
      <div className="w-9 h-2 bg-amber-700 rounded-t border-t border-amber-500 shadow-sm" />
      <div className="w-12 h-2.5 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 rounded-b-full shadow-lg border border-amber-600/60" />

      {/* Subtle Label */}
      <span className="mt-1 text-[8px] font-mono text-purple-400/50 opacity-0 group-hover:opacity-100 transition-opacity">
        {isLit ? 'Snuff flame' : 'Relight'}
      </span>
    </div>
  );
};
