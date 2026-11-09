'use client';

import React from 'react';

/**
 * Specimen Vials & Apothecary Bottles Clustered by the Spirit Jar.
 * Features 5 distinct vessels with unique shapes, stoppers, and glowing occult liquids:
 * 1. Slender Specimen Tube (162px) - Bioluminescent Emerald Ectoplasm
 * 2. Dropper Tincture Bottle (142px) - Deep Ruby Bloodroot Elixir
 * 3. Tallest Graduated Cylinder (172px) - Liquid Phosphor with Volume Marks
 * 4. Faceted Apothecary Flagon (152px) - Deep Cobalt Nightshade Extract
 * 5. Round-Bellied Phial (136px) - Amethyst Mist & Swirling Spirit Vapor
 *
 * Heights (~136px - 172px) stand at roughly half the height of the spirit jar (~320px).
 */
export const SpecimenVials: React.FC = () => {
  return (
    <aside
      aria-label="Specimen Vials on Desk"
      className="fixed right-[12rem] sm:right-[14rem] lg:right-[15.5rem] xl:right-[17rem] 2xl:right-[18.5rem] bottom-4 z-30 pointer-events-auto select-none hidden md:flex items-end gap-2 sm:gap-2.5 opacity-85 hover:opacity-100 transition-opacity duration-300"
    >
      {/* ========================================================
          1. SLENDER SPECIMEN TUBE (162px tall, Emerald Ectoplasm)
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Specimen #07: Bioluminescent Ectoplasm"
      >
        {/* Cork Stopper */}
        <div className="w-3.5 h-3.5 bg-gradient-to-b from-[#80532d] via-[#633e1e] to-[#42270f] border border-[#2d1809] rounded-t-xs shadow-sm" />
        {/* Glass Lip */}
        <div className="w-4.5 h-1.5 bg-white/20 border-x border-t border-white/40 rounded-t-xs backdrop-blur-xs" />
        {/* Glass Tube Body */}
        <div className="w-4 h-[148px] bg-gradient-to-b from-white/12 via-white/5 to-emerald-950/40 border border-white/30 rounded-b-full relative overflow-hidden flex flex-col justify-end shadow-sm">
          {/* Specular Glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/45 via-white/15 to-transparent rounded-full pointer-events-none" />

          {/* Glowing Emerald Fluid (65% full) */}
          <div className="w-full h-[98px] bg-gradient-to-t from-emerald-950/90 via-emerald-600/65 to-emerald-400/40 relative flex flex-col justify-between">
            {/* Glowing Surface Meniscus */}
            <div className="w-full h-1 bg-emerald-300/60 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />

            {/* Rising Micro-bubbles */}
            <div className="relative w-full h-full overflow-hidden pointer-events-none">
              <span className="absolute left-1 bottom-4 w-1 h-1 rounded-full bg-emerald-200/60 animate-pulse" />
              <span className="absolute right-1 bottom-10 w-0.5 h-0.5 rounded-full bg-emerald-100/70" />
              <span className="absolute left-1.5 bottom-16 w-0.5 h-0.5 rounded-full bg-emerald-200/50" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. DROPPER TINCTURE BOTTLE (142px tall, Ruby Bloodroot)
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Tincture of Bloodroot (Dropper Pipette Inside)"
      >
        {/* Rubber Dropper Bulb */}
        <div className="w-3.5 h-4 bg-gradient-to-b from-[#241c2b] to-[#120c18] rounded-t-full border border-black shadow-inner" />
        {/* Fluted Dark Collar */}
        <div className="w-6 h-2.5 bg-gradient-to-b from-[#4a3424] to-[#2e1f13] border border-[#1b1109] rounded-xs shadow-xs" />
        {/* Glass Bottle Body */}
        <div className="w-6.5 h-[126px] bg-gradient-to-b from-white/10 via-white/5 to-rose-950/40 border border-white/30 rounded-b-md rounded-t-xs relative overflow-hidden flex flex-col justify-end shadow-sm">
          {/* Glass Pipette dipped down into the fluid */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-4 w-1 bg-white/25 border-x border-white/30 pointer-events-none" />

          {/* Specular Glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full pointer-events-none" />

          {/* Ruby Red Fluid (72% full) */}
          <div className="w-full h-[90px] bg-gradient-to-t from-[#450a0a]/95 via-[#991b1b]/70 to-[#ef4444]/40 relative">
            {/* Glowing Meniscus */}
            <div className="w-full h-1 bg-rose-300/60 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          3. TALLEST GRADUATED SPECIMEN CYLINDER (172px, Phosphor)
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Graduated Laboratory Cylinder: Liquid Phosphor"
      >
        {/* Cork Stopper */}
        <div className="w-4 h-3.5 bg-gradient-to-b from-[#875932] via-[#694222] to-[#472a12] border border-[#311b0a] rounded-t-xs shadow-sm" />
        {/* Twine Neck Wrap */}
        <div className="w-5.5 h-1.5 bg-[#856139] border-y border-[#4f351b] -mt-0.5 z-10 rounded-full" />
        {/* Tall Cylinder Body */}
        <div className="w-5 h-[158px] bg-gradient-to-b from-white/12 via-white/5 to-amber-950/40 border border-white/30 rounded-b-sm relative overflow-hidden flex flex-col justify-end shadow-sm">
          {/* Volumetric Graduations (Tick Marks) */}
          <div className="absolute right-0.5 top-2 bottom-4 w-2 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="w-2 h-[1px] bg-white" />
            <div className="w-1.5 h-[1px] bg-white" />
            <div className="w-2 h-[1px] bg-white" />
            <div className="w-1.5 h-[1px] bg-white" />
            <div className="w-2 h-[1px] bg-white" />
            <div className="w-1.5 h-[1px] bg-white" />
            <div className="w-2 h-[1px] bg-white" />
            <div className="w-1.5 h-[1px] bg-white" />
            <div className="w-2 h-[1px] bg-white" />
          </div>

          {/* Specular Glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/45 via-white/15 to-transparent rounded-full pointer-events-none" />

          {/* Ambient Phosphor Vapor in Upper Chamber */}
          <div className="absolute top-0 bottom-[84px] inset-x-0 bg-gradient-to-b from-amber-400/5 via-amber-300/15 to-transparent pointer-events-none" />

          {/* Liquid Phosphor (52% full) */}
          <div className="w-full h-[84px] bg-gradient-to-t from-[#78350f]/95 via-[#d97706]/70 to-[#fbbf24]/45 relative">
            {/* Bright Golden Meniscus */}
            <div className="w-full h-1 bg-amber-200/70 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          4. FACETED APOTHECARY FLAGON (152px tall, Cobalt Nightshade)
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Faceted Flagon: Essence of Nightshade"
      >
        {/* Octagonal Dark Stopper */}
        <div className="w-5 h-3.5 bg-gradient-to-b from-[#2e2338] to-[#150f1b] border border-black rounded-xs shadow-md" />
        {/* Glass Neck */}
        <div className="w-4 h-2 bg-white/15 border-x border-white/30" />
        {/* Hexagonal Flagon Body */}
        <div className="w-7 h-[138px] bg-gradient-to-b from-white/10 via-white/5 to-blue-950/40 border border-white/30 rounded-b-md rounded-t-sm relative overflow-hidden flex flex-col justify-end shadow-sm">
          {/* Vertical Beveled Facet Lines */}
          <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-white/15 pointer-events-none" />
          <div className="absolute right-2 top-2 bottom-2 w-[1px] bg-white/15 pointer-events-none" />

          {/* Specular Glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-full pointer-events-none" />

          {/* Deep Cobalt Indigo Fluid (85% full) */}
          <div className="w-full h-[116px] bg-gradient-to-t from-[#020617]/95 via-[#1e3a8a]/75 to-[#3b82f6]/40 relative">
            {/* Blue Meniscus */}
            <div className="w-full h-1 bg-blue-300/60 shadow-[0_0_6px_rgba(96,165,250,0.5)]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          5. ROUND-BELLIED PHIAL (136px tall, Amethyst Spirit Mist)
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1 transform -rotate-2 origin-bottom"
        title="Spherical Phial: Volatile Spirit Vapor"
      >
        {/* Tapered Cork Stopper */}
        <div className="w-3.5 h-3 bg-gradient-to-b from-[#7a4c25] to-[#452710] border border-[#2b1708] rounded-t-xs shadow-sm" />
        {/* Slender Glass Neck */}
        <div className="w-3 h-8 bg-white/12 border-x border-white/30 backdrop-blur-xs" />
        {/* Bulbous Spherical Glass Belly */}
        <div className="w-8 h-[90px] bg-gradient-to-b from-white/10 via-white/5 to-purple-950/40 border border-white/30 rounded-full relative overflow-hidden flex flex-col justify-end shadow-sm">
          {/* Specular Glare Curve */}
          <div className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

          {/* Swirling Ghostly Vapor in Bulb Upper Half */}
          <div className="absolute top-2 bottom-[38px] inset-x-1.5 rounded-full bg-gradient-to-t from-purple-500/25 via-rose-500/10 to-transparent animate-pulse pointer-events-none" />

          {/* Amethyst Violet Fluid in Lower Belly (42% full) */}
          <div className="w-full h-[38px] bg-gradient-to-t from-[#2e1065]/95 via-[#6b21a8]/70 to-[#c084fc]/40 relative rounded-b-full">
            {/* Violet Meniscus */}
            <div className="w-full h-1 bg-purple-300/60 shadow-[0_0_6px_rgba(192,132,252,0.5)]" />
          </div>
        </div>
      </div>
    </aside>
  );
};
