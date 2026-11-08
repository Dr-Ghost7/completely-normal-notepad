'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { ghostAudio } from '../lib/ghostAudio';
import { Sparkles, RotateCcw } from 'lucide-react';

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
    height: 26,
  },
  {
    id: 'book-2',
    title: 'Spectral Lexicon',
    color: 'from-purple-950 via-indigo-950 to-stone-900',
    border: 'border-purple-800/60',
    textColor: 'text-purple-200/90',
    width: 155,
    height: 28,
  },
  {
    id: 'book-3',
    title: 'Ars Daemonica &bull; Vol. I',
    color: 'from-emerald-950 via-teal-950 to-stone-900',
    border: 'border-emerald-800/60',
    textColor: 'text-emerald-200/90',
    width: 170,
    height: 32,
  },
];

export const GothicBooks: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const soundEnabled = useGhostStore((state) => state.settings.soundEnabled);
  const volume = useGhostStore((state) => state.settings.volume);

  const containerRef = useRef<HTMLDivElement>(null);
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
    if (isToppled || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const ghost of ghosts) {
      if (ghost.isTrappedInJar) continue;
      const dx = ghost.x - centerX;
      const dy = ghost.y - centerY;
      const dist = Math.hypot(dx, dy);

      // If a ghost collides with noticeable kinetic energy: KNOCK OVER!
      if (dist < 110 && Math.hypot(ghost.vx, ghost.vy) > 0.8) {
        setIsToppled(true);
        if (soundEnabled) ghostAudio.playBookThud(volume);

        // Scatter books randomly
        setOffsets({
          'book-1': { x: 28, y: -8, rot: 14 },
          'book-2': { x: -22, y: 6, rot: -9 },
          'book-3': { x: 12, y: 4, rot: 6 },
        });
        break;
      }
    }
  }, [ghosts, isToppled, soundEnabled, volume]);

  const handlePointerDown = (e: React.PointerEvent, bookId: string) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    setDraggingBookId(bookId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initX: offsets[bookId]?.x || 0,
      initY: offsets[bookId]?.y || 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingBookId) return;

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    setOffsets((prev) => ({
      ...prev,
      [draggingBookId]: {
        ...prev[draggingBookId],
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy,
      },
    }));
  };

  const handlePointerUp = () => {
    if (!draggingBookId) return;
    setDraggingBookId(null);

    // Check if user dragged book close to resting alignment (snap into place)
    const current = offsets[draggingBookId];
    if (Math.hypot(current.x, current.y) < 25) {
      setOffsets((prev) => ({
        ...prev,
        [draggingBookId]: { x: 0, y: 0, rot: 0 },
      }));

      // Check if all books are aligned now
      const allAligned = Object.entries(offsets).every(([id, val]) =>
        id === draggingBookId ? true : Math.hypot(val.x, val.y) < 5
      );
      if (allAligned) {
        setIsToppled(false);
        if (soundEnabled) ghostAudio.playMendChime(volume);
      }
    }
  };

  const restoreStack = () => {
    setIsToppled(false);
    setOffsets({
      'book-1': { x: 0, y: 0, rot: 0 },
      'book-2': { x: 0, y: 0, rot: 0 },
      'book-3': { x: 0, y: 0, rot: 0 },
    });
    if (soundEnabled) ghostAudio.playMendChime(volume);
  };

  return (
    <div
      ref={containerRef}
      className="fixed left-48 sm:left-56 bottom-6 z-30 pointer-events-auto select-none flex flex-col items-center group hidden md:flex"
    >
      {/* Restack quick button if toppled */}
      {isToppled && (
        <button
          type="button"
          onClick={restoreStack}
          className="mb-2 px-2.5 py-1 rounded-full bg-purple-950/90 hover:bg-rose-950 text-purple-200 hover:text-white border border-purple-700/60 shadow-xl flex items-center gap-1.5 text-[10px] font-serif cursor-pointer transition-all animate-bounce"
        >
          <RotateCcw className="w-3 h-3 text-purple-300" />
          <span>Restack Books</span>
        </button>
      )}

      {/* The Stack of Sideways Leather Books */}
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
              title={isToppled ? 'Drag book to restack or click Restack above' : 'Antique Grimoire (Ghosts might knock it over!)'}
              className={`relative -my-0.5 rounded bg-gradient-to-r ${book.color} border ${book.border} shadow-lg flex items-center justify-between px-3 cursor-grab active:cursor-grabbing transition-transform ${
                isDragging ? 'z-50 shadow-2xl scale-105 ring-2 ring-purple-400' : 'z-20'
              }`}
            >
              {/* Gold Ribbon / Bookmark Detail */}
              <div className="w-1.5 h-full bg-amber-500/40 rounded-sm" />

              {/* Embossed Gold Spine Title */}
              <span
                dangerouslySetInnerHTML={{ __html: book.title }}
                className={`text-[9px] font-gothic tracking-wider truncate font-semibold uppercase ${book.textColor}`}
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

      {/* Subtle desk shadow */}
      <div className="w-44 h-2 rounded-full bg-black/40 blur-[2px] mt-0.5" />
    </div>
  );
};
