'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';
import { Sparkles, Wand2, RotateCcw } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  color: string;
  border: string;
  textColor: string;
  width: number;
  height: number;
}

const DEFAULT_BOOKS: BookItem[] = [
  {
    id: 'book-1',
    title: 'Grimoire of Regrets',
    color: 'from-amber-950 via-rose-950 to-stone-900',
    border: 'border-rose-900/60',
    textColor: 'text-amber-200/90',
    width: 140,
    height: 24,
  },
  {
    id: 'book-2',
    title: 'Spectral Lexicon',
    color: 'from-purple-950 via-indigo-950 to-stone-900',
    border: 'border-purple-800/60',
    textColor: 'text-purple-200/90',
    width: 155,
    height: 26,
  },
  {
    id: 'book-3',
    title: 'Ars Daemonica &bull; Vol. I',
    color: 'from-emerald-950 via-teal-950 to-stone-900',
    border: 'border-emerald-800/60',
    textColor: 'text-emerald-200/90',
    width: 170,
    height: 28,
  },
];

interface ArtifactVariant {
  id: string;
  name: string;
  type: 'plate' | 'goblet' | 'mirror';
  color: string;
  glow: string;
  border: string;
  shardColors: string[];
}

const VARIANTS: ArtifactVariant[] = [
  {
    id: 'kintsugi-plate',
    name: 'Celestial Porcelain Plate',
    type: 'plate',
    color: 'bg-gradient-to-br from-stone-100 via-purple-100 to-amber-50',
    glow: 'rgba(251, 191, 36, 0.4)',
    border: 'border-amber-400/70',
    shardColors: ['#f8fafc', '#fef08a', '#f1f5f9', '#fed7aa'],
  },
  {
    id: 'alchemist-goblet',
    name: 'Emerald Alchemist Glass',
    type: 'goblet',
    color: 'bg-gradient-to-b from-emerald-400/20 via-emerald-600/40 to-teal-950/80',
    glow: 'rgba(52, 211, 153, 0.5)',
    border: 'border-emerald-400/80',
    shardColors: ['#34d399', '#059669', '#10b981', '#065f46'],
  },
  {
    id: 'obsidian-mirror',
    name: 'Obsidian Scrying Dish',
    type: 'mirror',
    color: 'bg-gradient-to-tr from-black via-purple-950 to-neutral-900',
    glow: 'rgba(192, 132, 252, 0.5)',
    border: 'border-purple-500/70',
    shardColors: ['#1e1b4b', '#3b0764', '#0f172a', '#2e1065'],
  },
];

