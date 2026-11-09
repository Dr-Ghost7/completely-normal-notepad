import { describe, it, expect, beforeEach } from 'vitest';
import { useGhostStore } from './ghostStore';

describe('Ghost Store Deduplication', () => {
  beforeEach(() => {
    // Reset store state between tests
    useGhostStore.setState({
      ghosts: [],
      graveyard: [],
    });
  });

  it('spawns a ghost on first request', () => {
    const store = useGhostStore.getState();
    const g = store.spawnGhost({
      text: 'phantom',
      type: 'word',
      originX: 100,
      originY: 200,
      contextSentence: 'A phantom appeared in the mist.',
      lifeSpanBeforeDeletionMs: 1200,
    });

    expect(g).toBeDefined();
    expect(useGhostStore.getState().ghosts.length).toBe(1);
    expect(useGhostStore.getState().ghosts[0].text).toBe('phantom');
  });

  it('rejects rapid duplicate ghost spawn requests for the same text at the same coordinates', () => {
    const store = useGhostStore.getState();

    // First deletion
    store.spawnGhost({
      text: 'phantom',
      type: 'word',
      originX: 100,
      originY: 200,
      contextSentence: 'A phantom appeared in the mist.',
      lifeSpanBeforeDeletionMs: 1200,
    });

    // Immediate duplicate firing (e.g. companion beforeinput or refocused event delay)
    store.spawnGhost({
      text: 'phantom',
      type: 'word',
      originX: 100,
      originY: 200,
      contextSentence: 'A phantom appeared in the mist.',
      lifeSpanBeforeDeletionMs: 1200,
    });

    // Ghost count must strictly remain 1
    expect(useGhostStore.getState().ghosts.length).toBe(1);
  });

  it('allows distinct deletions of different text or different positions', () => {
    const store = useGhostStore.getState();

    // Char 1
    store.spawnGhost({
      text: 'a',
      type: 'wisp',
      originX: 150,
      originY: 200,
      contextSentence: 'cat',
      lifeSpanBeforeDeletionMs: 500,
    });

    // Char 2 at a different position (e.g. previous character)
    store.spawnGhost({
      text: 'c',
      type: 'wisp',
      originX: 135,
      originY: 200,
      contextSentence: 'cat',
      lifeSpanBeforeDeletionMs: 600,
    });

    // Both distinct deletions should be spawned
    expect(useGhostStore.getState().ghosts.length).toBe(2);
  });

  it('rejects duplicate poltergeist bursts within 400ms', () => {
    const store = useGhostStore.getState();

    store.spawnPoltergeistBurst({
      words: ['ancient', 'tales', 'echo', 'forever'],
      originX: 250,
      originY: 300,
      contextSentence: 'ancient tales echo forever',
      lifeSpanBeforeDeletionMs: 4000,
    });

    const initialGhostCount = useGhostStore.getState().ghosts.length;
    expect(initialGhostCount).toBeGreaterThan(0);

    // Duplicate burst call
    store.spawnPoltergeistBurst({
      words: ['ancient', 'tales', 'echo', 'forever'],
      originX: 250,
      originY: 300,
      contextSentence: 'ancient tales echo forever',
      lifeSpanBeforeDeletionMs: 4000,
    });

    // Must not double the poltergeist ghosts
    expect(useGhostStore.getState().ghosts.length).toBe(initialGhostCount);
  });
});
