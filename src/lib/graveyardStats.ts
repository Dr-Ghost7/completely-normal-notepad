import { GraveyardRecord, GhostStats } from '../types/ghost';

/**
 * Computes analytics from the graveyard records and current document text.
 */
export function computeGraveyardStats(
  graveyard: GraveyardRecord[],
  currentDocText: string,
  totalRestored: number,
  totalExorcised: number
): GhostStats {
  const wordFrequency: Record<string, number> = {};
  let longestRegret: { text: string; durationMs: number } | null = null;

  // Process all graveyard records
  graveyard.forEach((record) => {
    // Break into individual words for the "most deleted words" tally
    const words = record.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2); // Ignore single characters/prepositions for meaningful stats

    words.forEach((w) => {
      wordFrequency[w] = (wordFrequency[w] || 0) + 1;
    });

    // Track longest lingering regret
    if (record.lifeSpanBeforeDeletionMs > 0) {
      if (!longestRegret || record.lifeSpanBeforeDeletionMs > longestRegret.durationMs) {
        longestRegret = {
          text: record.text,
          durationMs: record.lifeSpanBeforeDeletionMs,
        };
      }
    }
  });

  // Sort most deleted words
  const mostDeletedWords = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Compute words killed and retyped
  // Check which deleted words currently exist again in currentDocText
  const currentDocWords = new Set(
    currentDocText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  const wordsKilledAndRetyped: { word: string; retypes: number }[] = [];
  mostDeletedWords.forEach(({ word, count }) => {
    if (currentDocWords.has(word)) {
      wordsKilledAndRetyped.push({
        word,
        retypes: count,
      });
    }
  });

  return {
    totalSpawned: graveyard.length,
    totalExorcised,
    totalRestored,
    mostDeletedWords,
    wordsKilledAndRetyped,
    longestLingeringRegret: longestRegret,
  };
}