export const HauntedShelves: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);
  const topShelfRef = useRef<HTMLDivElement>(null);
  const bottomShelfRef = useRef<HTMLDivElement>(null);

  // --- TOP SHELF: BREAKABLE ARTIFACT STATE ---
  const [variantIndex, setVariantIndex] = useState(0);
  const [isBroken, setIsBroken] = useState(false);
  const [repairCount, setRepairCount] = useState(0);
  const currentArtifact = VARIANTS[variantIndex];

  // --- BOTTOM SHELF: GOTHIC BOOKS STATE ---
  const [isToppled, setIsToppled] = useState(false);
  const [offsets, setOffsets] = useState<{ [id: string]: { x: number; y: number; rot: number } }>({
    'book-1': { x: 0, y: 0, rot: 0 },
    'book-2': { x: 0, y: 0, rot: 0 },
    'book-3': { x: 0, y: 0, rot: 0 },
  });
  const [draggingBookId, setDraggingBookId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initX: number; initY: number }>({
    mouseX: 0,
    mouseY: 0,
    initX: 0,
    initY: 0,
  });

  // Ghost proximity & collision detection for shelves
  useEffect(() => {
    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;

      // 1. Check top shelf collision (breakable glass/plate)
      if (!isBroken && topShelfRef.current) {
        const topRect = topShelfRef.current.getBoundingClientRect();
        const topCenterX = topRect.left + topRect.width / 2;
        const topCenterY = topRect.top + topRect.height / 2;
        const distTop = Math.hypot(ghost.x - topCenterX, ghost.y - topCenterY);

        if (distTop < 75) {
          setIsBroken(true);
          if (soundEnabled) ghostAudio.playGlassShatter(volume);
        }
      }

      // 2. Check bottom shelf collision (books topple)
      if (!isToppled && bottomShelfRef.current) {
        const botRect = bottomShelfRef.current.getBoundingClientRect();
        const botCenterX = botRect.left + botRect.width / 2;
        const botCenterY = botRect.top + botRect.height / 2;
        const distBot = Math.hypot(ghost.x - botCenterX, ghost.y - botCenterY);

        if (distBot < 95 && Math.hypot(ghost.vx, ghost.vy) > 0.7) {
          setIsToppled(true);
          if (soundEnabled) ghostAudio.playBookThud(volume);

          setOffsets({
            'book-1': { x: 24, y: -6, rot: 12 },
            'book-2': { x: -18, y: 5, rot: -8 },
            'book-3': { x: 10, y: 3, rot: 5 },
          });
        }
      }
    }
  }, [ghosts, isBroken, isToppled, soundEnabled, volume]);

  // Restore Artifact (cycles variants)
  const handleRestoreArtifact = () => {
    setIsBroken(false);
    setRepairCount((c) => c + 1);
    setVariantIndex((prev) => (prev + 1) % VARIANTS.length);
    if (soundEnabled) ghostAudio.playMendChime(volume);
  };

  const handleManualBreak = () => {
    if (!isBroken) {
      setIsBroken(true);
      if (soundEnabled) ghostAudio.playGlassShatter(volume);
    }
  };

  // Restore Books
  const handleRestoreBooks = () => {
    setIsToppled(false);
    setOffsets({
      'book-1': { x: 0, y: 0, rot: 0 },
      'book-2': { x: 0, y: 0, rot: 0 },
      'book-3': { x: 0, y: 0, rot: 0 },
    });
    if (soundEnabled) ghostAudio.playMendChime(volume);
  };

  // Drag books handlers
  const handlePointerDown = (e: React.PointerEvent, bookId: string) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingBookId(bookId);
    const curr = offsets[bookId] || { x: 0, y: 0, rot: 0 };
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initX: curr.x,
      initY: curr.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingBookId) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    setOffsets((prev) => ({
      ...prev,
      [draggingBookId]: {
        x: Math.max(-60, Math.min(60, dragStartRef.current.initX + dx)),
        y: Math.max(-25, Math.min(25, dragStartRef.current.initY + dy)),
        rot: Math.max(-20, Math.min(20, (dragStartRef.current.initX + dx) * 0.3)),
      },
    }));
  };

  const handlePointerUp = () => {
    if (!draggingBookId) return;
    setDraggingBookId(null);

    // If dragged close to shelf rest position, snap to clean stack
    const curr = offsets[draggingBookId];
    if (curr && Math.hypot(curr.x, curr.y) < 14) {
      setOffsets((prev) => ({
        ...prev,
        [draggingBookId]: { x: 0, y: 0, rot: 0 },
      }));

      const allAligned = Object.entries(offsets).every(([id, val]) =>
        id === draggingBookId ? true : Math.hypot(val.x, val.y) < 6
      );
      if (allAligned) {
        setIsToppled(false);
        if (soundEnabled) ghostAudio.playMendChime(volume);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      aria-label="Black-line Wall Shelves"
      className="fixed right-6 sm:right-8 lg:right-10 top-24 z-30 pointer-events-auto select-none hidden md:flex flex-col items-center"
      style={{ width: '240px', height: '330px' }}
    >
      {/* ========================================================
          MINIMALIST BLACK-LINE WALL SHELF STRUCTURE
          "Black lines only, no design and stuff"
          Zero ornate curlicues, zero woodgrain, pure graphic black lines.
          ======================================================== */}
      <svg
        viewBox="0 0 240 330"
        className="w-full h-full pointer-events-none absolute inset-0 z-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle 1px crisp outline so pitch-black lines stand out against the dark purple void */}
          <filter id="crispBlackLine" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="rgba(255,255,255,0.12)" />
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="rgba(0,0,0,0.85)" />
          </filter>
        </defs>

        <g filter="url(#crispBlackLine)">
          {/* --- VERTICAL MOUNTING LINES (Left & Right Rails) --- */}
          <line x1="28" y1="14" x2="28" y2="316" stroke="#000000" strokeWidth="3" strokeLinecap="square" />
          <circle cx="28" cy="14" r="2.5" fill="#000000" />
          <circle cx="28" cy="316" r="2.5" fill="#000000" />

          <line x1="212" y1="14" x2="212" y2="316" stroke="#000000" strokeWidth="3" strokeLinecap="square" />
          <circle cx="212" cy="14" r="2.5" fill="#000000" />
          <circle cx="212" cy="316" r="2.5" fill="#000000" />

          {/* --- TOP SHELF: CLEAN HORIZONTAL BLACK LINE (Plates/Glasses) --- */}
          <line x1="12" y1="125" x2="228" y2="125" stroke="#000000" strokeWidth="4" strokeLinecap="square" />
          {/* Minimal Diagonal Black Line Brackets */}
          <line x1="28" y1="125" x2="28" y2="152" stroke="#000000" strokeWidth="2.5" />
          <line x1="28" y1="152" x2="55" y2="125" stroke="#000000" strokeWidth="2.5" />
          <line x1="212" y1="125" x2="212" y2="152" stroke="#000000" strokeWidth="2.5" />
          <line x1="212" y1="152" x2="185" y2="125" stroke="#000000" strokeWidth="2.5" />

          {/* --- BOTTOM SHELF: CLEAN HORIZONTAL BLACK LINE (Books) --- */}
          <line x1="12" y1="275" x2="228" y2="275" stroke="#000000" strokeWidth="4" strokeLinecap="square" />
          {/* Minimal Diagonal Black Line Brackets */}
          <line x1="28" y1="275" x2="28" y2="302" stroke="#000000" strokeWidth="2.5" />
          <line x1="28" y1="302" x2="55" y2="275" stroke="#000000" strokeWidth="2.5" />
          <line x1="212" y1="275" x2="212" y2="302" stroke="#000000" strokeWidth="2.5" />
          <line x1="212" y1="302" x2="185" y2="275" stroke="#000000" strokeWidth="2.5" />
        </g>
      </svg>

      {/* ========================================================
          TOP SHELF CONTENT: PLATES / GLASSES / ARTIFACTS
          Rests on top horizontal line at y=125px
          ======================================================== */}
      <div
        ref={topShelfRef}
        style={{ top: '22px' }}
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        {/* Mend / Restore Button if Broken */}
        {isBroken && (
          <button
            type="button"
            onClick={handleRestoreArtifact}
            className="mb-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-700 via-rose-700 to-purple-800 text-white font-serif text-[10px] font-medium shadow-xl border border-amber-400/80 cursor-pointer flex items-center gap-1.5 animate-bounce hover:scale-105 transition-transform"
            title="Click to magically mend artifact with golden lacquer"
          >
            <Wand2 className="w-3 h-3 text-amber-300" />
            <span>Mend ({repairCount > 0 ? `Restored ×${repairCount}` : 'Restore'})</span>
          </button>
        )}

        {/* The Physical Artifact Sitting on the Top Shelf Line */}
        <div
          onClick={handleManualBreak}
          title={isBroken ? 'Shattered artifact on black shelf' : `${currentArtifact.name} (Click to break or ghosts may shatter it!)`}
          className="relative cursor-pointer transition-transform hover:scale-105"
        >
          {!isBroken ? (
            /* Intact Artifact State */
            <div className="relative flex flex-col items-center">
              {currentArtifact.type === 'plate' && (
                <div
                  className={`w-20 h-20 rounded-full border-2 ${currentArtifact.border} ${currentArtifact.color} shadow-lg relative overflow-hidden flex items-center justify-center`}
                  style={{ boxShadow: `0 0 16px ${currentArtifact.glow}` }}
                >
                  <div className="w-13 h-13 rounded-full border border-purple-400/30 bg-black/10 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400/70" />
                  </div>
                </div>
              )}

              {currentArtifact.type === 'goblet' && (
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-16 rounded-b-2xl border-2 ${currentArtifact.border} ${currentArtifact.color} shadow-lg relative overflow-hidden flex items-center justify-center`}
                    style={{ boxShadow: `0 0 16px ${currentArtifact.glow}` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-400/30 blur-[2px]" />
                  </div>
                  <div className="w-2.5 h-5 bg-neutral-900 border-x border-neutral-700" />
                  <div className="w-12 h-2 rounded-full bg-neutral-900 border border-neutral-700" />
                </div>
              )}

              {currentArtifact.type === 'mirror' && (
                <div
                  className={`w-18 h-18 rounded-full border-2 ${currentArtifact.border} ${currentArtifact.color} shadow-xl relative overflow-hidden flex items-center justify-center`}
                  style={{ boxShadow: `0 0 18px ${currentArtifact.glow}` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-300/10 to-transparent" />
                  <div className="w-11 h-11 rounded-full border border-purple-500/40 bg-purple-950/40" />
                </div>
              )}
            </div>
          ) : (
            /* Shattered Shards Scattered on Shelf Line */
            <div className="w-22 h-14 relative flex items-center justify-center">
              <div
                className="absolute w-4 h-2.5 rounded-sm transform -rotate-45 -translate-x-5 translate-y-3"
                style={{ backgroundColor: currentArtifact.shardColors[0] }}
              />
              <div
                className="absolute w-5 h-3 rounded-sm transform rotate-18 translate-x-3 translate-y-2"
                style={{ backgroundColor: currentArtifact.shardColors[1] }}
              />
              <div
                className="absolute w-3.5 h-2 rounded-sm transform rotate-40 -translate-x-1 -translate-y-1"
                style={{ backgroundColor: currentArtifact.shardColors[2] }}
              />
              <div
                className="absolute w-3 h-2 rounded-sm transform -rotate-12 translate-x-6 translate-y-4"
                style={{ backgroundColor: currentArtifact.shardColors[3] }}
              />
              <div
                className="absolute w-2 h-1.5 rounded-sm transform rotate-75 -translate-x-7 translate-y-4"
                style={{ backgroundColor: currentArtifact.shardColors[0] }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          BOTTOM SHELF CONTENT: GOTHIC BOOKS
          Rests on bottom horizontal line at y=275px
          ======================================================== */}
      <div
        ref={bottomShelfRef}
        style={{ top: '185px' }}
        className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        {/* Restack quick button if toppled */}
        {isToppled && (
          <button
            type="button"
            onClick={handleRestoreBooks}
            className="mb-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/95 hover:bg-rose-950 text-purple-200 hover:text-white border border-purple-700/60 shadow-xl flex items-center gap-1.5 text-[10px] font-serif cursor-pointer transition-all animate-bounce hover:scale-105"
            title="Restack toppled grimoires onto shelf"
          >
            <RotateCcw className="w-3 h-3 text-purple-300" />
            <span>Restack Books</span>
          </button>
        )}

        {/* The Stack of Sideways Leather Books on the Shelf */}
        <div className="flex flex-col items-center relative py-1">
          {DEFAULT_BOOKS.map((book) => {
            const off = offsets[book.id] || { x: 0, y: 0, rot: 0 };
            const isDragging = draggingBookId === book.id;

            return (
              <div
                key={book.id}
                onPointerDown={(e) => handlePointerDown(e, book.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  width: `${book.width}px`,
                  height: `${book.height}px`,
                  transform: `translate3d(${off.x}px, ${off.y}px, 0) rotate(${off.rot}deg)`,
                  touchAction: 'none',
                }}
                title={isToppled ? 'Drag book to restack or click button' : 'Antique Grimoire (Ghosts may knock it over!)'}
                className={`relative -my-0.5 rounded bg-gradient-to-r ${book.color} border ${book.border} shadow-md flex items-center justify-between px-3 cursor-grab active:cursor-grabbing transition-transform ${
                  isDragging ? 'z-50 shadow-2xl scale-105 ring-2 ring-purple-400' : 'z-20'
                }`}
              >
                {/* Ribbon Detail */}
                <div className="w-1.5 h-full bg-amber-500/40 rounded-sm" />

                {/* Embossed Gold Spine Title */}
                <span
                  dangerouslySetInnerHTML={{ __html: book.title }}
                  className={`text-[8.5px] font-gothic tracking-wider truncate font-semibold uppercase ${book.textColor}`}
                />

                {/* Edge page gilding lines */}
                <div className="w-2 h-full flex flex-col justify-center gap-0.5 opacity-40">
                  <div className="h-0.5 w-full bg-amber-200" />
                  <div className="h-0.5 w-full bg-amber-200" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
