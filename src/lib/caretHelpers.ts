/**
 * Helper utilities to compute character index in contenteditable DOM trees
 * and find caret offsets from viewport screen coordinates (x, y).
 */

export function calculateCharacterOffset(
  root: Node,
  targetNode: Node,
  targetOffset: number
): number {
  let charCount = 0;
  let found = false;

  function traverse(currentNode: Node) {
    if (found) return;

    if (currentNode === targetNode) {
      if (currentNode.nodeType === Node.TEXT_NODE) {
        charCount += targetOffset;
      }
      found = true;
      return;
    }

    if (currentNode.nodeType === Node.TEXT_NODE) {
      charCount += (currentNode.textContent || '').length;
    } else {
      for (let i = 0; i < currentNode.childNodes.length; i++) {
        traverse(currentNode.childNodes[i]);
        if (found) return;
      }
    }
  }

  traverse(root);
  return charCount;
}

/**
 * Resolves character insertion index from viewport coordinates.
 * Supports standard caretPositionFromPoint with fallback to caretRangeFromPoint.
 */
export function getCaretOffsetFromPoint(
  x: number,
  y: number,
  editorEl: HTMLElement
): number | null {
  if (typeof document === 'undefined') return null;

  // Modern standard (Firefox, latest Chromium)
  if ('caretPositionFromPoint' in document) {
    const pos = (document as Document & {
      caretPositionFromPoint: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    }).caretPositionFromPoint(x, y);

    if (pos && pos.offsetNode && editorEl.contains(pos.offsetNode)) {
      return calculateCharacterOffset(editorEl, pos.offsetNode, pos.offset);
    }
  }

  // WebKit / Chromium legacy API
  if ('caretRangeFromPoint' in document) {
    const range = (document as Document & {
      caretRangeFromPoint: (x: number, y: number) => Range | null;
    }).caretRangeFromPoint(x, y);

    if (range && editorEl.contains(range.startContainer)) {
      return calculateCharacterOffset(editorEl, range.startContainer, range.startOffset);
    }
  }

  return null;
}

/**
 * Extracts a surrounding sentence or snippet from a document given a character offset or text slice.
 */
export function extractContextSentence(fullText: string, deletedSnippet: string): string {
  if (!fullText || !deletedSnippet) return '';

  const index = fullText.indexOf(deletedSnippet);
  if (index === -1) {
    return fullText.slice(0, 80);
  }

  // Find boundaries of sentence or line
  const start = Math.max(0, fullText.lastIndexOf('.', index) + 1);
  let end = fullText.indexOf('.', index + deletedSnippet.length);
  if (end === -1) end = fullText.length;

  const snippet = fullText.slice(start, end + 1).trim();
  return snippet || fullText.slice(Math.max(0, index - 30), Math.min(fullText.length, index + deletedSnippet.length + 30));
}
