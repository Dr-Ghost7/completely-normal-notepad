import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Ghost, GraveyardRecord, DocumentSnapshot, EditorSettings, GhostType, NotepadFont } from '../types/ghost';
import { getGhostTheme } from '../lib/ghostClassifier';
import { ghostAudio } from '../lib/ghostAudio';

interface GhostState {
  // Document state
  documentText: string;
  wordCount: number;

  // Paranormal entities
  ghosts: Ghost[];
  graveyard: GraveyardRecord[];
  totalRestored: number;
  totalExorcised: number;

  // Séance & History
  snapshots: DocumentSnapshot[];
  isReplaying: boolean;
  replayIndex: number;

  // Exorcism state
  isExorcising: boolean;
  exorcismProgress: number;

  // Possession
  possessingGhostId: string | null;

  // Settings & Modals
  settings: EditorSettings;

  // Actions
  setDocumentText: (text: string, action?: 'insert' | 'delete' | 'restore') => void;
  spawnGhost: (params: {
    text: string;
    type: GhostType;
    originX: number;
    originY: number;
    contextSentence: string;
    lifeSpanBeforeDeletionMs: number;
    fontFamily?: NotepadFont;
  }) => Ghost;
  spawnPoltergeistBurst: (params: {
    words: string[];
    originX: number;
    originY: number;
    contextSentence: string;
    lifeSpanBeforeDeletionMs: number;
    fontFamily?: NotepadFont;
  }) => void;
  updateGhostPositions: (newGhosts: Ghost[]) => void;
  restoreGhost: (ghostId: string, insertAtIndex?: number) => void;
  deleteGhostDirect: (ghostId: string) => void;
  setDraggingGhost: (ghostId: string | null) => void;

  // Exorcism actions
  startExorcism: () => void;
  updateExorcismProgress: (progress: number) => void;
  cancelExorcism: () => void;
  completeExorcism: () => void;

  // Possession actions
  triggerPossession: () => void;
  acceptPossession: (ghostId: string) => void;
  dismissPossession: (ghostId: string) => void;

  // Modals & UI toggles
  setSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  toggleModal: (modal: 'showGraveyard' | 'showSeance' | 'showExport' | 'showShare') => void;

  // Jar actions
  trapGhostInJar: (ghostId: string) => void;
  releaseGhostFromJar: (ghostId: string) => void;
  releaseAllJarGhosts: () => void;

  // Séance
  startSeance: () => void;
  setReplayIndex: (index: number) => void;
  stopSeance: () => void;

  // Share
  loadFromShare: (text: string, ghosts: Ghost[]) => void;
  resetAll: () => void;
  clearGraveyard: () => void;
}

const DEFAULT_SETTINGS: EditorSettings = {
  soundEnabled: false,
  volume: 0.6,
  reducedMotion: false,
  candleFlicker: true,
  fontFamily: 'gothic',
  themePreset: 'witching-hour',
  showJar: true,
  showGraveyard: false,
  showSeance: false,
  showExport: false,
  showShare: false,
};

const INITIAL_TEXT = 'A completely normal notepad, nothing weird.';

