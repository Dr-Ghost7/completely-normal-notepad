'use client';

import React from 'react';

/**
 * Witch's Table Potions & Occult Concoctions Clustered by the Spirit Jar.
 * Designed with a dark, grimy, scary aesthetic fit for an occult altar:
 * - 2 Matched Twin Slender Phials (162px) containing Black Serpent Bile & Cloudy Bone Brine
 * - 1 Dark Antique Flask (146px) with melted black ritual sealing wax dripping down the neck
 * - 1 Tall Smoky Apothecary Bottle (170px) with stagnant murky swamp venom & jute wrapping
 * - 1 Sinister Bulbous Phial (138px) with bruised nightshade sludge & toxic vapor
 *
 * Heights (~138px - 170px) stand at roughly half the height of the spirit jar (~320px).
 */
export const SpecimenVials: React.FC = () => {
  return (
    <aside
      aria-label="Witch's Potions on Desk"
      className="fixed right-[12rem] sm:right-[14rem] lg:right-[15.5rem] xl:right-[17rem] 2xl:right-[18.5rem] bottom-4 z-30 pointer-events-auto select-none hidden md:flex items-end gap-2 sm:gap-2.5 opacity-85 hover:opacity-100 transition-opacity duration-300"
    >
      {/* ========================================================
          TWIN 1: MATCHED TALL SLENDER PHIAL (162px, Black Serpent Bile)
          (One of two matched twin bottles requested by user)
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Black Serpent Bile: Oily Pitched Venom"
      >
        {/* Charred Aged Cork */}
        <div className="w-3.5 h-3.5 bg-gradient-to-b from-[#422915] via-[#2d1b0c] to-[#170c04] border border-black rounded-t-xs shadow-sm" />
        {/* Tied Coarse Hemp Twine Ring */}
        <div className="w-4 h-1.5 bg-[#4a3622] border-y border-[#26190c] -mt-0.5 z-10" />
        {/* Dark Blown Glass Tube Body */}
        <div className="w-4 h-[148px] bg-gradient-to-b from-stone-900/40 via-black/30 to-black/70 border border-stone-800/60 rounded-b-full relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Faint Murky Glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-full pointer-events-none" />

          {/* Thick Pitch-Black Oily Bile (68% full) */}
          <div className="w-full h-[102px] bg-gradient-to-t from-black via-[#0d0f0a] to-[#1c2214] relative flex flex-col justify-between">
            {/* Dark Scum Meniscus */}
            <div className="w-full h-1 bg-[#28321e]/80 border-b border-black" />
          </div>
        </div>
      </div>

      {/* ========================================================
          TWIN 2: MATCHED TALL SLENDER PHIAL (162px, Cloudy Bone Brine)
          (Identical shape and size to Twin 1, matching bottle pair)
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Embalming Brine: Ghost Ash & Settled Bone Dust"
      >
        {/* Charred Aged Cork */}
        <div className="w-3.5 h-3.5 bg-gradient-to-b from-[#422915] via-[#2d1b0c] to-[#170c04] border border-black rounded-t-xs shadow-sm" />
        {/* Tied Coarse Hemp Twine Ring */}
        <div className="w-4 h-1.5 bg-[#4a3622] border-y border-[#26190c] -mt-0.5 z-10" />
        {/* Dark Blown Glass Tube Body */}
        <div className="w-4 h-[148px] bg-gradient-to-b from-stone-900/40 via-black/30 to-stone-950/70 border border-stone-800/60 rounded-b-full relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Faint Murky Glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-full pointer-events-none" />

          {/* Cloudy Sickly Pale Brine (55% full) */}
          <div className="w-full h-[82px] bg-gradient-to-t from-[#1a1c14] via-[#2e3324] to-[#454c37]/70 relative flex flex-col justify-between">
            {/* Murky Meniscus */}
            <div className="w-full h-1 bg-[#5b644a]/60 border-b border-[#24291b]" />

            {/* Heavy Pale Bone Sediment Settled at Bottom */}
            <div className="w-full h-4 bg-gradient-to-t from-[#525744]/70 to-transparent blur-[0.5px]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          3. BLACK WAX-SEALED WITCH'S FLASK (146px, Congealed Hemlock)
          Heavy dark bottle with cracked black ritual wax dripping down
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Congealed Hemlock Draught (Black Ritual Wax Seal)"
      >
        {/* Black Sealing Wax Cap with Dripping Runs */}
        <div className="relative w-6 h-5 flex flex-col items-center z-20">
          {/* Wax Cap Over Cork */}
          <div className="w-4.5 h-3 bg-[#0d0712] border border-black rounded-t-xs shadow-md" />
          {/* Wax Drips Running Down Shoulder */}
          <div className="w-6 flex justify-between px-0.5 -mt-0.5">
            <span className="w-1.5 h-3 bg-[#0d0712] rounded-b-full shadow-sm" />
            <span className="w-1 h-1.5 bg-[#0d0712] rounded-b-full" />
            <span className="w-1.5 h-3.5 bg-[#0d0712] rounded-b-full shadow-sm" />
          </div>
        </div>

        {/* Heavy Amber-Black Glass Body */}
        <div className="w-6.5 h-[126px] bg-gradient-to-b from-black/50 via-[#1f1008]/40 to-black/80 border border-stone-800/70 rounded-b-md rounded-t-xs -mt-1 relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Dark Glass Highlight */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/15 via-transparent to-transparent rounded-full pointer-events-none" />

          {/* Thick Congealed Dried Blood / Hemlock (75% full) */}
          <div className="w-full h-[94px] bg-gradient-to-t from-[#140202] via-[#290505] to-[#420a0a] relative">
            {/* Dark Scab Meniscus */}
            <div className="w-full h-1 bg-[#570d0d]/80 border-b border-[#140202]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          4. TALL SMOKY APOTHECARY BOTTLE (170px, Murky Bog Venom)
          Tallest witch's vessel with rough jute wrapping
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Distilled Bog Ichor: Murky Stagnant Swamp Venom"
      >
        {/* Rough Weathered Wood Stopper */}
        <div className="w-4 h-3.5 bg-gradient-to-b from-[#382618] via-[#24170d] to-[#120b06] border border-black rounded-t-xs shadow-sm" />
        {/* Coarse Frayed Jute Neck Wrap */}
        <div className="w-5.5 h-2 bg-[#3b2b1a] border-y border-[#1f150b] -mt-0.5 z-10 flex flex-col justify-evenly py-0.5">
          <div className="w-full h-[0.5px] bg-[#573f27]" />
        </div>
        {/* Tall Dark Smoky Glass Body */}
        <div className="w-5 h-[158px] bg-gradient-to-b from-stone-900/40 via-stone-950/60 to-black/80 border border-stone-800/70 rounded-b-sm relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Subtle Glare */}
          <div className="absolute left-0.5 top-1 bottom-1 w-0.5 bg-gradient-to-b from-white/15 via-white/5 to-transparent rounded-full pointer-events-none" />

          {/* Stagnant Murky Bog Venom (60% full) */}
          <div className="w-full h-[95px] bg-gradient-to-t from-[#050803] via-[#10190a] to-[#223314] relative">
            {/* Scummy Dark Meniscus */}
            <div className="w-full h-1 bg-[#2f451d]/70 border-b border-[#050803]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          5. SINISTER BULBOUS PHIAL (138px, Bruised Nightshade Fumes)
          Tilted dark potion vessel with murky toxic sludge and swirling vapor
          ======================================================== */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1 transform -rotate-3 origin-bottom"
        title="Nightshade Extract: Blackened Violet Sludge & Toxic Fumes"
      >
        {/* Dark Cork Stopper */}
        <div className="w-3.5 h-3 bg-gradient-to-b from-[#3d2315] to-[#1c0f08] border border-black rounded-t-xs shadow-sm" />
        {/* Slender Dark Neck */}
        <div className="w-3 h-8 bg-stone-900/50 border-x border-stone-800/70" />
        {/* Dark Bulbous Glass Belly */}
        <div className="w-8 h-[92px] bg-gradient-to-b from-stone-950/40 via-purple-950/20 to-black/80 border border-stone-800/70 rounded-full relative overflow-hidden flex flex-col justify-end shadow-md">
          {/* Subtle Curved Glare */}
          <div className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-white/15 via-transparent to-transparent pointer-events-none" />

          {/* Toxic Wisps Swirling in Upper Glass */}
          <div className="absolute top-2 bottom-[38px] inset-x-1 rounded-full bg-gradient-to-t from-purple-950/40 via-stone-900/20 to-transparent animate-pulse pointer-events-none" />

          {/* Bruised Nightshade Sludge in Lower Belly (42% full) */}
          <div className="w-full h-[38px] bg-gradient-to-t from-black via-[#160421] to-[#2c0942] relative rounded-b-full">
            {/* Meniscus */}
            <div className="w-full h-1 bg-[#47126b]/70 border-b border-black" />
          </div>
        </div>
      </div>
    </aside>
  );
};
