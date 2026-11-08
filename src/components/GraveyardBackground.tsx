'use client';

import React from 'react';
import { useGhostStore } from '../store/ghostStore';

export const GraveyardBackground: React.FC = () => {
  const themePreset = useGhostStore((state) => state.settings.themePreset) || 'witching-hour';

  // Theme-aware lunar & atmospheric colors
  const themeConfig = {
    'witching-hour': {
      moonGlow: 'rgba(168, 85, 247, 0.25)',
      moonCore: 'radial-gradient(circle at 40% 40%, #fdf4ff 0%, #d8b4fe 40%, #7e22ce 85%, #3b0764 100%)',
      mistColor: 'from-purple-950/20 via-purple-900/10 to-transparent',
      graveTint: '#130722',
      fogOpacity: 0.35,
    },
    'blood-moon': {
      moonGlow: 'rgba(239, 68, 68, 0.35)',
      moonCore: 'radial-gradient(circle at 40% 40%, #fff1f2 0%, #f43f5e 35%, #9f1239 80%, #4c0519 100%)',
      mistColor: 'from-rose-950/25 via-red-900/10 to-transparent',
      graveTint: '#1c050a',
      fogOpacity: 0.45,
    },
    'cemetery-crypt': {
      moonGlow: 'rgba(52, 211, 153, 0.25)',
      moonCore: 'radial-gradient(circle at 40% 40%, #f0fdf4 0%, #6ee7b7 35%, #059669 80%, #022c22 100%)',
      mistColor: 'from-emerald-950/25 via-emerald-900/10 to-transparent',
      graveTint: '#06160e',
      fogOpacity: 0.35,
    },
    'phantom-veil': {
      moonGlow: 'rgba(56, 189, 248, 0.25)',
      moonCore: 'radial-gradient(circle at 40% 40%, #f0f9ff 0%, #7dd3fc 35%, #0284c7 80%, #082f49 100%)',
      mistColor: 'from-sky-950/25 via-sky-900/10 to-transparent',
      graveTint: '#061224',
      fogOpacity: 0.35,
    },
  }[themePreset] || {
    moonGlow: 'rgba(168, 85, 247, 0.25)',
    moonCore: 'radial-gradient(circle at 40% 40%, #fdf4ff 0%, #d8b4fe 40%, #7e22ce 85%, #3b0764 100%)',
    mistColor: 'from-purple-950/20 via-purple-900/10 to-transparent',
    graveTint: '#130722',
    fogOpacity: 0.35,
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* DISTANT ROLLING CEMETERY HILLS & SILHOUETTE TOMBSTONES */}
      <div className="absolute bottom-0 left-0 right-0 h-64 sm:h-80 w-full opacity-65 transition-opacity duration-700">
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="w-full h-full text-black/90 fill-current"
        >
          <defs>
            <linearGradient id="graveyardGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={themeConfig.graveTint} stopOpacity="0.85" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.98" />
            </linearGradient>
          </defs>

          {/* Background Hill */}
          <path
            fill="url(#graveyardGrad)"
            d="M0,192L48,186.7C96,181,192,171,288,176C384,181,480,203,576,197.3C672,192,768,160,864,165.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L0,320Z"
          />

          {/* Gnarled Dead Tree Silhouette on Left Hill */}
          <g transform="translate(140, 95) scale(0.65)" fill={themeConfig.graveTint}>
            {/* Trunk */}
            <path d="M40,140 Q45,80 50,50 Q40,20 10,0 Q35,15 48,35 Q60,10 75,5 Q65,25 55,45 Q70,40 95,30 Q75,50 58,60 Q70,90 75,140 Z" />
            {/* Twisted branches */}
            <path d="M50,50 Q20,30 5,25 Q25,38 48,55 Z" />
            <path d="M55,65 Q85,45 110,40 Q85,60 60,75 Z" />
            <path d="M48,35 Q30,10 25,-10 Q38,5 50,25 Z" />
          </g>

          {/* Tombstones Along Left Horizon */}
          {/* Crooked Celtic Cross */}
          <g transform="translate(60, 145) rotate(-6)" fill="#0d0417">
            <rect x="18" y="0" width="6" height="42" rx="1" />
            <rect x="6" y="10" width="30" height="6" rx="1" />
            <circle cx="21" cy="13" r="8" fill="none" stroke="#0d0417" strokeWidth="2.5" />
          </g>

          {/* Arched Headstone 1 */}
          <path
            d="M260,155 Q272,138 284,155 L284,180 L260,180 Z"
            fill="#090310"
            transform="rotate(3, 272, 160)"
          />

          {/* Crooked Cross 2 */}
          <g transform="translate(340, 160) rotate(8)" fill="#0b0314">
            <rect x="12" y="0" width="5" height="34" rx="1" />
            <rect x="2" y="8" width="25" height="5" rx="1" />
          </g>

          {/* Pointed Obelisk Tombstone */}
          <polygon points="460,185 466,145 472,185" fill="#08020e" />

          {/* Wrought Iron Cemetery Fence Section (Middle) */}
          <g transform="translate(560, 175) scale(0.85)" stroke="#090310" strokeWidth="2">
            <line x1="0" y1="20" x2="160" y2="20" />
            <line x1="0" y1="40" x2="160" y2="40" />
            {[10, 30, 50, 70, 90, 110, 130, 150].map((x) => (
              <path key={x} d={`M${x},45 L${x},10 L${x - 2},12 L${x},5 L${x + 2},12 L${x},10`} />
            ))}
          </g>

          {/* Right Horizon Cemetery Headstones */}
          {/* Classic Round Tombstone */}
          <path
            d="M980,148 Q995,130 1010,148 L1010,175 L980,175 Z"
            fill="#0c0416"
            transform="rotate(-5, 995, 150)"
          />

          {/* Weathered Cross */}
          <g transform="translate(1080, 185) rotate(-4)" fill="#0a0312">
            <rect x="14" y="0" width="6" height="38" rx="1" />
            <rect x="4" y="10" width="26" height="6" rx="1" />
          </g>

          {/* Gnarled Willow / Spooky Tree on Right */}
          <g transform="translate(1240, 105) scale(0.7)" fill={themeConfig.graveTint}>
            <path d="M50,140 Q40,90 45,55 Q20,30 5,10 Q25,25 45,45 Q55,15 70,0 Q65,25 55,48 Q75,35 105,25 Q80,50 60,65 Q65,95 70,140 Z" />
            <path d="M45,45 Q15,40 -5,45 Q20,48 45,55 Z" />
            <path d="M55,65 Q90,65 115,75 Q85,72 60,78 Z" />
          </g>

          {/* Foreground Lower Rolling Fog Hill */}
          <path
            fill="#05020a"
            d="M0,256L60,250.7C120,245,240,235,360,234.7C480,235,600,245,720,256C840,267,960,277,1080,272C1200,267,1320,245,1380,234.7L1440,224L1440,320L0,320Z"
          />
        </svg>

        {/* 3. ROLLING GRAVEYARD MIST / FOG OVER THE TOMBS */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t ${themeConfig.mistColor} animate-purple-mist pointer-events-none`}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"
        />
      </div>
    </div>
  );
};
