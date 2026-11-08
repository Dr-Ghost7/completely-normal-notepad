'use client';

import React from 'react';
import { useGhostStore } from '../store/ghostStore';
import {
  X,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Volume2,
  ShieldCheck,
} from 'lucide-react';

export const TechShowcaseModal: React.FC = () => {
  const showTechInfo = useGhostStore((state) => state.settings.showTechInfo);
  const toggleModal = useGhostStore((state) => state.toggleModal);

  if (!showTechInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#11071c] border border-purple-900/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-purple-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between bg-[#0a0312]/95">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/80 text-rose-400">
              <Code2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif font-semibold text-base text-purple-100 flex items-center gap-2">
                Engineering &amp; Architecture Deep-Dive
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono">
                  Portfolio Showcase
                </span>
              </h2>
              <p className="text-xs text-purple-400/70 font-serif italic">
                Front-end competency, Web API mastery, and vector simulation mechanics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleModal('showTechInfo')}
            className="p-1.5 rounded-lg hover:bg-purple-900/40 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-purple-200/90 font-serif">
          {/* Section 1: DOM & ContentEditable BeforeInput */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#090310]/80 border border-purple-900/50">
            <div className="flex items-center gap-2 text-rose-400 font-semibold font-mono text-sm">
              <Layers className="w-4 h-4" />
              <span>1. Deletion Coordinates via `beforeinput` &amp; `Range.getClientRects()`</span>
            </div>
            <p className="leading-relaxed text-purple-200/80">
              Standard <code className="text-rose-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">&lt;textarea&gt;</code> elements are black boxes unable to report viewport coordinates of words. We engineered a managed <code className="text-rose-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">contenteditable</code> element listening to the native <code className="text-rose-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">beforeinput</code> event paired with an airtight <code className="text-rose-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">keydown</code> pipeline.
            </p>
            <ul className="list-disc list-inside space-y-1 text-purple-300/70 pl-1 font-sans text-[11px]">
              <li>Reads <code className="text-purple-200">event.getTargetRanges()</code> <em>before</em> the DOM node disappears.</li>
              <li>Executes <code className="text-purple-200">Range.getClientRects()</code> to capture sub-pixel screen coordinates <code className="text-purple-200">(originX, originY)</code> where the text resided on the paper.</li>
              <li>Includes robust fallback range computation for single-character collapsed cursor backspaces.</li>
            </ul>
          </div>

          {/* Section 2: Drag & Drop Drop Target via CaretPositionFromPoint */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#090310]/80 border border-purple-900/50">
            <div className="flex items-center gap-2 text-purple-300 font-semibold font-mono text-sm">
              <Cpu className="w-4 h-4" />
              <span>2. Pointer Events &amp; Dropping Spirits Back Into Text</span>
            </div>
            <p className="leading-relaxed text-purple-200/80">
              Re-anchoring a floating spirit back into the manuscript at an exact cursor point uses the Pointer Events API with full pointer capture (<code className="text-purple-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">setPointerCapture</code>) to guarantee smooth dragging on mobile touchscreens without scroll interference.
            </p>
            <p className="text-purple-300/70 font-sans text-[11px]">
              Drop target resolution combines modern <code className="text-purple-200">document.caretPositionFromPoint</code> with WebKit's <code className="text-purple-200">document.caretRangeFromPoint</code>, recalculating character offsets recursively across text nodes.
            </p>
          </div>

          {/* Section 3: 60fps Vector Physics */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#090310]/80 border border-purple-900/50">
            <div className="flex items-center gap-2 text-fuchsia-400 font-semibold font-mono text-sm">
              <Sparkles className="w-4 h-4" />
              <span>3. 60 FPS Vector Physics Simulation &amp; Archetype Dynamics</span>
            </div>
            <p className="leading-relaxed text-purple-200/80">
              A pure vector physics loop running on <code className="text-fuchsia-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">requestAnimationFrame</code> computes wandering, boundary elastic reflection, and archetype-specific forces:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/50">
                <span className="text-fuchsia-300 font-bold">Wisps:</span> High-frequency jitter &amp; gnat flutter.
              </div>
              <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/50">
                <span className="text-purple-300 font-bold">Word Ghosts:</span> Repulsive cursor evasion vector force.
              </div>
              <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/50">
                <span className="text-rose-400 font-bold">Regrets:</span> Spring harmonic force anchored to deletion origin.
              </div>
              <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/50">
                <span className="text-red-400 font-bold">Exorcism:</span> Gravitational whirlpool vortex with tangential swirl.
              </div>
            </div>
          </div>

          {/* Section 4: Web Audio API & State */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#090310]/80 border border-purple-900/50">
            <div className="flex items-center gap-2 text-rose-300 font-semibold font-mono text-sm">
              <Volume2 className="w-4 h-4" />
              <span>4. Procedural Web Audio API &amp; State Persistence</span>
            </div>
            <p className="leading-relaxed text-purple-200/80">
              Zero external audio files are downloaded. Sound effects (creaks, wisp flutters, regret minor chords, and swirling vortex drone) are synthesized procedurally in real-time using Web Audio <code className="text-rose-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">OscillatorNode</code>, <code className="text-rose-300 bg-purple-950 px-1 py-0.5 rounded border border-purple-800/60">BiquadFilterNode</code>, and logarithmic gain automation.
            </p>
          </div>

          {/* Section 5: Accessibility & Testing */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#090310]/80 border border-purple-900/50">
            <div className="flex items-center gap-2 text-purple-200 font-semibold font-mono text-sm">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>5. Accessibility &amp; Vitest Unit Testing</span>
            </div>
            <p className="leading-relaxed text-purple-300/70 font-sans text-[11px]">
              Includes full <strong>Reduced Motion Mode</strong> (docking spirits into an accessible static shelf), keyboard-accessible Exorcism (Hold Space/Enter), and complete unit test coverage with <strong>Vitest</strong> verifying classifier logic, timeline state transitions, and text metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
