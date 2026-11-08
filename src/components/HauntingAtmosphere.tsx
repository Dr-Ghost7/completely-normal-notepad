'use client';

import React, { useMemo } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { useHauntingIntensity } from '../hooks/useGhostStats';

export const HauntingAtmosphere: React.FC = () => {
  const intensity = useHauntingIntensity();
  const ghostCount = useGhostStore((state) => state.ghosts.length);
  const candleFlicker = useGhostStore((state) => state.settings.candleFlicker);
  const reducedMotion = useGhostStore((state) => state.settings.reducedMotion);

  // Atmospheric intensity based on active wandering ghosts (0 to 10)
  const atmosphericStyles = useMemo(() => {
    const vignetteOpacity = Math.min(0.9, 0.45 + intensity * 0.05);
    const redGlow = Math.min(0.5, intensity * 0.05);
    const purpleGlow = Math.min(0.6, 0.2 + intensity * 0.04);

    return {
      vignetteOpacity,
      redGlow,
      purpleGlow,
    };
  }, [intensity]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-1000 ease-out overflow-hidden"
      aria-hidden="true"
    >
      {/* Background radial gradient: deep purple & blood crimson shadows */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: atmosphericStyles.vignetteOpacity,
          background:
            'radial-gradient(circle at 50% 35%, rgba(60, 10, 80, 0.15) 0%, rgba(30, 5, 45, 0.5) 45%, rgba(6, 2, 10, 0.95) 100%)',
        }}
      />

      {/* Crimson edge vignette that intensifies with more ghosts */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: atmosphericStyles.redGlow,
          background:
            'radial-gradient(circle at center, transparent 40%, rgba(136, 19, 55, 0.35) 90%, rgba(76, 5, 25, 0.8) 100%)',
        }}
      />

      {/* Subtle spectral candle flicker in purple-red */}
      {candleFlicker && !reducedMotion && intensity >= 2 && (
        <div
          className={`absolute inset-0 bg-purple-600/10 mix-blend-screen transition-opacity duration-700 ${
            intensity >= 5 ? 'animate-spectral-intense' : 'animate-spectral-subtle'
          }`}
          style={{ opacity: Math.min(0.45, intensity * 0.05) }}
        />
      )}

      {/* Eerie drifting mist motes in crimson & violet */}
      {!reducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-purple-700/15 blur-3xl animate-purple-mist"
            style={{ opacity: atmosphericStyles.purpleGlow }}
          />
          <div
            className="absolute top-1/2 -right-20 w-[30rem] h-[30rem] rounded-full bg-rose-700/15 blur-3xl animate-crimson-mist"
            style={{ opacity: atmosphericStyles.redGlow + 0.1 }}
          />
          <div
            className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full bg-fuchsia-900/15 blur-3xl animate-purple-mist"
            style={{ opacity: atmosphericStyles.purpleGlow }}
          />
        </div>
      )}
    </div>
  );
};
