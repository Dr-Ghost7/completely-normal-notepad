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
        text: 'text-fuchsia-100',
        glow: 'rgba(217, 70, 239, 0.75)',
        border: 'border-fuchsia-400',
        background: 'bg-purple-950/90 shadow-lg shadow-fuchsia-600/30',
        badge: 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/40',
        label: 'Wisp',
        description: 'A fleeting typo, startled from the manuscript',
        baseScale: 0.9,
        speedMultiplier: 1.8,
        dodgeCursor: false,
        zIndex: 40,
      };
    case 'regret':
      return {
        text: 'text-rose-100',
        glow: 'rgba(225, 29, 72, 0.85)',
        border: 'border-rose-500',
        background: 'bg-rose-950/90 shadow-xl shadow-rose-900/50',
        badge: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
        label: 'Regret',
        description: 'Written, stared at in silence, then bled away',
        baseScale: 1.05,
        speedMultiplier: 0.6,
        dodgeCursor: false,
        zIndex: 50,
      };
    case 'sentence':
      return {
        text: 'text-purple-200',
        glow: 'rgba(147, 51, 234, 0.55)',
        border: 'border-purple-600/60',
        background: 'bg-[#150a24]/90 shadow-lg shadow-purple-950/40',
        badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
        label: 'Sentence',
        description: 'A heavy thought that now drifts in the shadowy void',
        baseScale: 1.15,
        speedMultiplier: 0.4,
        dodgeCursor: false,
        zIndex: 25,
      };
    case 'poltergeist':
      return {
        text: 'text-red-100',
        glow: 'rgba(239, 68, 68, 0.9)',
        border: 'border-red-500',
        background: 'bg-red-950/90 shadow-2xl shadow-red-900/60',
        badge: 'bg-red-950/80 text-red-300 border-red-500/50',
        label: 'Poltergeist',
        description: 'Born from a total manuscript purge',
        baseScale: 1.05,
        speedMultiplier: 2.2,
        dodgeCursor: true,
        zIndex: 45,
      };
    case 'word':
    default:
      return {
        text: 'text-purple-100',
        glow: 'rgba(168, 85, 247, 0.75)',
        border: 'border-purple-400',
        background: 'bg-purple-950/90 shadow-xl shadow-purple-900/40',
        badge: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
        label: 'Word',
        description: 'A wandering soul that evades your reaching hand',
        baseScale: 1.0,
        speedMultiplier: 0.8,
        dodgeCursor: true,
        zIndex: 35,
      };
  }
}
