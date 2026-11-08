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
    title: 'Field Notes & Observations',
    color: 'bg-[#2d0e17]',
    border: 'border-[#1a070d]',
    textColor: 'text-[#e5beca]',
    width: 230,
    height: 36,
  },
  {
    id: 'book-2',
    title: 'Selected Short Stories & Essays',
    color: 'bg-[#1c0e2a]',
    border: 'border-[#100718]',
    textColor: 'text-[#d7c4eb]',
    width: 250,
    height: 38,
  },
  {
    id: 'book-3',
    title: 'An Illustrated Commonplace Book',
    color: 'bg-[#20121e]',
    border: 'border-[#130a12]',
    textColor: 'text-[#d8cad0]',
    width: 268,
    height: 42,
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

      if (dist < 125 && Math.hypot(ghost.vx, ghost.vy) > 0.65) {
        setIsToppled(true);
        if (soundEnabled) ghostAudio.playBookThud(volume);

        setOffsets({
          'book-1': { x: 30, y: -6, rot: 11 },
          'book-2': { x: -22, y: 5, rot: -8 },
          'book-3': { x: 12, y: 3, rot: 5 },
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
        x: Math.max(-65, Math.min(65, dragStartRef.current.initX + dx)),
        y: Math.max(-25, Math.min(25, dragStartRef.current.initY + dy)),
        rot: Math.max(-18, Math.min(18, (dragStartRef.current.initX + dx) * 0.22)),
      },
    }));
  };

  const handlePointerUp = () => {
    if (!draggingBookId) return;
    setDraggingBookId(null);

    const curr = offsets[draggingBookId];
    if (curr && Math.hypot(curr.x, curr.y) < 16) {
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
      className="fixed right-4 sm:right-6 lg:right-10 top-20 z-20 pointer-events-auto select-none hidden lg:block"
      style={{ width: '300px', height: '220px' }}
    >
      {/* ========================================================
          SUBDUED RESTACK BUTTON (Absolute positioning: ZERO layout shift)
          Clean, quiet, minimal — no bouncing, no neon gradients.
          ======================================================== */}
      {isToppled && (
        <button
          type="button"
          onClick={handleRestoreStack}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-1 rounded-md bg-stone-900/95 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-[11px] font-sans shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Restack books onto shelf"
        >
          <RotateCcw className="w-3 h-3 text-stone-400" />
          <span>Restack Books</span>
        </button>
      )}

      {/* ========================================================
          WORN, EVERYDAY VINTAGE BOOKS
          Anchored directly onto the top of the shelf plank (bottom: 80px)
          ======================================================== */}
      <div
        ref={stackRef}
        className="absolute left-1/2 -translate-x-1/2 bottom-[80px] z-10 flex flex-col items-center justify-end"
        style={{ width: '280px', height: '124px' }}
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
              title={isToppled ? 'Drag book to restack or click button' : 'Worn clothbound book (Ghosts might knock it over!)'}
              className={`relative -my-0.5 rounded-[3px] ${book.color} border ${book.border} shadow-md flex items-center justify-between px-3 cursor-grab active:cursor-grabbing transition-transform ${
                isDragging ? 'z-50 shadow-xl scale-102 ring-1 ring-stone-400' : 'z-20'
              }`}
            >
              {/* Worn Spine Crease & Faded Cloth Texture */}
              <div className="flex items-center gap-1">
                <div className="w-1 h-full bg-black/30 rounded-sm" />
                <div className="w-0.5 h-full bg-white/10" />
              </div>

              {/* Faded Vintage Spine Title */}
              <span className={`text-[10px] font-sans tracking-wide truncate font-medium ${book.textColor}`}>
                {book.title}
              </span>

              {/* Weathered aged-paper block on book edge (warm parchment tone) */}
              <div className="w-3.5 h-full flex flex-col justify-center gap-0.5 opacity-60">
                <div className="h-0.5 w-full bg-[#dcd4c0]" />
                <div className="h-0.5 w-full bg-[#cfc6b0]" />
                <div className="h-0.5 w-full bg-[#dcd4c0]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          THICK SOLID BLACK WALL SHELF (LOCKED AT TOP: 140PX)
          Zero layout shift, exactly level with DishShelf across the room.
          ======================================================== */}
      <div className="absolute top-[140px] left-0 w-full flex flex-col items-center">
        {/* Main Thick Black Shelf Plank (16px thick, pure black, no highlights) */}
        <div className="w-full h-4 bg-black rounded-[2px]" />

        {/* Heavy Black Wall Brackets Underneath */}
        <div className="w-full flex justify-between px-8 -mt-0.5 pointer-events-none">
          {/* Left Bracket */}
          <div className="flex flex-col items-center">
            <svg width="44" height="48" viewBox="0 0 44 48" fill="none">
              <rect x="0" y="0" width="8" height="48" fill="#000000" />
              <polygon points="0,42 8,42 38,0 28,0" fill="#000000" />
            </svg>
          </div>

          {/* Right Bracket */}
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
