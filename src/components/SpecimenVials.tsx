'use client';

import React from 'react';

export const SpecimenVials: React.FC = () => {
  return (
    <aside
      aria-label="Specimen Vials"
      className="fixed right-[12rem] sm:right-[14rem] lg:right-[15.5rem] xl:right-[17rem] 2xl:right-[18.5rem] bottom-4 z-30 pointer-events-auto select-none hidden md:flex items-end gap-2 sm:gap-2.5 opacity-90 hover:opacity-100 transition-opacity duration-300"
    >
      {/* Empty slender phial */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Empty Specimen Phial"
      >
        <div className="w-3.5 h-3 bg-[#614125] border border-[#382312] shadow-xs" />
        <div className="w-4.5 h-1 bg-white/20 border-x border-t border-white/40" />
        <div className="w-4 h-[148px] bg-stone-900/30 border border-stone-700/60 relative overflow-hidden flex flex-col justify-end shadow-md">
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/15 pointer-events-none" />
        </div>
      </div>

      {/* Poison phial */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Poison Phial"
      >
        <div className="w-3.5 h-3 bg-[#614125] border border-[#382312] shadow-xs" />
        <div className="w-4.5 h-1 bg-white/20 border-x border-t border-white/40" />
        <div className="w-4 h-[148px] bg-stone-900/40 border border-stone-700/60 relative overflow-hidden flex flex-col justify-end shadow-md">
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/15 z-10 pointer-events-none" />
          <div className="w-full h-[96px] bg-[#15803d] shadow-[0_0_14px_rgba(34,197,94,0.55)] relative flex flex-col justify-between">
            <div className="w-full h-1 bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
          </div>
        </div>
      </div>

      {/* Crimson flask */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Crimson Flask"
      >
        <div className="w-4 h-3 bg-[#52351c] border border-[#2e1c0d] shadow-xs" />
        <div className="w-5.5 h-1.5 bg-[#0f0914] border-y border-black" />
        <div className="w-6.5 h-[126px] bg-stone-900/50 border border-stone-700/70 relative overflow-hidden flex flex-col justify-end shadow-md">
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/12 z-10 pointer-events-none" />
          <div className="w-full h-[90px] bg-[#3a0808] relative flex flex-col justify-between">
            <div className="w-full h-1 bg-[#5e1111]" />
          </div>
        </div>
      </div>

      {/* Tall cylinder */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Apothecary Cylinder"
      >
        <div className="w-4 h-3.5 bg-[#614125] border border-[#382312] shadow-xs" />
        <div className="w-5.5 h-1.5 bg-[#3d2c18] border-y border-[#21170b]" />
        <div className="w-5 h-[158px] bg-stone-900/40 border border-stone-700/70 relative overflow-hidden flex flex-col justify-end shadow-md">
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/12 z-10 pointer-events-none" />
          <div className="w-full h-[92px] bg-[#1a2612] relative flex flex-col justify-between">
            <div className="w-full h-1 bg-[#2e421f]" />
          </div>
        </div>
      </div>

      {/* Nightshade phial */}
      <div
        className="flex flex-col items-center group cursor-pointer transition-transform duration-200 hover:-translate-y-1"
        title="Nightshade Phial"
      >
        <div className="w-4 h-3 bg-[#52351c] border border-[#2e1c0d] shadow-xs" />
        <div className="w-3.5 h-3 bg-stone-900/60 border-x border-stone-700/70" />
        <div className="w-6 h-[116px] bg-stone-900/50 border border-stone-700/70 relative overflow-hidden flex flex-col justify-end shadow-md">
          <div className="absolute left-0.5 top-0 bottom-0 w-0.5 bg-white/12 z-10 pointer-events-none" />
          <div className="w-full h-[52px] bg-[#220733] relative flex flex-col justify-between">
            <div className="w-full h-1 bg-[#3f0f5e]" />
          </div>
        </div>
      </div>
    </aside>
  );
};
