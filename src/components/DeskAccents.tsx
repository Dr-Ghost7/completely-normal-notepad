'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useGhostStore } from '../store/ghostStore';

export const DeskAccents: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const containerRef = useRef<HTMLDivElement>(null);

  const [flameTilt, setFlameTilt] = useState<number>(0);
  const [flameScale, setFlameScale] = useState<number>(1);
  const [flameColor, setFlameColor] = useState<string>('rgba(251, 191, 36, 0.9)');
  const [isLit, setIsLit] = useState<boolean>(true);
  const [quillSway, setQuillSway] = useState<number>(0);

  // Monitor ghost proximity to desk accents
  useEffect(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let closestDist = Infinity;
    let tilt = 0;
    let sway = 0;
    let customColor = 'rgba(251, 191, 36, 0.9)';

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < 160 && dist < closestDist) {
        closestDist = dist;
        // Draft blows candle flame and sways feather quill
        tilt = -(dx / dist) * Math.min(25, (1 - dist / 160) * 35);
        sway = -(dx / dist) * Math.min(12, (1 - dist / 160) * 16);

        if (ghost.type === 'wisp') {
          customColor = 'rgba(34, 211, 238, 0.95)';
        } else if (ghost.type === 'regret') {
          customColor = 'rgba(244, 63, 94, 0.95)';
        }
      }
    }

    if (closestDist < 160) {
      setFlameTilt(tilt);
      setFlameScale(1.15);
      setFlameColor(customColor);
      setQuillSway(sway);
    } else {
      setFlameTilt(0);
      setFlameScale(1);
      setFlameColor('rgba(251, 191, 36, 0.9)');
      setQuillSway(0);
    }
  }, [ghosts, isLit]);

  return (
    <div
      ref={containerRef}
      className="fixed left-3 sm:left-6 bottom-4 z-30 pointer-events-auto select-none flex items-end gap-3.5"
    >
      {/* 1. Interactive Candle Pair (Tall Brass Candlestick + Melted Votive) */}
      <div
        onClick={() => setIsLit(!isLit)}
        title={isLit ? 'Click to snuff candle flames' : 'Click to light candles'}
        className="flex items-end gap-1.5 cursor-pointer group"
      >
        {/* Main Tall Candle */}
        <div className="relative flex flex-col items-center">
          {isLit ? (
            <>
              {/* Radial ambient glow */}
              <div
                className="absolute -top-10 w-24 h-24 rounded-full pointer-events-none transition-all duration-300 blur-xl opacity-60"
                style={{
                  backgroundColor: flameColor,
                  transform: `scale(${flameScale * 1.1})`,
                }}
              />

              {/* Animated Flame */}
              <div
                className="relative w-3.5 h-7 rounded-full animate-candle-flame transition-transform duration-150 origin-bottom"
                style={{
                  background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 35%, ${flameColor} 70%, transparent 100%)`,
                  boxShadow: `0 0 16px ${flameColor}`,
                  transform: `rotate(${flameTilt}deg) scale(${flameScale})`,
                }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 rounded-full bg-blue-400/80 blur-[0.5px]" />
              </div>
              <div className="w-0.5 h-1.5 bg-neutral-900 mx-auto" />
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-1 h-2.5 bg-neutral-600/40 rounded-full animate-pulse mb-0.5" />
              <div className="w-0.5 h-1.5 bg-neutral-900" />
            </div>
          )}

          {/* Candle Body with Wax Drips */}
          <div className="relative w-4 h-14 bg-gradient-to-r from-amber-100 via-stone-200 to-amber-200/90 rounded-t-sm shadow-md border-x border-stone-400/30 overflow-hidden">
            <div className="absolute top-0 left-0.5 w-1 h-5 bg-amber-100/90 rounded-b-full shadow-inner" />
          </div>

          {/* Brass Candlestick Base */}
          <div className="w-7 h-1.5 bg-amber-700 rounded-t border-t border-amber-500 shadow-sm" />
          <div className="w-10 h-2 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-950 rounded-b-full shadow-lg border border-amber-600/60" />
        </div>

        {/* Small Melted Votive Candle */}
        <div className="relative flex flex-col items-center -ml-1">
          {isLit && (
            <div
              className="w-2 h-4 rounded-full animate-candle-flame transition-transform duration-150 origin-bottom mb-0.5"
              style={{
                background: `radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fed7aa 40%, rgba(249, 115, 22, 0.8) 100%)`,
                boxShadow: '0 0 10px rgba(249, 115, 22, 0.6)',
                transform: `rotate(${flameTilt * 0.7}deg) scale(${flameScale * 0.85})`,
              }}
            />
          )}
          {/* Melted wax stump in ceramic saucer */}
          <div className="w-5 h-4 bg-amber-100/90 rounded-t-sm border border-stone-400/40" />
          <div className="w-7 h-1.5 bg-stone-800 rounded-full border border-stone-600/60 shadow" />
        </div>
      </div>

      {/* 2. Antique Glass Inkwell & Raven Feather Quill */}
      <div className="relative flex flex-col items-center">
        {/* Raven Quill Feather */}
        <div
          className="relative transition-transform duration-200 origin-bottom"
          style={{
            transform: `rotate(${-18 + quillSway}deg)`,
          }}
          title="Antique Raven Quill"
        >
          {/* Feather Blade */}
          <div className="w-3.5 h-16 bg-gradient-to-t from-purple-950 via-zinc-900 to-zinc-950 rounded-t-full rounded-br-2xl shadow-md border-r border-purple-500/20 flex flex-col justify-between">
            <div className="w-full h-1/2 opacity-30 bg-gradient-to-r from-transparent to-white/20" />
          </div>
          {/* Shaft tip going into ink */}
          <div className="w-0.5 h-3 bg-amber-200/80 mx-auto" />
        </div>

        {/* Heavy Glass Inkwell with Crimson/Purple Ink */}
        <div className="w-7 h-6 rounded-lg bg-gradient-to-b from-white/20 via-purple-950/80 to-black border border-white/25 shadow-lg backdrop-blur-sm relative flex items-center justify-center -mt-1">
          {/* Ink level */}
          <div className="absolute bottom-0.5 left-0.5 right-0.5 h-3 rounded-b-md bg-rose-950/90 border-t border-rose-600/40" />
          {/* Brass rim neck */}
          <div className="absolute -top-1 w-4 h-1.5 bg-amber-700 rounded-sm border border-amber-500/60" />
        </div>
      </div>

      {/* 3. Occult Tarot Card Resting on Desk */}
      <div
        className="hidden md:block w-9 h-14 rounded-md bg-[#160b24] border border-purple-500/30 shadow-lg p-1 text-center transform -rotate-6 hover:rotate-0 transition-transform cursor-pointer"
        title="The Moon — Arcana XVIII"
      >
        <div className="w-full h-full rounded border border-purple-400/20 flex flex-col items-center justify-between py-0.5 text-[8px] font-mono text-purple-300/70">
          <span>XVIII</span>
          <span className="text-xs">🌑</span>
          <span className="text-[6px] tracking-tighter uppercase text-purple-400">Moon</span>
        </div>
      </div>
    </div>
  );
};
