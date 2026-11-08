import { describe, it, expect } from 'vitest';
import { computeGraveyardStats } from './graveyardStats';
import { GraveyardRecord } from '../types/ghost';

describe('Graveyard Stats Aggregator', () => {
  it('correctly calculates most deleted words', () => {
    const mockGraveyard: GraveyardRecord[] = [
      {
        id: '1',
        text: 'nevermore',
        type: 'word',
        deletedAt: Date.now() - 10000,
        contextSentence: 'Quoth the raven nevermore',
        lifeSpanBeforeDeletionMs: 2000,
        wasRestored: false,
        wasExorcised: false,
      },
      {
        id: '2',
        text: 'nevermore again',
        type: 'word',
        deletedAt: Date.now() - 5000,
        contextSentence: 'nevermore again in the shadows',
        lifeSpanBeforeDeletionMs: 1500,
        wasRestored: false,
        wasExorcised: false,
      },
      {
        id: '3',
        text: 'shadows',
        type: 'word',
        deletedAt: Date.now() - 1000,
        contextSentence: 'in the shadows',
        lifeSpanBeforeDeletionMs: 8000,
        wasRestored: false,
        wasExorcised: false,
      },
    ];

    const stats = computeGraveyardStats(mockGraveyard, 'nevermore is here', 1, 0);

    expect(stats.totalSpawned).toBe(3);
    expect(stats.mostDeletedWords[0].word).toBe('nevermore');
    expect(stats.mostDeletedWords[0].count).toBe(2);
    expect(stats.wordsKilledAndRetyped.some((w) => w.word === 'nevermore')).toBe(true);
    expect(stats.longestLingeringRegret?.text).toBe('shadows');
    expect(stats.longestLingeringRegret?.durationMs).toBe(8000);
  });
});