export const useGhostStore = create<GhostState>()(
  persist(
    (set, get) => ({
      documentText: INITIAL_TEXT,
      wordCount: INITIAL_TEXT.trim().split(/\s+/).filter(Boolean).length,
      ghosts: [],
      graveyard: [],
      totalRestored: 0,
      totalExorcised: 0,
      snapshots: [
        {
          id: 'initial',
          timestamp: 0,
          text: INITIAL_TEXT,
          action: 'init',
          description: 'Document initialized',
        },
      ],
      isReplaying: false,
      replayIndex: 0,
      isExorcising: false,
      exorcismProgress: 0,
      possessingGhostId: null,
      settings: DEFAULT_SETTINGS,

      setDocumentText: (text: string, action = 'insert') => {
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const snapshot: DocumentSnapshot = {
          id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: Date.now(),
          text,
          action,
          description: action === 'insert' ? 'Typed text' : action === 'delete' ? 'Deleted text' : 'Restored word',
        };

        set((state) => {
          // Keep up to 100 historical snapshots for the Séance replay
          const updatedSnapshots = [...state.snapshots, snapshot].slice(-100);
          return {
            documentText: text,
            wordCount: words,
            snapshots: updatedSnapshots,
          };
        });
      },

      spawnGhost: (params) => {
        const { text, type, originX, originY, contextSentence, lifeSpanBeforeDeletionMs, fontFamily } = params;
        const now = Date.now();

        // Safety deduplication guard: if an identical ghost at this origin was spawned < 350ms ago, drop duplicate
        const existingGhosts = get().ghosts;
        const recentDuplicate = existingGhosts.find(
          (g) =>
            g.text === text &&
            now - g.createdAt < 350 &&
            Math.hypot(g.originX - originX, g.originY - originY) < 30
        );

        if (recentDuplicate) {
          return recentDuplicate;
        }

        const id = `ghost-${now}-${Math.random().toString(36).slice(2, 7)}`;
        const theme = getGhostTheme(type);
        const activeFont = fontFamily || get().settings.fontFamily;

        // Random initial velocity based on type speed multiplier
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.5 + Math.random() * 0.8) * theme.speedMultiplier;
        const vx = Math.cos(angle) * speed;
        // Natural upward drift bias (ghosts rise off the page!)
        const vy = Math.sin(angle) * speed - (type === 'wisp' ? 0.8 : 0.4);

        const newGhost: Ghost = {
          id,
          text,
          type,
          x: originX,
          y: originY,
          vx,
          vy,
          originX,
          originY,
          createdAt: Date.now(),
          characterCount: text.length,
          contextSentence,
          lifeSpanBeforeDeletionMs,
          opacity: 0.85,
          scale: theme.baseScale,
          wobblePhase: Math.random() * Math.PI * 2,
          isTrappedInJar: false,
          colorTheme: {
            text: theme.text,
            glow: theme.glow,
            border: theme.border,
            background: theme.background,
          },
          fontFamily: activeFont,
        };

        const graveyardRecord: GraveyardRecord = {
          id,
          text,
          type,
          deletedAt: Date.now(),
          contextSentence,
          lifeSpanBeforeDeletionMs,
          wasRestored: false,
          wasExorcised: false,
        };

        // Sound effect
        const { soundEnabled, volume } = get().settings;
        if (soundEnabled) {
          ghostAudio.playSpawn(type, volume);
        }

        set((state) => ({
          ghosts: [...state.ghosts, newGhost],
          graveyard: [graveyardRecord, ...state.graveyard].slice(0, 200),
        }));

        return newGhost;
      },

      spawnPoltergeistBurst: (params) => {
        const { words, originX, originY, contextSentence, lifeSpanBeforeDeletionMs, fontFamily } = params;
        const now = Date.now();

        // Safety deduplication guard: prevent double poltergeist explosions within 400ms
        const recentPoltergeist = get().ghosts.find(
          (g) => g.type === 'poltergeist' && now - g.createdAt < 400
        );
        if (recentPoltergeist) {
          return;
        }

        const ghostsToAdd: Ghost[] = [];
        const graveyardToAdd: GraveyardRecord[] = [];
        const activeFont = fontFamily || get().settings.fontFamily;

        // Spawn explosive ring of words
        const count = Math.min(words.length, 24); // Cap max spawned at once for peak performance
        const theme = getGhostTheme('poltergeist');

        for (let i = 0; i < count; i++) {
          const word = words[i];
          if (!word.trim()) continue;

          const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          const burstSpeed = (1.5 + Math.random() * 2.0) * theme.speedMultiplier;
          const vx = Math.cos(angle) * burstSpeed;
          const vy = Math.sin(angle) * burstSpeed - 0.5;

          const id = `poltergeist-${now}-${i}`;
          const ghost: Ghost = {
            id,
            text: word,
            type: 'poltergeist',
            x: originX + (Math.random() - 0.5) * 40,
            y: originY + (Math.random() - 0.5) * 40,
            vx,
            vy,
            originX,
            originY,
            createdAt: now,
            characterCount: word.length,
            contextSentence,
            lifeSpanBeforeDeletionMs,
            opacity: 0.9,
            scale: 0.95 + Math.random() * 0.2,
            wobblePhase: Math.random() * Math.PI * 2,
            isTrappedInJar: false,
            colorTheme: {
              text: theme.text,
              glow: theme.glow,
              border: theme.border,
              background: theme.background,
            },
            fontFamily: activeFont,
          };

          ghostsToAdd.push(ghost);
          graveyardToAdd.push({
            id,
            text: word,
            type: 'poltergeist',
            deletedAt: now,
            contextSentence,
            lifeSpanBeforeDeletionMs,
            wasRestored: false,
            wasExorcised: false,
          });
        }

        const { soundEnabled, volume } = get().settings;
        if (soundEnabled) {
          ghostAudio.playSpawn('poltergeist', volume);
        }

        set((state) => ({
          ghosts: [...state.ghosts, ...ghostsToAdd],
          graveyard: [...graveyardToAdd, ...state.graveyard].slice(0, 200),
        }));
      },

      updateGhostPositions: (newGhosts: Ghost[]) => {
        set({ ghosts: newGhosts });
      },

      restoreGhost: (ghostId: string, insertAtIndex?: number) => {
        const state = get();
        const ghost = state.ghosts.find((g) => g.id === ghostId);
        if (!ghost) return;

        let newText = state.documentText;
        if (typeof insertAtIndex === 'number' && insertAtIndex >= 0 && insertAtIndex <= newText.length) {
          // Add spacing if needed
          const before = newText.slice(0, insertAtIndex);
          const after = newText.slice(insertAtIndex);
          const needsSpaceBefore = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n');
          const needsSpaceAfter = after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n');
          newText = `${before}${needsSpaceBefore ? ' ' : ''}${ghost.text}${needsSpaceAfter ? ' ' : ''}${after}`;
        } else {
          // Append to end with a space
          newText = newText ? `${newText} ${ghost.text}` : ghost.text;
        }

        // Play chime sound
        const { soundEnabled, volume } = state.settings;
        if (soundEnabled) {
          ghostAudio.playRestore(volume);
        }

        // Update graveyard record
        const updatedGraveyard = state.graveyard.map((r) =>
          r.id === ghostId ? { ...r, wasRestored: true } : r
        );

        set({
          documentText: newText,
          ghosts: state.ghosts.filter((g) => g.id !== ghostId),
          graveyard: updatedGraveyard,
          totalRestored: state.totalRestored + 1,
          possessingGhostId: state.possessingGhostId === ghostId ? null : state.possessingGhostId,
        });

        // Add snapshot
        get().setDocumentText(newText, 'restore');
      },

      deleteGhostDirect: (ghostId: string) => {
        set((state) => ({
          ghosts: state.ghosts.filter((g) => g.id !== ghostId),
        }));
      },

      setDraggingGhost: (ghostId: string | null) => {
        const { soundEnabled, volume } = get().settings;
        if (ghostId && soundEnabled) {
          ghostAudio.playCatch(volume);
        }
        set((state) => ({
          ghosts: state.ghosts.map((g) => ({
            ...g,
            isDragging: g.id === ghostId,
          })),
        }));
      },

      startExorcism: () => {
        const { soundEnabled, volume } = get().settings;
        if (soundEnabled) {
          ghostAudio.startExorcismVortex(volume);
        }
        set({ isExorcising: true, exorcismProgress: 0 });
      },

      updateExorcismProgress: (progress: number) => {
        const { soundEnabled } = get().settings;
        if (soundEnabled) {
          ghostAudio.updateExorcismProgress(progress);
        }
        set({ exorcismProgress: progress });
      },

      cancelExorcism: () => {
        ghostAudio.stopExorcismVortex();
        set({ isExorcising: false, exorcismProgress: 0 });
      },

      completeExorcism: () => {
        const state = get();
        const ghostCount = state.ghosts.length;
        const { soundEnabled, volume } = state.settings;

        if (soundEnabled) {
          ghostAudio.playExorcismComplete(volume);
        }

        const updatedGraveyard = state.graveyard.map((r) => {
          if (state.ghosts.some((g) => g.id === r.id)) {
            return { ...r, wasExorcised: true };
          }
          return r;
        });

        set({
          ghosts: [],
          graveyard: updatedGraveyard,
          totalExorcised: state.totalExorcised + ghostCount,
          isExorcising: false,
          exorcismProgress: 0,
          possessingGhostId: null,
        });
      },

      triggerPossession: () => {
        const state = get();
        if (state.ghosts.length === 0 || state.possessingGhostId) return;

        // Pick a random non-dragging ghost to possess
        const available = state.ghosts.filter((g) => !g.isDragging);
        if (available.length === 0) return;

        const victim = available[Math.floor(Math.random() * available.length)];
        set({ possessingGhostId: victim.id });
      },

      acceptPossession: (ghostId: string) => {
        get().restoreGhost(ghostId);
      },

      dismissPossession: (ghostId: string) => {
        set((state) => ({
          possessingGhostId: state.possessingGhostId === ghostId ? null : state.possessingGhostId,
        }));
      },

      setSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
      },

      toggleModal: (modal) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [modal]: !state.settings[modal],
          },
        }));
      },

      trapGhostInJar: (ghostId: string) => {
        const { soundEnabled, volume } = get().settings;
        if (soundEnabled) {
          ghostAudio.playGlassClink(volume);
        }
        set((state) => ({
          ghosts: state.ghosts.map((g) =>
            g.id === ghostId ? { ...g, isTrappedInJar: true } : g
          ),
        }));
      },

      releaseGhostFromJar: (ghostId: string) => {
        set((state) => ({
          ghosts: state.ghosts.map((g) =>
            g.id === ghostId
              ? {
                  ...g,
                  isTrappedInJar: false,
                  vx: (Math.random() - 0.5) * 60,
                  vy: (Math.random() - 0.5) * 60,
                }
              : g
          ),
        }));
      },

      releaseAllJarGhosts: () => {
        const { soundEnabled, volume } = get().settings;
        if (soundEnabled) {
          ghostAudio.playSpawn('wisp', volume);
        }
        set((state) => ({
          ghosts: state.ghosts.map((g) =>
            g.isTrappedInJar
              ? {
                  ...g,
                  isTrappedInJar: false,
                  vx: (Math.random() - 0.5) * 60,
                  vy: (Math.random() - 0.5) * 60,
                }
              : g
          ),
        }));
      },

      startSeance: () => {
        set((state) => ({
          isReplaying: true,
          replayIndex: state.snapshots.length - 1,
        }));
      },

      setReplayIndex: (index: number) => {
        set({ replayIndex: index });
      },

      stopSeance: () => {
        set({ isReplaying: false });
      },

      loadFromShare: (text: string, ghosts: Ghost[]) => {
        set({
          documentText: text,
          ghosts,
        });
      },

      resetAll: () => {
        set({
          documentText: '',
          wordCount: 0,
          ghosts: [],
          graveyard: [],
          totalRestored: 0,
          totalExorcised: 0,
          snapshots: [],
          possessingGhostId: null,
        });
      },

      clearGraveyard: () => {
        set({
          graveyard: [],
          totalRestored: 0,
          totalExorcised: 0,
        });
      },
    }),
    {
      name: 'completely-normal-notepad-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { documentText?: string };
        if (!version || version < 2) {
          if (
            !state.documentText ||
            state.documentText.includes('Nothing unusual here') ||
            state.documentText.includes('Completely normal notepad.')
          ) {
            state.documentText = INITIAL_TEXT;
          }
        }
        return state;
      },
      partialize: (state) => ({
        documentText: state.documentText,
        ghosts: state.ghosts,
        graveyard: state.graveyard,
        totalRestored: state.totalRestored,
        totalExorcised: state.totalExorcised,
        settings: state.settings,
      }),
    }
  )
);
