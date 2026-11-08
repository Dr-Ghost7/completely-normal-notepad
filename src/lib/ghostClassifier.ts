import { GhostType } from '../types/ghost';

export interface ClassifyGhostInput {
  text: string;
  totalDocLength: number;
  isSelectAll?: boolean;
  timeSinceLastTypeMs?: number;
  textAgeMs?: number;
}

/**
 * Determines the ghost archetype based on deletion context:
 * - Poltergeist: select all & delete (or mass deletion of document)
 * - Wisp: quick typo backspaced right away (1-3 chars, fast deletion)
 * - Regret: text that lingered undisturbed for a while (> 5 seconds) before being erased
 * - Sentence: longer phrase, multi-word sentence, or multi-line block
 * - Word: standard word or small snippet
 */
export function classifyGhost(input: ClassifyGhostInput): GhostType {
  const {
    text,
    totalDocLength,
    isSelectAll = false,
    timeSinceLastTypeMs = 0,
    textAgeMs = 0,
  } = input;

  const trimmed = text.trim();
  const charLength = trimmed.length;

  if (charLength === 0) {
    return 'wisp';
  }

  // 1. Poltergeist: Select all + delete, or wiped at least 70% of a substantial document (> 20 chars)
  if (isSelectAll || (totalDocLength > 20 && charLength >= Math.floor(totalDocLength * 0.7))) {
    return 'poltergeist';
  }

  // 2. Wisp: Short typo backspaced rapidly (< 800ms since typed, or 1-2 chars deleted quickly)
  if (charLength <= 3 && timeSinceLastTypeMs < 800 && textAgeMs < 2000) {
    return 'wisp';
  }

  // 3. Regret ghost: The text sat on the page for a prolonged contemplation period (> 5000ms)
  // before being remorsefully deleted.
  if (textAgeMs >= 5000 && charLength > 2) {
    return 'regret';
  }

  // 4. Sentence ghost: Contains sentence punctuation (. ? ! \n) or exceeds typical single-word length (> 32 chars)
  // or has multiple spaced words (> 3 words)
  const words = trimmed.split(/\s+/).filter(Boolean);
  const hasSentencePunctuation = /[.!?\n]/.test(trimmed);
  if (charLength > 32 || hasSentencePunctuation || words.length >= 4) {
    return 'sentence';
  }

  // 5. Default: Word ghost
  return 'word';
}

/**
 * Returns visual theme, styling tokens, and physics attributes for each ghost type,
 * styled in a gothic Red & Purple occult aesthetic.
 */
export function getGhostTheme(type: GhostType) {
  switch (type) {
    case 'wisp':
      return {
        text: 'text-cyan-950 font-bold',
        glow: 'rgba(34, 211, 238, 0.85)',
        border: 'border-cyan-300/90',
        background: 'bg-cyan-100/90 shadow-lg shadow-cyan-400/40 backdrop-blur-md',
        badge: 'bg-cyan-200 text-cyan-950 border-cyan-400/60',
        label: 'Frost Wisp',
        description: 'A fleeting typo, startled from the manuscript',
        baseScale: 0.9,
        speedMultiplier: 0.7,
        dodgeCursor: false,
        zIndex: 40,
      };
    case 'regret':
      return {
        text: 'text-rose-950 font-bold',
        glow: 'rgba(244, 63, 94, 0.85)',
        border: 'border-rose-400/90',
        background: 'bg-rose-100/90 shadow-xl shadow-rose-500/45 backdrop-blur-md',
        badge: 'bg-rose-200 text-rose-950 border-rose-400/60',
        label: 'Bleeding Regret',
        description: 'Written, stared at in silence, then bled away',
        baseScale: 1.05,
        speedMultiplier: 0.35,
        dodgeCursor: false,
        zIndex: 50,
      };
    case 'sentence':
      return {
        text: 'text-purple-950 font-bold',
        glow: 'rgba(192, 132, 252, 0.75)',
        border: 'border-purple-300/90',
        background: 'bg-purple-100/85 shadow-lg shadow-purple-400/40 backdrop-blur-md',
        badge: 'bg-purple-200 text-purple-950 border-purple-400/60',
        label: 'Violet Wraith',
        description: 'A heavy thought that now drifts across the spectral void',
        baseScale: 1.15,
        speedMultiplier: 0.25,
        dodgeCursor: false,
        zIndex: 25,
      };
    case 'poltergeist':
      return {
        text: 'text-red-950 font-black',
        glow: 'rgba(239, 68, 68, 0.95)',
        border: 'border-red-400/90',
        background: 'bg-amber-100/90 shadow-2xl shadow-red-500/50 backdrop-blur-md',
        badge: 'bg-red-200 text-red-950 border-red-400/60',
        label: 'Infernal Poltergeist',
        description: 'Born from a total manuscript purge',
        baseScale: 1.05,
        speedMultiplier: 0.8,
        dodgeCursor: false,
        zIndex: 45,
      };
    case 'word':
    default:
      return {
        text: 'text-zinc-950 font-bold',
        glow: 'rgba(255, 255, 255, 0.9)',
        border: 'border-white/90',
        background: 'bg-white/90 shadow-xl shadow-white/40 backdrop-blur-md',
        badge: 'bg-white text-zinc-950 border-white/80',
        label: 'White Sheet Ghost',
        description: 'A classic translucent white bedsheet phantom with wandering spirit eyes',
        baseScale: 1.0,
        speedMultiplier: 0.4,
        dodgeCursor: false,
        zIndex: 35,
      };
  }
}
