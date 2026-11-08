'use client';

import React from 'react';

/**
 * Specimen Vials Clustered near the Spirit Punishment Jar.
 * Atmospheric environmental storytelling:
 * - 1 sealed with dark spectral fluid
 * - 1 knocked over on its side with cork popped
 * - 1 shattered, empty glass tube (an escaped entity!)
 * Ghost collision is disabled per user request: "Ghosts don't do anything to that."
 */
export const SpecimenVials: React.FC = () => {
  return (
    <div
      aria-label="Specimen Vials on Desk"
      className="fixed right-48 sm:right-56 bottom-4 z-20 pointer-events-none select-none hidden md:flex items-end gap-2.5 opacity-75 hover:opacity-95 transition-opacity duration-300"
    >
      {/* 1. UPRIGHT VIAL (Sealed with dark purple glowing residue) */}
      <div className="flex flex-col items-center">
        {/* Cork Stopper */}
        <div className="w-2.5 h-2 bg-[#6b4423] border border-[#3e2410] rounded-t-xs" />
        {/* Glass Lip */}
        <div className="w-3.5 h-1 bg-white/20 border-x border-t border-white/40 rounded-t-sm" />
        {/* Glass Tube */}
        <div className="w-3 h-14 bg-gradient-to-b from-white/10 via-white/5 to-purple-950/40 border border-white/30 rounded-b-md relative overflow-hidden flex flex-col justify-end">
          {/* Swirling Spectral Fluid */}
          <div className="w-full h-8 bg-gradient-to-t from-purple-800/60 via-rose-900/40 to-transparent relative">
            {/* Fluid meniscus */}
            <div className="w-full h-1 bg-purple-400/40 blur-[0.5px]" />
          </div>
          {/* Glass specular reflection */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-white/30 rounded-full" />
        </div>
      </div>

      {/* 2. KNOCKED OVER VIAL (Lying on side, cork popped) */}
      <div className="relative flex items-center mb-0.5">
        {/* Popped Cork on Desk */}
        <div className="w-2.5 h-1.5 bg-[#6b4423] border border-[#3e2410] rounded-xs -mr-0.5 z-10 transform -rotate-12" />
        {/* Horizontal Fallen Glass Tube */}
        <div className="w-13 h-3 bg-gradient-to-r from-white/10 via-white/5 to-purple-950/30 border border-white/25 rounded-r-md relative flex items-center">
          {/* Remnant fluid stain in bottom of tube */}
          <div className="w-7 h-1.5 bg-rose-950/40 rounded-full ml-1 blur-[0.5px]" />
          {/* Small puddle leaking from mouth */}
          <div className="absolute -left-3 top-2.5 w-5 h-1 rounded-full bg-purple-950/50 blur-[0.5px]" />
        </div>
      </div>

      {/* 3. SHATTERED EMPTY VIAL (Broken jagged neck, escaped spirit!) */}
      <div className="flex flex-col items-center">
        {/* Jagged Broken Glass Tube (Empty) */}
        <div className="w-3 h-7 bg-white/5 border border-white/25 border-t-0 rounded-b-md relative overflow-hidden flex flex-col justify-between">
          {/* Jagged shattered top rim */}
          <div className="w-full flex justify-between">
            <span className="w-1 h-1.5 bg-white/30 clip-polygon" />
            <span className="w-1 h-0.5 bg-white/20" />
            <span className="w-0.5 h-2 bg-white/35" />
          </div>
          {/* Glass glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-white/20 rounded-full" />
        </div>
        {/* Broken glass shards scattered on desk floor */}
        <div className="w-7 h-1 relative flex items-center justify-between mt-0.5">
          <div className="w-1.5 h-1 bg-white/30 rounded-xs transform rotate-45" />
          <div className="w-1 h-0.5 bg-white/25 rounded-xs transform -rotate-25" />
          <div className="w-1.5 h-0.5 bg-white/35 rounded-xs transform rotate-15" />
        </div>
      </div>
    </div>
  );
};
