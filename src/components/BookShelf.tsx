'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';
import { RotateCcw } from 'lucide-react';

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
    border: 'border-rose-900/80',
    textColor: 'text-amber-200',
    width: 230,
    height: 36,
  },
  {
    id: 'book-2',
    title: 'Spectral Lexicon &bull; Occult Tome',
    color: 'from-purple-950 via-indigo-950 to-stone-900',
    border: 'border-purple-800/80',
    textColor: 'text-purple-200',
    width: 250,
    height: 40,
  },
  {
    id: 'book-3',
    title: 'Ars Daemonica &bull; Compendium I',
    color: 'from-emerald-950 via-teal-950 to-stone-900',
    border: 'border-emerald-800/80',
    textColor: 'text-emerald-200',
    width: 270,
    height: 44,
  },
];

export const BookShelf: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

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

  // Monitor ghost collision to knock books over
  useEffect(() => {
    if (isToppled || !stackRef.current) return;

    const rect = stackRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // Fast ghost colliding knocks books over
      if (dist < 130 && Math.hypot(ghost.vx, ghost.vy) > 0.65) {
        setIsToppled(true);
        if (soundEnabled) ghostAudio.playBookThud(volume);

        setOffsets({
          'book-1': { x: 32, y: -8, rot: 13 },
          'book-2': { x: -24, y: 6, rot: -9 },
          'book-3': { x: 14, y: 4, rot: 6 },
        });
        break;
      }
    }
  }, [ghosts, isToppled, soundEnabled, volume]);

  const handleRestoreStack = () => {
    setIsToppled(false);
    setOffsets({
      'book-1': { x: 0, y: 0, rot: 0 },
      'book-2': { x: 0, y: 0, rot: 0 },
      'book-3': { x: 0, y: 0, rot: 0 },
    });
    if (soundEnabled) ghostAudio.playMendChime(volume);
  };

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
        x: Math.max(-70, Math.min(70, dragStartRef.current.initX + dx)),
        y: Math.max(-30, Math.min(30, dragStartRef.current.initY + dy)),
        rot: Math.max(-22, Math.min(22, (dragStartRef.current.initX + dx) * 0.25)),
      },
    }));
  };

  const handlePointerUp = () => {
    if (!draggingBookId) return;
    setDraggingBookId(null);

    const curr = offsets[draggingBookId];
    if (curr && Math.hypot(curr.x, curr.y) < 18) {
      setOffsets((prev) => ({
        ...prev,
        [draggingBookId]: { x: 0, y: 0, rot: 0 },
      }));

      const allAligned = Object.entries(offsets).every(([id, val]) =>
        id === draggingBookId ? true : Math.hypot(val.x, val.y) < 7
      );
      if (allAligned) {
        setIsToppled(false);
        if (soundEnabled) ghostAudio.playMendChime(volume);
      }
    }
  };

  return (
    <aside
      ref={containerRef}
      aria-label="Wall Shelf with Books"
      className="fixed right-4 sm:right-6 lg:right-10 top-18 sm:top-22 z-20 pointer-events-auto select-none hidden lg:flex flex-col items-center"
      style={{ width: '300px' }}
    >
      {/* Restack quick button if toppled */}
      {isToppled && (
        <button
          type="button"
          onClick={handleRestoreStack}
          className="mb-2 px-3 py-1 rounded-full bg-purple-950 hover:bg-rose-950 text-purple-200 hover:text-white border border-purple-600 shadow-2xl flex items-center gap-1.5 text-xs font-serif cursor-pointer transition-all animate-bounce hover:scale-105"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
          <span>Restack Grimoires</span>
        </button>
      )}

      {/* ========================================================
          ENLARGED STACK OF GOTHIC LEATHER BOOKS
          Rests firmly on top of the solid black shelf plank
          ======================================================== */}
      <div
        ref={stackRef}
        className="flex flex-col items-center relative py-1"
        style={{ minHeight: '124px', justifyContent: 'flex-end' }}
      >
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
              title={isToppled ? 'Drag book to restack or click button' : 'Antique Grimoire (Ghosts might knock it over!)'}
              className={`relative -my-0.5 rounded bg-gradient-to-r ${book.color} border ${book.border} shadow-xl flex items-center justify-between px-3.5 cursor-grab active:cursor-grabbing transition-transform ${
                isDragging ? 'z-50 shadow-2xl scale-105 ring-2 ring-purple-400' : 'z-20'
              }`}
            >
              {/* Antique Spine Ribs / Raised Bands */}
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-full bg-amber-500/50 rounded-sm" />
                <div className="w-0.5 h-full bg-black/40" />
              </div>

              {/* Embossed Gold Spine Title */}
              <span
                dangerouslySetInnerHTML={{ __html: book.title }}
                className={`text-[11px] font-gothic tracking-wider truncate font-semibold uppercase ${book.textColor}`}
              />

              {/* Edge page gilding lines */}
              <div className="w-3 h-full flex flex-col justify-center gap-1 opacity-50">
                <div className="h-0.5 w-full bg-amber-200" />
                <div className="h-0.5 w-full bg-amber-200" />
                <div className="h-0.5 w-full bg-amber-200" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          THICK SOLID BLACK WALL SHELF
          "like those wall shelf and bigger and thicker, no highlights, just black"
          ======================================================== */}
      <div className="relative w-full flex flex-col items-center">
        {/* Main Thick Black Shelf Plank (16px thick, pure black, no highlights) */}
        <div className="w-full h-4 bg-black rounded-[2px]" />

        {/* Heavy Black Wall Brackets Underneath */}
        <div className="w-full flex justify-between px-8 -mt-0.5 pointer-events-none">
          {/* Left Heavy Bracket */}
          <div className="flex flex-col items-center">
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
              <rect x="0" y="0" width="8" height="48" fill="#000000" />
              <polygon points="0,42 8,42 38,0 28,0" fill="#000000" />
            </svg>
          </div>

          {/* Right Heavy Bracket */}
          <div className="flex flex-col items-center">
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
              <rect x="36" y="0" width="8" height="48" fill="#000000" />
              <polygon points="36,42 44,42 16,0 6,0" fill="#000000" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
};
