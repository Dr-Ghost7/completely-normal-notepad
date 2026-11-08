'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { useHauntingIntensity } from '../hooks/useGhostStats';
import { ExorcismButton } from './ExorcismButton';
import {
  Ghost as GhostIcon,
  Volume2,
  VolumeX,
  History,
  Archive,
  Share2,
  Download,
  MoreVertical,
  EyeOff,
  Flame,
  Trash2,
  RotateCcw,
} from 'lucide-react';

export const Header: React.FC = () => {
  const ghosts = useGhostStore((state) => state.ghosts);
  const graveyard = useGhostStore((state) => state.graveyard);
  const intensity = useHauntingIntensity();
  const settings = useGhostStore((state) => state.settings);
  const setSetting = useGhostStore((state) => state.setSetting);
  const toggleModal = useGhostStore((state) => state.toggleModal);
  const startSeance = useGhostStore((state) => state.startSeance);
  const resetAll = useGhostStore((state) => state.resetAll);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmReset(false);
      }
    };
    if (menuOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
    }
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const handleResetData = () => {
    resetAll();
    setConfirmReset(false);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#0a0312]/95 border-b border-purple-900/40 px-4 py-2.5 transition-colors duration-500 shadow-xl shadow-purple-950/40">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Sleek Title & Ghost Presence Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/90 border border-purple-800/80 shadow-inner">
              <GhostIcon
                className={`w-4 h-4 transition-colors duration-500 ${
                  ghosts.length > 0 ? 'text-rose-400 animate-pulse' : 'text-purple-400'
                }`}
              />
              {ghosts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <h1 className="font-serif text-base sm:text-lg font-semibold tracking-wide text-purple-100 hover:text-rose-200 transition-colors">
                Completely Normal Notepad
              </h1>
            </div>
          </div>

          {/* Active Spirits Indicator (Only when spirits are present) */}
          {ghosts.length > 0 && (
            <div className="flex items-center ml-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-serif bg-rose-950/70 text-rose-300 border border-rose-800/60 flex items-center gap-1.5 shadow-sm shadow-rose-950 animate-in fade-in duration-200">
                <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
                <span>{ghosts.length} wandering spirit{ghosts.length > 1 ? 's' : ''}</span>
              </span>
            </div>
          )}
        </div>

        {/* Right: Curated Primary Actions */}
        <div className="flex items-center gap-2 text-xs">
          {/* Audio Synthesizer Toggle */}
          <button
            type="button"
            onClick={() => setSetting('soundEnabled', !settings.soundEnabled)}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              settings.soundEnabled
                ? 'bg-rose-950/80 text-rose-200 border-rose-700/60 shadow-sm shadow-rose-950'
                : 'bg-purple-950/40 text-purple-400/70 border-purple-900/40 hover:text-purple-200 hover:bg-purple-900/40'
            }`}
            title={settings.soundEnabled ? 'Web Audio Sound Enabled (Click to Mute)' : 'Sound Muted (Click to Enable Audio)'}
            aria-label="Toggle Sound Effects"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* The Graveyard Drawer */}
          <button
            type="button"
            onClick={() => toggleModal('showGraveyard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 text-purple-200 hover:text-purple-100 border border-purple-800/50 transition-colors cursor-pointer"
            title="Open The Graveyard & Deletion Statistics"
          >
            <Archive className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-serif">Graveyard</span>
            {graveyard.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-purple-900/80 text-purple-300 font-mono border border-purple-700/50">
                {graveyard.length}
              </span>
            )}
          </button>

          {/* Exorcism Hold-to-Clear Button */}
          <ExorcismButton />

          {/* Options Menu (Dropdown) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(!menuOpen);
                setConfirmReset(false);
              }}
              className="p-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50 transition-colors cursor-pointer"
              title="More options & history tools"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#12061e]/98 border border-purple-800/70 shadow-2xl shadow-black/90 backdrop-blur-md p-1.5 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {/* Séance Replay */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    startSeance();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-purple-200 hover:text-purple-100 hover:bg-purple-900/40 transition-colors cursor-pointer font-serif"
                >
                  <History className="w-3.5 h-3.5 text-rose-400" />
                  <div className="flex-1">
                    <span className="block">Séance Replay</span>
                    <span className="text-[10px] text-purple-400/60 block font-sans">Rewind document history & ghost births</span>
                  </div>
                </button>

                {/* Exhumed Export */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    toggleModal('showExport');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-purple-200 hover:text-purple-100 hover:bg-purple-900/40 transition-colors cursor-pointer font-serif"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <div className="flex-1">
                    <span className="block">Exhumed Export</span>
                    <span className="text-[10px] text-purple-400/60 block font-sans">Download text + deleted drafts appendix</span>
                  </div>
                </button>

                {/* Share Haunted Note */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    toggleModal('showShare');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-purple-200 hover:text-purple-100 hover:bg-purple-900/40 transition-colors cursor-pointer font-serif"
                >
                  <Share2 className="w-3.5 h-3.5 text-fuchsia-400" />
                  <div className="flex-1">
                    <span className="block">Share Haunted Note</span>
                    <span className="text-[10px] text-purple-400/60 block font-sans">Shareable link with drifting ghosts</span>
                  </div>
                </button>

                {/* Reduced Motion Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setSetting('reducedMotion', !settings.reducedMotion);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-purple-200 hover:text-purple-100 hover:bg-purple-900/40 transition-colors cursor-pointer font-serif"
                >
                  <div className="flex items-center gap-2.5">
                    <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                    <span>Reduced Motion</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
                    {settings.reducedMotion ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div className="my-1 border-t border-purple-900/50" />

                {/* ERASE ALL OLD DATA OPTION */}
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-red-400 hover:text-red-200 hover:bg-red-950/40 transition-colors cursor-pointer font-serif"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Erase All Old Data &amp; Reset</span>
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/80 space-y-1.5">
                    <p className="text-[11px] text-red-200 font-serif leading-tight">
                      Permanently wipe all ghosts, graveyard records, and notes?
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={handleResetData}
                        className="flex-1 py-1 rounded-lg bg-red-700 hover:bg-red-600 text-white font-serif text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Yes, Erase All
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="px-2 py-1 rounded-lg bg-purple-950 text-purple-300 hover:bg-purple-900 font-serif text-[11px] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
