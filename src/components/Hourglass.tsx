'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const triggerFlip = (direction: 'cw' | 'ccw' = 'cw') => {
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
  };

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
  }, [ghosts, soundEnabled, volume]);

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
      aria-label="Antique Swivel Hourglass"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => triggerFlip('cw')}
      className="fixed left-52 lg:left-60 xl:left-68 2xl:left-72 bottom-4 z-20 pointer-events-auto select-none hidden lg:flex flex-col items-center opacity-85 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
      style={{ width: '92px', height: '192px' }}
      title="Antique Swivel Hourglass (Click to invert • Spirits can spin it!)"
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
        @keyframes sandGrainFall1 {
          0% { transform: translateY(0); opacity: 0.95; }
          100% { transform: translateY(var(--fallDist)); opacity: 0.15; }
        }
        @keyframes sandGrainFall2 {
          0% { transform: translateY(0); opacity: 0.9; }
          100% { transform: translateY(var(--fallDist)); opacity: 0.2; }
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
        .sand-grain-1 {
          animation: sandGrainFall1 0.22s ease-in infinite;
        }
        .sand-grain-2 {
          animation: sandGrainFall2 0.28s ease-in infinite 0.08s;
        }
        .sand-grain-3 {
          animation: sandGrainFall1 0.25s ease-in infinite 0.14s;
        }
      `}</style>

      {/* ========================================================
          1. STATIONARY OUTER STAND FRAME (Stays firmly on desk)
          Heavy base, top cap, turned support pillars & axle sockets
          ======================================================== */}
      <svg
        viewBox="0 0 92 192"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="bronzeFrameGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#120d18" />
            <stop offset="35%" stopColor="#251a30" />
            <stop offset="70%" stopColor="#322240" />
            <stop offset="100%" stopColor="#120d18" />
          </linearGradient>

          <linearGradient id="brassBossGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#78592c" />
            <stop offset="50%" stopColor="#b88f4e" />
            <stop offset="100%" stopColor="#453116" />
          </linearGradient>
        </defs>

        {/* Top Stationary Plate Assembly */}
        <rect x="6" y="2" width="80" height="6" rx="2" fill="url(#bronzeFrameGrad)" stroke="#09050d" strokeWidth="0.8" />
        <rect x="12" y="8" width="68" height="7" rx="1.5" fill="#181122" stroke="#2f213e" strokeWidth="0.8" />
        {/* Top Decorative Finial */}
        <circle cx="46" cy="1.5" r="3" fill="#8c6a38" stroke="#2a1e10" strokeWidth="0.8" />
        <circle cx="46" cy="1.5" r="1" fill="#dfbe7e" />

        {/* Bottom Stationary Stepped Pedestal */}
        <rect x="12" y="177" width="68" height="7" rx="1.5" fill="#181122" stroke="#2f213e" strokeWidth="0.8" />
        <rect x="6" y="184" width="80" height="6" rx="2" fill="url(#bronzeFrameGrad)" stroke="#09050d" strokeWidth="0.8" />

        {/* Left & Right Stationary Outer Columns */}
        {/* Left column */}
        <rect x="8" y="15" width="4" height="162" rx="1" fill="#150f1d" stroke="#08050c" strokeWidth="0.8" />
        {/* Left column turned baluster rings */}
        <rect x="7" y="24" width="6" height="3" rx="1" fill="#4d3b24" />
        <rect x="7" y="165" width="6" height="3" rx="1" fill="#4d3b24" />

        {/* Right column */}
        <rect x="80" y="15" width="4" height="162" rx="1" fill="#150f1d" stroke="#08050c" strokeWidth="0.8" />
        {/* Right column turned baluster rings */}
        <rect x="79" y="24" width="6" height="3" rx="1" fill="#4d3b24" />
        <rect x="79" y="165" width="6" height="3" rx="1" fill="#4d3b24" />

        {/* Horizontal Swivel Axle Bearing Bosses (At center y=96) */}
        {/* Left Bearing Socket */}
        <circle cx="10" cy="96" r="5" fill="url(#brassBossGrad)" stroke="#1a1208" strokeWidth="1" />
        <circle cx="10" cy="96" r="2.2" fill="#0d0912" />

        {/* Right Bearing Socket */}
        <circle cx="82" cy="96" r="5" fill="url(#brassBossGrad)" stroke="#1a1208" strokeWidth="1" />
        <circle cx="82" cy="96" r="2.2" fill="#0d0912" />
      </svg>

      {/* ========================================================
          2. SWIVELING INNER GLASS ASSEMBLY (Rotates on central axle)
          Double glass bulb, horizontal axle pins, and natural sand!
          ======================================================== */}
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
            {/* Natural Warm Desert Sand Gradients */}
            <linearGradient id="sandTopGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5e0b0" />
              <stop offset="35%" stopColor="#dfb36b" />
              <stop offset="70%" stopColor="#c59648" />
              <stop offset="100%" stopColor="#9a6e2a" />
            </linearGradient>

            <linearGradient id="sandBottomGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7e5be" />
              <stop offset="30%" stopColor="#e2b972" />
              <stop offset="70%" stopColor="#c7994b" />
              <stop offset="100%" stopColor="#8c6120" />
            </linearGradient>

            {/* Glowing sand surface dune shimmer */}
            <linearGradient id="sandSurfaceShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b48339" />
              <stop offset="50%" stopColor="#fae7b9" />
              <stop offset="100%" stopColor="#b48339" />
            </linearGradient>

            {/* Trickling stream thread gradient */}
            <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff6ce" />
              <stop offset="50%" stopColor="#eed087" />
              <stop offset="100%" stopColor="#dc9e47" />
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

          {/* Horizontal Swivel Axle Pins (Reaches from inner waist into frame sockets) */}
          <rect x="10" y="94.5" width="32" height="3" rx="1.5" fill="#694e27" stroke="#332411" strokeWidth="0.8" />
          <rect x="50" y="94.5" width="32" height="3" rx="1.5" fill="#694e27" stroke="#332411" strokeWidth="0.8" />

          {/* Inner Protective Brass End Caps */}
          <rect x="23" y="18" width="46" height="6" rx="2" fill="#2d2216" stroke="#684f2b" strokeWidth="1" />
          <rect x="23" y="168" width="46" height="6" rx="2" fill="#2d2216" stroke="#684f2b" strokeWidth="1" />

          {/* Slender Brass Retaining Rods flanking the glass */}
          <line x1="24" y1="24" x2="24" y2="168" stroke="#523e25" strokeWidth="1" opacity="0.6" />
          <line x1="68" y1="24" x2="68" y2="168" stroke="#523e25" strokeWidth="1" opacity="0.6" />

          {/* ========================================================
              NATURAL SAND SIMULATION (Physics, Crater & Repose Angle)
              ======================================================== */}

          {/* 1. TOP BULB SAND (Draining with concave funnel crater) */}
          {topSandPct > 0.2 && (
            <>
              <path
                d={`M 15 ${topSurfaceY} Q 46 ${topSurfaceY + craterDepth}, 77 ${topSurfaceY} L 77 96 L 15 96 Z`}
                fill="url(#sandTopGrad)"
                clipPath="url(#upperBulbClip)"
              />
              <path
                d={`M 15 ${topSurfaceY} Q 46 ${topSurfaceY + craterDepth}, 77 ${topSurfaceY}`}
                stroke="url(#sandSurfaceShine)"
                strokeWidth="1.2"
                fill="none"
                clipPath="url(#upperBulbClip)"
              />
            </>
          )}

          {/* 2. CONTINUOUS TRICKLING STREAM THROUGH WAIST */}
          {isDraining && (
            <>
              {/* Central animated sand stream thread */}
              <line
                x1="46"
                y1="96"
                x2="46"
                y2={peakY}
                stroke="url(#streamGrad)"
                strokeWidth="2"
                strokeDasharray="2.5,2.5"
                className="sand-stream-rush"
              />

              {/* Real cascading sand grain particles falling along stream */}
              <g style={{ '--fallDist': `${Math.max(12, peakY - 96)}px` } as React.CSSProperties}>
                <circle cx="46" cy="98" r="1.1" fill="#fff7d6" className="sand-grain-1" />
                <circle cx="45.5" cy="102" r="0.9" fill="#fde68a" className="sand-grain-2" />
                <circle cx="46.5" cy="106" r="1.0" fill="#fef08a" className="sand-grain-3" />
              </g>

              {/* Kinetic grain splash ripple at the impact peak */}
              <ellipse
                cx="46"
                cy={peakY}
                rx="2.6"
                ry="1"
                fill="#fff9e0"
                opacity="0.8"
                className="animate-pulse"
              />
            </>
          )}

          {/* 3. BOTTOM BULB SAND MOUND (Accumulating angle of repose cone) */}
          {bottomSandPct > 0.2 && (
            <>
              <path
                d={`M 15 ${bottomLevelY} Q 46 ${peakY}, 77 ${bottomLevelY} L 77 168 L 15 168 Z`}
                fill="url(#sandBottomGrad)"
                clipPath="url(#lowerBulbClip)"
              />
              <path
                d={`M 15 ${bottomLevelY} Q 46 ${peakY}, 77 ${bottomLevelY}`}
                stroke="url(#sandSurfaceShine)"
                strokeWidth="1.2"
                fill="none"
                clipPath="url(#lowerBulbClip)"
              />
            </>
          )}

          {/* ========================================================
              TRANSLUCENT GLASS CHAMBER & SPECULAR LIGHTING
              ======================================================== */}
          {/* Glass Bulbs Contour */}
          <path
            d="M 25 24 C 20 52, 22 80, 42 96 C 22 112, 20 140, 25 168 L 67 168 C 72 140, 70 112, 50 96 C 70 80, 72 52, 67 24 Z"
            fill="rgba(255, 255, 255, 0.03)"
            stroke="rgba(255, 255, 255, 0.24)"
            strokeWidth="1.3"
          />

          {/* Refined Glass Specular Glare Highlights */}
          {/* Upper left curved reflection */}
          <path
            d="M 28 32 Q 24 58, 36 82"
            stroke="rgba(255, 255, 255, 0.38)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* Upper right faint reflection */}
          <path
            d="M 64 36 Q 66 58, 56 80"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="0.9"
          />
          {/* Lower left curved reflection */}
          <path
            d="M 36 110 Q 24 134, 28 160"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          {/* Lower right faint reflection */}
          <path
            d="M 56 112 Q 66 134, 64 156"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="0.9"
          />
        </svg>
      </div>

      {/* Subtle Invert Indicator on Hover */}
      {isHovered && flipDirection === null && (
        <span className="absolute -bottom-5 text-[9px] font-mono text-purple-300/70 tracking-widest uppercase bg-stone-950/80 px-1.5 py-0.5 rounded border border-purple-900/40 pointer-events-none animate-in fade-in duration-200">
          Invert
        </span>
      )}
    </aside>
  );
};
