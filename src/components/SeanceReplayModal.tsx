'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGhostStore } from '../store/ghostStore';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  History,
  Sparkles,
} from 'lucide-react';

export const SeanceReplayModal: React.FC = () => {
  const isReplaying = useGhostStore((state) => state.isReplaying);
  const replayIndex = useGhostStore((state) => state.replayIndex);
  const setReplayIndex = useGhostStore((state) => state.setReplayIndex);
  const stopSeance = useGhostStore((state) => state.stopSeance);
  const snapshots = useGhostStore((state) => state.snapshots);
  const fontFamily = useGhostStore((state) => state.settings.fontFamily);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fontClass =
    fontFamily === 'typewriter'
      ? 'font-typewriter'
      : fontFamily === 'script'
      ? 'font-script text-lg'
      : fontFamily === 'modern'
      ? 'font-modern'
      : 'font-gothic';

  const currentSnapshot = snapshots[replayIndex] || snapshots[snapshots.length - 1];

  // Auto-playback loop (peppy and responsive: 1x = 260ms, 2x = 130ms, 4x = 65ms, 8x = 32ms)
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(25, Math.round(260 / speed));

    timerRef.current = setInterval(() => {
      setReplayIndex(
        replayIndex < snapshots.length - 1 ? replayIndex + 1 : 0
      );
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, replayIndex, snapshots.length, speed, setReplayIndex]);

  if (!isReplaying) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#11071c] border border-purple-900/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-purple-100">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between bg-[#0a0312]/95">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/80 text-rose-400">
              <History className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif font-semibold text-base text-purple-100 flex items-center gap-2">
                Séance Replay Chamber
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono">
                  Spectral Timeline
                </span>
              </h2>
              <p className="text-xs text-purple-400/70 font-serif italic">
                Rewind through the history of words inscribed, erased, and resurrected
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={stopSeance}
            className="p-1.5 rounded-lg hover:bg-purple-900/40 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Replay Document Projection - with proper pl-[78px] margin line offset */}
        <div className="p-6 bg-[#090310]/60 min-h-[300px] max-h-[420px] overflow-y-auto">
          <div className={`paper-lined rounded-2xl py-6 pr-6 pl-20 sm:pl-[78px] shadow-inner text-purple-100 text-base min-h-[260px] whitespace-pre-wrap select-none border border-purple-900/40 ${fontClass}`}>
            {currentSnapshot?.text || '(Blank slate)'}
          </div>
        </div>

        {/* Snapshot Meta Badge */}
        <div className="px-6 py-2.5 bg-[#0e0417] border-t border-purple-900/40 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-rose-300">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Event: <strong className="text-purple-100">{currentSnapshot?.description}</strong></span>
          </div>
          <div className="text-purple-400/80">
            {currentSnapshot && currentSnapshot.timestamp > 0
              ? new Date(currentSnapshot.timestamp).toLocaleTimeString()
              : 'Initial Draft'}
          </div>
        </div>

        {/* Scrubber Controls */}
        <div className="p-6 border-t border-purple-900/50 bg-[#0a0312]/95 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-purple-400/80">
              <span>Beginning (0)</span>
              <span className="text-rose-400 font-bold">
                Frame {replayIndex + 1} of {snapshots.length}
              </span>
              <span>Present Moment</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, snapshots.length - 1)}
              value={replayIndex}
              onChange={(e) => setReplayIndex(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-purple-950 rounded-lg appearance-none border border-purple-800/40"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setReplayIndex(Math.max(0, replayIndex - 1))}
                disabled={replayIndex === 0}
                className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/60 disabled:opacity-30 text-purple-200 border border-purple-800/50 transition-colors cursor-pointer"
                title="Step backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-rose-700 hover:from-purple-700 hover:to-rose-600 text-white font-serif font-medium text-xs transition-colors cursor-pointer shadow-lg shadow-rose-950"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play Séance'}</span>
              </button>

              <button
                type="button"
                onClick={() => setReplayIndex(Math.min(snapshots.length - 1, replayIndex + 1))}
                disabled={replayIndex >= snapshots.length - 1}
                className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/60 disabled:opacity-30 text-purple-200 border border-purple-800/50 transition-colors cursor-pointer"
                title="Step forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-purple-400/80 text-[11px] mr-1">Speed:</span>
              {[1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    speed === s
                      ? 'bg-rose-950 text-rose-200 border border-rose-600'
                      : 'bg-purple-950/40 text-purple-400 hover:text-purple-200 hover:bg-purple-900/40 border border-purple-900/50'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
