'use client';

import React, { useState, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { decodeShareableUrl } from '../lib/urlShare';
import { HauntingAtmosphere } from '../components/HauntingAtmosphere';
import { GraveyardBackground } from '../components/GraveyardBackground';
import { Header } from '../components/Header';
import { Editor } from '../components/Editor';
import { GhostLayer } from '../components/GhostLayer';
import { GraveyardDrawer } from '../components/GraveyardDrawer';
import { SeanceReplayModal } from '../components/SeanceReplayModal';
import { ExportModal } from '../components/ExportModal';
import { ShareModal } from '../components/ShareModal';
import { SpiritJar } from '../components/SpiritJar';
import { CandleGroup } from '../components/CandleGroup';
import { DishShelf } from '../components/DishShelf';
import { BookShelf } from '../components/BookShelf';
import { Ghost } from '../types/ghost';
import { getGhostTheme } from '../lib/ghostClassifier';
import { Sparkles, Ghost as GhostIcon } from 'lucide-react';

export default function Home() {
  const [dropTargetOffset, setDropTargetOffset] = useState<number | null>(null);
  const loadFromShare = useGhostStore((state) => state.loadFromShare);
  const setSetting = useGhostStore((state) => state.setSetting);
  const toggleModal = useGhostStore((state) => state.toggleModal);
  const ghosts = useGhostStore((state) => state.ghosts);

  // Check URL hash for shared note on initial load
  useEffect(() => {
    const payload = decodeShareableUrl();
    if (payload) {
      const reconstructedGhosts: Ghost[] = payload.ghosts.map((g) => {
        const theme = getGhostTheme(g.type);
        return {
          id: g.id,
          text: g.text,
          type: g.type,
          x: g.x,
          y: g.y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.3,
          originX: g.x,
          originY: g.y,
          createdAt: g.createdAt,
          characterCount: g.text.length,
          contextSentence: g.contextSentence,
          lifeSpanBeforeDeletionMs: 2000,
          opacity: 0.85,
          scale: theme.baseScale,
          wobblePhase: Math.random() * Math.PI * 2,
          colorTheme: {
            text: theme.text,
            glow: theme.glow,
            border: theme.border,
            background: theme.background,
          },
        };
      });

      loadFromShare(payload.text, reconstructedGhosts);
      // Clean up hash to keep URL tidy
      window.history.replaceState(null, '', window.location.pathname);
    }

    // Check system prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSetting('reducedMotion', true);
    }
  }, [loadFromShare, setSetting]);

  const handleGhostDrop = (ghostId: string, charOffset: number | null) => {
    // Handled directly inside GhostLayer & Editor via Zustand store
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#09040e] text-purple-100 transition-colors duration-700 selection:bg-rose-900/60 selection:text-white">
      {/* Cemetery Horizon Silhouette & Occult Full Moon Background */}
      <GraveyardBackground />

      {/* Dynamic paranormal atmosphere (ambient light dimming, candle flicker, vignette) */}
      <HauntingAtmosphere />

      {/* Top Application Header */}
      <Header />

      {/* Main Notepad Editing Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-start py-4 sm:py-8">
        <Editor
          dropTargetOffset={dropTargetOffset}
          setDropTargetOffset={setDropTargetOffset}
        />
      </main>

      {/* Floating Ghost Physics Layer - Rendered on top of main notepad */}
      <GhostLayer
        onGhostDrop={handleGhostDrop}
        setDropTargetOffset={setDropTargetOffset}
      />

      {/* Wall Shelves in Top-Back Area (Left: Dishes above candles; Right: Books above jar) */}
      <DishShelf />
      <BookShelf />

      {/* Floor Paranormal Elements */}
      <CandleGroup />
      <SpiritJar />

      {/* Minimal Footer */}
      <footer className="relative z-20 py-2.5 px-6 border-t border-purple-900/30 bg-[#0a0312]/90 backdrop-blur-md text-[11px] text-purple-400/60 font-serif">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-purple-400/70">
              Completely Normal Notepad &bull; Nothing unusual here
            </span>
          </div>

          <div className="text-purple-400/50 italic">
            All deleted words stay on your device
          </div>
        </div>
      </footer>

      {/* Interactive Modals and Side Drawers */}
      <GraveyardDrawer />
      <SeanceReplayModal />
      <ExportModal />
      <ShareModal />
    </div>
  );
}
