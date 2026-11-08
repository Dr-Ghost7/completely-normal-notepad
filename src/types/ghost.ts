export type GhostType = 'wisp' | 'word' | 'sentence' | 'regret' | 'poltergeist';

export interface Ghost {
  id: string;
  text: string;
  type: GhostType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  targetX?: number;
  targetY?: number;
  createdAt: number;
  characterCount: number;
  contextSentence: string;
  lifeSpanBeforeDeletionMs: number;
  opacity: number;
  scale: number;
  wobblePhase: number;
  isDragging?: boolean;
  isPossessing?: boolean;
  colorTheme: {
    text: string;
    glow: string;
    border: string;
    background: string;
  };
}

export interface DocumentSnapshot {
  id: string;
  timestamp: number;
  text: string;
  action: 'insert' | 'delete' | 'restore' | 'exorcise' | 'init';
  ghostSpawned?: Ghost;
  description: string;
}

export interface GraveyardRecord {
  id: string;
  text: string;
  type: GhostType;
  deletedAt: number;
  contextSentence: string;
  lifeSpanBeforeDeletionMs: number;
  wasRestored: boolean;
  wasExorcised: boolean;
}

export interface GhostStats {
  totalSpawned: number;
  totalExorcised: number;
  totalRestored: number;
  mostDeletedWords: { word: string; count: number }[];
  wordsKilledAndRetyped: { word: string; retypes: number }[];
  longestLingeringRegret: { text: string; durationMs: number } | null;
}

export interface EditorSettings {
  soundEnabled: boolean;
  volume: number;
  reducedMotion: boolean;
  candleFlicker: boolean;
  showGraveyard: boolean;
  showSeance: boolean;
  showExport: boolean;
  showShare: boolean;
  showTechInfo: boolean;
}
