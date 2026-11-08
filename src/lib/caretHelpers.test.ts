import { describe, it, expect } from 'vitest';
import { extractContextSentence } from './caretHelpers';

describe('Caret & Context Helpers', () => {
  it('extracts surrounding sentence correctly', () => {
    const fullText = 'The raven sat upon the bust of Pallas. Darkness crept across the chamber floors. Nothing moved.';
    const deletedSnippet = 'chamber floors';
    const context = extractContextSentence(fullText, deletedSnippet);

    expect(context).toContain('Darkness crept across the chamber floors.');
  });

  it('handles edge case where snippet is not found by providing fallback slice', () => {
    const fullText = 'A fleeting thought that vanished into thin air.';
    const context = extractContextSentence(fullText, 'nonexistent');

    expect(context).toBeDefined();
    expect(context.length).toBeGreaterThan(0);
  });
});
