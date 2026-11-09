'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';

export const Hourglass: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);
  const isFlippingRef = useRef(false);

  // States
  const [flipDirection, setFlipDirection] = useState<'cw' | 'ccw' | null>(null);
  const [sandProgress, setSandProgress] = useState<number>(75); // 0 (empty top) to 100 (full top)
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Sand trickling animation loop (flows downward smoothly when upright)
  useEffect(() => {
    if (flipDirection !== null) return;

    const interval = setInterval(() => {
      setSandProgress((prev) => {
        if (prev <= 0.4) {
          return 0; // Fully drained, rests until flipped
        }
        // Smooth trickling rate: drains ~1% every 0.6 seconds
        return Math.max(0, prev - 0.16);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [flipDirection]);

  // Flip the inner glass bulb assembly top-to-bottom on its central horizontal axle
  const triggerFlip = useCallback((direction: 'cw' | 'ccw' = 'cw') => {
    if (isFlippingRef.current) return;
    isFlippingRef.current = true;
    setFlipDirection(direction);

    if (soundEnabled) ghostAudio.playGlassClink(volume);

    // After 650ms swivel animation completes, settle the new sand levels
    setTimeout(() => {
      setSandProgress((prev) => {
        const remainingInBottom = 100 - prev;
        // If it was fully drained, flipping resets to full 100%
        return remainingInBottom <= 0.5 ? 100 : remainingInBottom;
      });
      setFlipDirection(null);
      isFlippingRef.current = false;
    }, 650);
  }, [soundEnabled, volume]);

  // Monitor ghost collisions to spin the swivel hourglass top-to-bottom
  useEffect(() => {
    if (isFlippingRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // Ghost collision with kinetic force swivels the inner glass
      if (dist < 115 && Math.hypot(ghost.vx, ghost.vy) > 0.42) {
        triggerFlip(ghost.vx >= 0 ? 'cw' : 'ccw');
        break;
      }
    }
  }, [ghosts, triggerFlip]);

  // Top sand height vs bottom sand height
  const topSandPct = sandProgress;
  const bottomSandPct = 100 - sandProgress;

  // Geometry calculations for realistic sand behavior (angle of repose + cratering)
  // Top bulb: drains from y=26 down to y=94 with a concave funnel crater
  const topSurfaceY = 26 + (1 - topSandPct / 100) * 66;
  const craterDepth = topSandPct > 4 && topSandPct < 96 ? Math.min(5, (topSandPct / 100) * 6) : 0;

  // Bottom bulb: piles up from y=166 up to y=98 in a conical mound
  const bottomLevelY = 166 - (bottomSandPct / 100) * 64;
  const coneHeight = bottomSandPct > 2 && bottomSandPct < 98 ? Math.min(8, Math.max(2, (bottomSandPct / 100) * 10)) : 0;
  const peakY = Math.max(98, bottomLevelY - coneHeight);

  const isDraining = flipDirection === null && topSandPct > 0.4;

  return (
    <aside
      ref={containerRef}
      aria-label="Occult Witch's Swivel Hourglass"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => triggerFlip('cw')}
      className="fixed left-52 lg:left-60 xl:left-68 2xl:left-72 bottom-4 z-20 pointer-events-auto select-none hidden lg:flex flex-col items-center opacity-85 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      style={{ width: '92px', height: '192px' }}
      title="Hourglass (Click to invert)"
    >
      <style>{`
        @keyframes hourglassSwivelCw {
          0% { transform: rotate(0deg); }
          75% { transform: rotate(192deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes hourglassSwivelCcw {
          0% { transform: rotate(0deg); }
          75% { transform: rotate(-192deg); }
          100% { transform: rotate(-180deg); }
        }
        @keyframes sandStreamRush {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -12; }
        }
        @keyframes ashParticleFall1 {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(var(--fallDist)); opacity: 0.1; }
        }
        @keyframes ashParticleFall2 {
          0% { transform: translateY(0); opacity: 0.75; }
          100% { transform: translateY(var(--fallDist)); opacity: 0.15; }
        }
        .anim-swivel-cw {
          animation: hourglassSwivelCw 0.65s cubic-bezier(0.34, 1.35, 0.64, 1) forwards;
        }
        .anim-swivel-ccw {
          animation: hourglassSwivelCcw 0.65s cubic-bezier(0.34, 1.35, 0.64, 1) forwards;
        }
        .sand-stream-rush {
          animation: sandStreamRush 0.3s linear infinite;
        }
        .ash-particle-1 {
          animation: ashParticleFall1 0.23s ease-in infinite;
        }
        .ash-particle-2 {
          animation: ashParticleFall2 0.29s ease-in infinite 0.08s;
        }
      `}</style>

      {/* Stationary outer stand frame */}
      <svg
        viewBox="0 0 92 192"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="wroughtIronGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a070f" />
            <stop offset="35%" stopColor="#1a1422" />
            <stop offset="70%" stopColor="#221a2c" />
            <stop offset="100%" stopColor="#0a070f" />
          </linearGradient>

          <linearGradient id="ironSocketGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e1826" />
            <stop offset="50%" stopColor="#32283e" />
            <stop offset="100%" stopColor="#110d17" />
          </linearGradient>
        </defs>

        {/* Top Stationary Plate Assembly (Matte Blackened Iron) */}
        <rect x="6" y="2" width="80" height="6" rx="2" fill="url(#wroughtIronGrad)" stroke="#050308" strokeWidth="0.8" />
        <rect x="12" y="8" width="68" height="7" rx="1.5" fill="#130e1a" stroke="#231b2e" strokeWidth="0.8" />
        {/* Dark Gothic Finial Knob */}
        <circle cx="46" cy="1.5" r="3" fill="#261e30" stroke="#0e0a14" strokeWidth="0.8" />
        <circle cx="46" cy="1.5" r="1" fill="#3a2f48" />

        {/* Bottom Stationary Stepped Pedestal (Matte Blackened Iron) */}
        <rect x="12" y="177" width="68" height="7" rx="1.5" fill="#130e1a" stroke="#231b2e" strokeWidth="0.8" />
        <rect x="6" y="184" width="80" height="6" rx="2" fill="url(#wroughtIronGrad)" stroke="#050308" strokeWidth="0.8" />

        {/* Left & Right Stationary Outer Columns */}
        {/* Left column */}
        <rect x="8" y="15" width="4" height="162" rx="1" fill="#110c18" stroke="#050308" strokeWidth="0.8" />
        {/* Left column turned baluster rings */}
        <rect x="7" y="24" width="6" height="3" rx="1" fill="#251c30" />
        <rect x="7" y="165" width="6" height="3" rx="1" fill="#251c30" />

        {/* Right column */}
        <rect x="80" y="15" width="4" height="162" rx="1" fill="#110c18" stroke="#050308" strokeWidth="0.8" />
        {/* Right column turned baluster rings */}
        <rect x="79" y="24" width="6" height="3" rx="1" fill="#251c30" />
        <rect x="79" y="165" width="6" height="3" rx="1" fill="#251c30" />

        {/* Horizontal Swivel Axle Bearing Bosses (At center y=96) */}
        {/* Left Bearing Socket */}
        <circle cx="10" cy="96" r="5" fill="url(#ironSocketGrad)" stroke="#0b0811" strokeWidth="1" />
        <circle cx="10" cy="96" r="2.2" fill="#060408" />

        {/* Right Bearing Socket */}
        <circle cx="82" cy="96" r="5" fill="url(#ironSocketGrad)" stroke="#0b0811" strokeWidth="1" />
        <circle cx="82" cy="96" r="2.2" fill="#060408" />
      </svg>

      {/* Swiveling inner glass assembly */}
      <div
        style={{
          width: '92px',
          height: '192px',
          transformOrigin: '46px 96px',
        }}
        className={`absolute inset-0 flex items-center justify-center z-20 ${
          flipDirection === 'cw'
            ? 'anim-swivel-cw'
            : flipDirection === 'ccw'
            ? 'anim-swivel-ccw'
            : ''
        }`}
      >
        <svg
          viewBox="0 0 92 192"
          className="w-full h-full overflow-visible fill-none"
        >
          <defs>
            {/* Somber Grave Dust / Bone Ash Gradients (Muted, Dark, Scary) */}
            <linearGradient id="ashTopGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6e665d" />
              <stop offset="35%" stopColor="#4c453e" />
              <stop offset="70%" stopColor="#332d27" />
              <stop offset="100%" stopColor="#1e1a17" />
            </linearGradient>

            <linearGradient id="ashBottomGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#686057" />
              <stop offset="30%" stopColor="#48413a" />
              <stop offset="70%" stopColor="#2f2924" />
              <stop offset="100%" stopColor="#171412" />
            </linearGradient>

            {/* Faint matte surface rim (no bright golden shine) */}
            <linearGradient id="ashSurfaceShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#25211c" />
              <stop offset="50%" stopColor="#574f46" />
              <stop offset="100%" stopColor="#25211c" />
            </linearGradient>

            {/* Dull bone ash stream trickle */}
            <linearGradient id="ashStreamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#877f74" />
              <stop offset="50%" stopColor="#5e564c" />
              <stop offset="100%" stopColor="#363029" />
            </linearGradient>

            {/* Upper Bulb Interior Mask */}
            <clipPath id="upperBulbClip">
              <path d="M 25 24 C 20 52, 22 80, 42 96 L 50 96 C 70 80, 72 52, 67 24 Z" />
            </clipPath>

            {/* Lower Bulb Interior Mask */}
            <clipPath id="lowerBulbClip">
              <path d="M 42 96 C 22 112, 20 140, 25 168 L 67 168 C 72 140, 70 112, 50 96 Z" />
            </clipPath>
          </defs>

          {/* Horizontal Swivel Axle Pins (Blackened Iron) */}
          <rect x="10" y="94.5" width="32" height="3" rx="1.5" fill="#2b2234" stroke="#120c18" strokeWidth="0.8" />
          <rect x="50" y="94.5" width="32" height="3" rx="1.5" fill="#2b2234" stroke="#120c18" strokeWidth="0.8" />

          {/* Inner Protective Dark Cast Iron End Caps */}
          <rect x="23" y="18" width="46" height="6" rx="2" fill="#171120" stroke="#2c213b" strokeWidth="1" />
          <rect x="23" y="168" width="46" height="6" rx="2" fill="#171120" stroke="#2c213b" strokeWidth="1" />

          {/* Slender Dark Iron Retaining Rods flanking the glass */}
          <line x1="24" y1="24" x2="24" y2="168" stroke="#261c33" strokeWidth="1" opacity="0.6" />
          <line x1="68" y1="24" x2="68" y2="168" stroke="#261c33" strokeWidth="1" opacity="0.6" />

          {/* Sand simulation */}

          {/* Upper bulb sand */}
          {topSandPct > 0.2 && (
            <>
              <path
                d={`M 15 ${topSurfaceY} Q 46 ${topSurfaceY + craterDepth}, 77 ${topSurfaceY} L 77 96 L 15 96 Z`}
                fill="url(#ashTopGrad)"
                clipPath="url(#upperBulbClip)"
              />
              <path
                d={`M 15 ${topSurfaceY} Q 46 ${topSurfaceY + craterDepth}, 77 ${topSurfaceY}`}
                stroke="url(#ashSurfaceShine)"
                strokeWidth="1"
                fill="none"
                clipPath="url(#upperBulbClip)"
              />
            </>
          )}

          {/* Central trickling stream */}
          {isDraining && (
            <>
              {/* Central animated ash stream thread */}
              <line
                x1="46"
                y1="96"
                x2="46"
                y2={peakY}
                stroke="url(#ashStreamGrad)"
                strokeWidth="1.8"
                strokeDasharray="2.5,2.5"
                className="sand-stream-rush"
              />

              {/* Muted ash particles drifting down the stream */}
              <g style={{ '--fallDist': `${Math.max(12, peakY - 96)}px` } as React.CSSProperties}>
                <circle cx="46" cy="98" r="1.0" fill="#8c847a" className="ash-particle-1" />
                <circle cx="45.5" cy="102" r="0.8" fill="#696259" className="ash-particle-2" />
                <circle cx="46.5" cy="106" r="0.9" fill="#756e64" className="ash-particle-1" />
              </g>

              {/* Subtle muted impact ripple at the mound peak */}
              <ellipse
                cx="46"
                cy={peakY}
                rx="2.2"
                ry="0.8"
                fill="#595249"
                opacity="0.5"
              />
            </>
          )}

          {/* Lower bulb sand mound */}
          {bottomSandPct > 0.2 && (
            <>
              <path
                d={`M 15 ${bottomLevelY} Q 46 ${peakY}, 77 ${bottomLevelY} L 77 168 L 15 168 Z`}
                fill="url(#ashBottomGrad)"
                clipPath="url(#lowerBulbClip)"
              />
              <path
                d={`M 15 ${bottomLevelY} Q 46 ${peakY}, 77 ${bottomLevelY}`}
                stroke="url(#ashSurfaceShine)"
                strokeWidth="1"
                fill="none"
                clipPath="url(#lowerBulbClip)"
              />
            </>
          )}

          {/* Glass chamber */}
          {/* Glass Bulbs Contour */}
          <path
            d="M 25 24 C 20 52, 22 80, 42 96 C 22 112, 20 140, 25 168 L 67 168 C 72 140, 70 112, 50 96 C 70 80, 72 52, 67 24 Z"
            fill="rgba(15, 10, 20, 0.2)"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.2"
          />

          {/* Subtle Matte Specular Glare (Softened, Not Shiny) */}
          {/* Upper left curved reflection */}
          <path
            d="M 28 32 Q 24 58, 36 82"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {/* Upper right faint reflection */}
          <path
            d="M 64 36 Q 66 58, 56 80"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="0.8"
          />
          {/* Lower left curved reflection */}
          <path
            d="M 36 110 Q 24 134, 28 160"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {/* Lower right faint reflection */}
          <path
            d="M 56 112 Q 66 134, 64 156"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* Subtle Invert Indicator on Hover */}
      {isHovered && flipDirection === null && (
        <span className="absolute -bottom-5 text-[9px] font-mono text-purple-300/60 tracking-widest uppercase bg-stone-950/80 px-1.5 py-0.5 rounded border border-purple-900/40 pointer-events-none animate-in fade-in duration-200">
          Invert
        </span>
      )}
    </aside>
  );
};
