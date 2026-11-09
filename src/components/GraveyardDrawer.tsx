'use client';

import React, { useState, useCallback } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { useGhostStats } from '../hooks/useGhostStats';
import { GhostType } from '../types/ghost';
import {
  X,
  Archive,
  RotateCcw,
  Sparkles,
  Clock,
  TrendingUp,
  Skull,
  Search,
  Trash2,
} from 'lucide-react';

export const GraveyardDrawer: React.FC = () => {
  const showGraveyard = useGhostStore((state) => state.settings.showGraveyard);
  const toggleModal = useGhostStore((state) => state.toggleModal);
  const graveyard = useGhostStore((state) => state.graveyard);
  const stats = useGhostStats();
  const spawnGhost = useGhostStore((state) => state.spawnGhost);
  const clearGraveyard = useGhostStore((state) => state.clearGraveyard);

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const handleResurrect = useCallback((text: string, type: GhostType, contextSentence: string) => {
    // Spawn back as an active ghost floating near top center
    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    spawnGhost({
      text,
      type,
      originX: width / 2 + (Math.random() - 0.5) * 100,
      originY: 200 + (Math.random() - 0.5) * 60,
      contextSentence,
      lifeSpanBeforeDeletionMs: 1000,
    });
  }, [spawnGhost]);

  if (!showGraveyard) return null;

  const filtered = graveyard.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery && !item.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-[#11071c] border-l border-purple-900/60 shadow-2xl flex flex-col overflow-hidden text-purple-100">
        {/* Drawer Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between bg-[#0a0312]/90">
          <div className="flex items-center gap-2.5">
            <Archive className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="font-serif font-semibold text-base text-purple-100 flex items-center gap-2">
                The Graveyard
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono">
                  Occult Ledger
                </span>
              </h2>
              <p className="text-xs text-purple-400/70 font-serif italic">
                Ledger of erased words and departing spirits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {graveyard.length > 0 && !confirmClear && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-950/80 text-red-400 hover:text-red-200 border border-red-900/50 text-[11px] font-serif transition-colors cursor-pointer"
                title="Erase all graveyard records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Ledger</span>
              </button>
            )}

            {confirmClear && (
              <div className="flex items-center gap-1 bg-red-950 px-2 py-0.5 rounded-lg border border-red-800">
                <span className="text-[10px] text-red-200 font-serif mr-1">Erase records?</span>
                <button
                  type="button"
                  onClick={() => {
                    clearGraveyard();
                    setConfirmClear(false);
                  }}
                  className="px-1.5 py-0.5 rounded bg-red-700 text-white text-[10px] font-serif"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-serif"
                >
                  No
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleModal('showGraveyard')}
              className="p-1.5 rounded-lg hover:bg-purple-900/40 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistical Ledger Cards */}
        <div className="p-4 border-b border-purple-900/40 bg-[#160924]/60 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/50 shadow-inner">
              <span className="block font-mono text-base font-bold text-fuchsia-300">
                {stats.totalSpawned}
              </span>
              <span className="text-[10px] text-purple-400/80 uppercase tracking-wider font-serif">
                Spawned
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/50 shadow-inner">
              <span className="block font-mono text-base font-bold text-rose-300">
                {stats.totalRestored}
              </span>
              <span className="text-[10px] text-rose-400/80 uppercase tracking-wider font-serif">
                Restored
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-800/50 shadow-inner">
              <span className="block font-mono text-base font-bold text-purple-300">
                {stats.totalExorcised}
              </span>
              <span className="text-[10px] text-purple-400/80 uppercase tracking-wider font-serif">
                Exorcised
              </span>
            </div>
          </div>

          {/* Deep Inquiries */}
          <div className="p-3 rounded-xl bg-[#0d0417]/80 border border-purple-900/60 text-xs space-y-2">
            {stats.mostDeletedWords[0] && (
              <div className="flex items-center justify-between">
                <span className="text-purple-400 flex items-center gap-1.5 font-serif">
                  <TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" />
                  Most Deleted Word:
                </span>
                <span className="font-mono font-medium text-fuchsia-300">
                  &ldquo;{stats.mostDeletedWords[0].word}&rdquo; ({stats.mostDeletedWords[0].count}x)
                </span>
              </div>
            )}

            {stats.wordsKilledAndRetyped[0] && (
              <div className="flex items-center justify-between">
                <span className="text-purple-400 flex items-center gap-1.5 font-serif">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  Killed &amp; Retyped:
                </span>
                <span className="font-mono font-medium text-rose-300">
                  &ldquo;{stats.wordsKilledAndRetyped[0].word}&rdquo; ({stats.wordsKilledAndRetyped[0].retypes}x)
                </span>
              </div>
            )}

            {stats.longestLingeringRegret && (
              <div className="flex items-center justify-between">
                <span className="text-purple-400 flex items-center gap-1.5 font-serif">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  Longest Regret:
                </span>
                <span className="font-mono font-medium text-purple-300">
                  &ldquo;{stats.longestLingeringRegret.text}&rdquo; ({Math.round(stats.longestLingeringRegret.durationMs / 1000)}s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="p-3 border-b border-purple-900/40 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-purple-500" />
            <input
              type="text"
              placeholder="Search erased words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-200 placeholder-purple-500/60 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px]">
            {['all', 'word', 'wisp', 'regret', 'sentence', 'poltergeist'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer shrink-0 font-serif ${
                  filterType === type
                    ? 'bg-rose-900/80 text-rose-100 font-medium border border-rose-600/60 shadow-sm'
                    : 'bg-purple-950/40 text-purple-400 hover:text-purple-200 hover:bg-purple-900/40'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* The Gravestone List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-purple-500/70 space-y-2">
              <Skull className="w-8 h-8 mx-auto text-purple-800" />
              <p className="text-xs font-serif italic">No departed souls match your ledger.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const timeStr = new Date(item.deletedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-purple-950/30 hover:bg-purple-950/60 border border-purple-900/50 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-medium text-purple-100 text-sm">
                        &ldquo;{item.text}&rdquo;
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-900/60 text-purple-300 border border-purple-700/50">
                        {item.type}
                      </span>
                    </div>

                    {item.contextSentence && (
                      <p className="text-[11px] text-purple-400/80 italic line-clamp-1 font-serif">
                        &ldquo;...{item.contextSentence.trim()}...&rdquo;
                      </p>
                    )}

                    <div className="text-[10px] text-purple-500/80 flex items-center gap-2 font-mono">
                      <span>Erased at {timeStr}</span>
                      {item.wasRestored && <span className="text-rose-400">&bull; Restored</span>}
                      {item.wasExorcised && <span className="text-purple-400">&bull; Exorcised</span>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResurrect(item.text, item.type, item.contextSentence)}
                    className="p-1.5 rounded-lg bg-purple-900/40 hover:bg-rose-950 text-purple-400 hover:text-rose-200 border border-purple-700/50 transition-colors cursor-pointer shrink-0"
                    title="Resurrect spirit onto screen"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
