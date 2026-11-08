import { describe, it, expect } from 'vitest';
import { classifyGhost, getGhostTheme } from './ghostClassifier';

describe('Ghost Classifier Engine', () => {
  it('classifies select all deletions as poltergeist', () => {
    const result = classifyGhost({
      text: 'The entire manuscript vanished into the night.',
      totalDocLength: 46,
      isSelectAll: true,
    });
    expect(result).toBe('poltergeist');
  });

  it('classifies mass document deletions as poltergeist', () => {
    const result = classifyGhost({
      text: 'Almost everything written here was suddenly wiped out',
      totalDocLength: 60,
      isSelectAll: false,
    });
    expect(result).toBe('poltergeist');
  });

  it('classifies rapid typo backspaces as wisps', () => {
    const result = classifyGhost({
      text: 'teh',
      totalDocLength: 100,
      timeSinceLastTypeMs: 120,
      textAgeMs: 250,
    });
    expect(result).toBe('wisp');
  });

  it('classifies single-letter quick deletion as wisp', () => {
    const result = classifyGhost({
      text: 'a',
      totalDocLength: 50,
      timeSinceLastTypeMs: 50,
      textAgeMs: 500,
    });
    expect(result).toBe('wisp');
  });

  it('classifies long-lingering deleted text as regret ghost', () => {
    const result = classifyGhost({
      text: 'I loved you then',
      totalDocLength: 150,
      timeSinceLastTypeMs: 3500,
      textAgeMs: 12000, // Lingered for 12 seconds
    });
    expect(result).toBe('regret');
  });

  it('classifies multi-word sentence with punctuation as sentence ghost', () => {
    const result = classifyGhost({
      text: 'It was a dark and stormy night.',
      totalDocLength: 200,
      timeSinceLastTypeMs: 200,
      textAgeMs: 1500,
    });
    expect(result).toBe('sentence');
  });

  it('classifies multiline or long text as sentence ghost', () => {
    const result = classifyGhost({
      text: 'This is a significantly longer passage of prose that exceeds normal word lengths',
      totalDocLength: 300,
      timeSinceLastTypeMs: 1000,
      textAgeMs: 1000,
    });
    expect(result).toBe('sentence');
  });

  it('classifies regular deleted word as word ghost', () => {
    const result = classifyGhost({
      text: 'strange',
      totalDocLength: 200,
      timeSinceLastTypeMs: 1500,
      textAgeMs: 2000,
    });
    expect(result).toBe('word');
  });

  it('returns valid theme properties for all ghost types', () => {
    const types = ['wisp', 'word', 'sentence', 'regret', 'poltergeist'] as const;
    types.forEach((type) => {
      const theme = getGhostTheme(type);
      expect(theme.label).toBeDefined();
      expect(theme.text).toBeDefined();
      expect(theme.glow).toBeDefined();
      expect(theme.speedMultiplier).toBeGreaterThan(0);
    });
  });
});
