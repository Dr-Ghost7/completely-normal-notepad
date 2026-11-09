'use client';

import React from 'react';

/**
 * Witch's Table Vials & Potions Clustered by the Spirit Jar.
 * - Flat bottoms on all vials (sits firmly on desk surface)
 * - Pure flat, solid gothic colors (no gradients)
 * - Flat-topped cork stoppers (crisp, flat, natural)
 * - 1 completely empty vial
 * - 1 glowing green poison vial
 * - 2 matched twin phials (identical size & shape)
 * - Heights (~138px - 170px) stand at roughly half the jar's height (~320px)
 */
export const SpecimenVials: React.FC = () => {
  return (
    <aside
      aria-label="Witch's Potions on Desk"
      className="fixed right-[12rem] sm:right-[14rem] lg:right-[15.5rem] xl:right-[17rem] 2xl:right-[18.5rem] bottom-4 z-30 pointer-events-auto select-none hidden md:flex items-end gap-2 sm:gap-2.5 opacity-90 hover:opacity-100 transition-opacity duration-300"
    >
      {/* ========================================================
          1. TWIN 1: MATCHED TALL SLENDER PHIAL (162px, EMPTY)
          Flat bottom, flat cork, completely empty glass
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Empty Glass Specimen Phial"
      >
        {/* Flat-Topped Cork Stopper */}
        <div className="w-3.5 h-3 bg-[#614125] border border-[#382312] shadow-xs" />
        {/* Glass Lip */}
        <div className="w-4.5 h-1 bg-white/20 border-x border-t border-white/40" />
        {/* Flat-Bottom Glass Tube Body (Empty) */}
        <div className="w-4 h-[148px] bg-stone-900/30 border border-stone-700/60 relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Subtle Vertical Glass Reflection */}
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/15 pointer-events-none" />
        </div>
      </div>

      {/* ========================================================
          2. TWIN 2: MATCHED TALL SLENDER PHIAL (162px, GLOWING GREEN POISON)
          Identical flat-bottom size/shape to Twin 1, filled with green poison
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Glowing Green Witch's Poison"
      >
        {/* Flat-Topped Cork Stopper */}
        <div className="w-3.5 h-3 bg-[#614125] border border-[#382312] shadow-xs" />
        {/* Glass Lip */}
        <div className="w-4.5 h-1 bg-white/20 border-x border-t border-white/40" />
        {/* Flat-Bottom Glass Tube Body */}
        <div className="w-4 h-[148px] bg-stone-900/40 border border-stone-700/60 relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Subtle Vertical Glass Reflection */}
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/15 z-10 pointer-events-none" />

          {/* Solid Glowing Green Poison (65% full) */}
          <div className="w-full h-[96px] bg-[#15803d] shadow-[0_0_14px_rgba(34,197,94,0.55)] relative flex flex-col justify-between">
            {/* Solid Bright Green Meniscus */}
            <div className="w-full h-1 bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BLACK WAX WITCH'S FLASK (146px, Flat Bottom, Congealed Blood)
          Flat bottom, flat cork, solid dark crimson
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Congealed Hemlock & Dried Blood"
      >
        {/* Flat-Topped Cork Stopper */}
        <div className="w-4 h-3 bg-[#52351c] border border-[#2e1c0d] shadow-xs" />
        {/* Flat Black Wax Ring */}
        <div className="w-5.5 h-1.5 bg-[#0f0914] border-y border-black" />
        {/* Flat-Bottom Flask Body */}
        <div className="w-6.5 h-[126px] bg-stone-900/50 border border-stone-700/70 relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Subtle Glass Reflection */}
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/12 z-10 pointer-events-none" />

          {/* Solid Dark Coagulated Blood / Hemlock (72% full) */}
          <div className="w-full h-[90px] bg-[#3a0808] relative flex flex-col justify-between">
            {/* Solid Dark Scab Meniscus */}
            <div className="w-full h-1 bg-[#5e1111]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          4. TALL WITCH'S APOTHECARY CYLINDER (170px, Flat Bottom, Murky Swamp Ichor)
          Tallest vessel, flat bottom, flat cork, solid murky sludge
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Murky Swamp Ichor"
      >
        {/* Flat-Topped Cork Stopper */}
        <div className="w-4 h-3.5 bg-[#614125] border border-[#382312] shadow-xs" />
        {/* Flat Jute Cord Band */}
        <div className="w-5.5 h-1.5 bg-[#3d2c18] border-y border-[#21170b]" />
        {/* Flat-Bottom Cylinder Body */}
        <div className="w-5 h-[158px] bg-stone-900/40 border border-stone-700/70 relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Subtle Glass Reflection */}
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/12 z-10 pointer-events-none" />

          {/* Solid Murky Swamp Sludge (58% full) */}
          <div className="w-full h-[92px] bg-[#1a2612] relative flex flex-col justify-between">
            {/* Solid Meniscus */}
            <div className="w-full h-1 bg-[#2e421f]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          5. SQUAT NIGHTSHADE PHIAL (138px, Flat Bottom, Blackened Violet)
          Flat bottom, flat cork, solid dark purple
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Blackened Nightshade Sludge"
      >
        {/* Flat-Topped Cork Stopper */}
        <div className="w-4 h-3 bg-[#52351c] border border-[#2e1c0d] shadow-xs" />
        {/* Flat Glass Neck */}
        <div className="w-3.5 h-3 bg-stone-900/60 border-x border-stone-700/70" />
        {/* Flat-Bottom Phial Body */}
        <div className="w-6 h-[116px] bg-stone-900/50 border border-stone-700/70 relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Subtle Glass Reflection */}
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/12 z-10 pointer-events-none" />

          {/* Solid Blackened Nightshade Sludge (45% full) */}
          <div className="w-full h-[52px] bg-[#220733] relative flex flex-col justify-between">
            {/* Solid Meniscus */}
            <div className="w-full h-1 bg-[#3f0f5e]" />
          </div>
        </div>
      </div>
    </aside>
  );
};
