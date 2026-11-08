import { useMemo } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { computeGraveyardStats } from '../lib/graveyardStats';
import { GhostStats } from '../types/ghost';

/**
 * Custom hook to safely compute Graveyard statistics using useMemo.
 * Avoids instantiating new objects in external store snapshots,
 * fully adhering to React 19 useSyncExternalStore getServerSnapshot caching rules.
 */
export function useGhostStats(): GhostStats {
  const graveyard = useGhostStore((state) => state.graveyard);
  const documentText = useGhostStore((state) => state.documentText);
  const totalRestored = useGhostStore((state) => state.totalRestored);
  const totalExorcised = useGhostStore((state) => state.totalExorcised);

  return useMemo(
    () => computeGraveyardStats(graveyard, documentText, totalRestored, totalExorcised),
    [graveyard, documentText, totalRestored, totalExorcised]
  );
}

/**
 * Custom hook to compute haunting intensity level (0 to 10).
 * If there are 0 active spirits on screen (e.g. after exorcism or on a clean page),
 * intensity is strictly 0.
 */
export function useHauntingIntensity(): number {
  const ghostCount = useGhostStore((state) => state.ghosts.length);

  return useMemo(() => {
    if (ghostCount === 0) return 0;
    return Math.min(10, ghostCount);
  }, [ghostCount]);
}
