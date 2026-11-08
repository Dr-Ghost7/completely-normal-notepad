import LZString from 'lz-string';
import { Ghost, GhostType } from '../types/ghost';

export interface SharePayload {
  v: number;
  text: string;
  ghosts: {
    id: string;
    text: string;
    type: GhostType;
    x: number;
    y: number;
    contextSentence: string;
    createdAt: number;
  }[];
}

/**
 * Encodes document text and active ghosts into a URL hash string.
 */
export function encodeShareableUrl(text: string, ghosts: Ghost[]): string {
  if (typeof window === 'undefined') return '';

  const payload: SharePayload = {
    v: 1,
    text,
    ghosts: ghosts.map((g) => ({
      id: g.id,
      text: g.text,
      type: g.type,
      x: Math.round(g.x),
      y: Math.round(g.y),
      contextSentence: g.contextSentence || '',
      createdAt: g.createdAt,
    })),
  };

  const jsonString = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  const origin = window.location.origin + window.location.pathname;
  return `${origin}#haunt=${compressed}`;
}

/**
 * Decodes the shareable payload from window.location.hash if present.
 */
export function decodeShareableUrl(): SharePayload | null {
  if (typeof window === 'undefined') return null;

  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('#haunt=')) return null;

    const compressed = hash.split('#haunt=')[1];
    if (!compressed) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;

    const parsed: SharePayload = JSON.parse(decompressed);
    if (!parsed || parsed.v !== 1) return null;

    return parsed;
  } catch (err) {
    console.warn('Failed to parse haunted share payload from URL hash:', err);
    return null;
  }
}
