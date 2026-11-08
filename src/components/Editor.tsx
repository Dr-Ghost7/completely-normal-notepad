'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { classifyGhost } from '../lib/ghostClassifier';
import { getCaretOffsetFromPoint, extractContextSentence } from '../lib/caretHelpers';
import { Sparkles, X, Check, Ghost as GhostIcon } from 'lucide-react';

interface EditorProps {
  onGhostDropped?: (ghostId: string, charIndex: number) => void;
  dropTargetOffset: number | null;
  setDropTargetOffset: (offset: number | null) => void;
}

export const Editor: React.FC<EditorProps> = ({
  dropTargetOffset,
  setDropTargetOffset,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const documentText = useGhostStore((state) => state.documentText);
  const setDocumentText = useGhostStore((state) => state.setDocumentText);
  const spawnGhost = useGhostStore((state) => state.spawnGhost);
  const spawnPoltergeistBurst = useGhostStore((state) => state.spawnPoltergeistBurst);
  const possessingGhostId = useGhostStore((state) => state.possessingGhostId);
  const ghosts = useGhostStore((state) => state.ghosts);
  const acceptPossession = useGhostStore((state) => state.acceptPossession);
  const dismissPossession = useGhostStore((state) => state.dismissPossession);
  const triggerPossession = useGhostStore((state) => state.triggerPossession);
  const settings = useGhostStore((state) => state.settings);
  const setSetting = useGhostStore((state) => state.setSetting);

  const lastTypeTimeRef = useRef<number>(0);
  const textBirthTimesRef = useRef<Map<string, number>>(new Map());
  const isInternalUpdateRef = useRef<boolean>(false);
  const lastDeletionTimestampRef = useRef<number>(0);

  useEffect(() => {
    lastTypeTimeRef.current = Date.now();
  }, []);

  // Sync state into contenteditable when changed externally (e.g. from restore, share, or reset)
  useEffect(() => {
    if (editorRef.current && !isInternalUpdateRef.current) {
      if (editorRef.current.innerText !== documentText) {
        editorRef.current.innerText = documentText;
      }
    }
    isInternalUpdateRef.current = false;
  }, [documentText]);

  // Periodic random possession attempt (every 40s if spirits are active)
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() < 0.6) {
        triggerPossession();
      }
    }, 40000);
    return () => clearInterval(timer);
  }, [triggerPossession]);

  /**
   * Unified Deletion Processor
   * Spawns the appropriate ghost archetype based on what was deleted and where on screen.
   */
  const processDeletion = useCallback(
    (rawDeletedSnippet: string, rangeOrRect: Range | DOMRect | null) => {
      const now = Date.now();
      // Debounce rapid duplicate event firings (e.g. keydown + beforeinput for the same keystroke)
      if (now - lastDeletionTimestampRef.current < 45) {
        return;
      }
      lastDeletionTimestampRef.current = now;

      const trimmedSnippet = rawDeletedSnippet.trim();
      if (!trimmedSnippet || trimmedSnippet.length === 0) {
        return;
      }

      const editor = editorRef.current;
      if (!editor) return;

      const editorRect = editor.getBoundingClientRect();

      // Compute exact viewport coordinates where the text was located
      let originX = 0;
      let originY = 0;

      if (rangeOrRect) {
        if ('getBoundingClientRect' in rangeOrRect) {
          const rect = rangeOrRect.getBoundingClientRect();
          if (rect.width > 0 || rect.height > 0) {
            originX = rect.left + rect.width / 2;
            originY = rect.top + rect.height / 2;
          } else {
            const clientRects = rangeOrRect.getClientRects();
            if (clientRects.length > 0) {
              originX = clientRects[0].left + clientRects[0].width / 2;
              originY = clientRects[0].top + clientRects[0].height / 2;
            }
          }
        } else if ('left' in rangeOrRect && 'top' in rangeOrRect) {
          originX = rangeOrRect.left + rangeOrRect.width / 2;
          originY = rangeOrRect.top + rangeOrRect.height / 2;
        }
      }

      // Safe coordinate fallback: near the center/cursor of the editor
      if (
        !originX ||
        !originY ||
        originX < 0 ||
        originY < 0 ||
        originX > window.innerWidth ||
        originY > window.innerHeight
      ) {
        originX = editorRect.left + 140 + Math.random() * 80;
        originY = editorRect.top + 160 + Math.random() * 60;
      }

      const currentFullText = editor.innerText || '';
      const docLength = currentFullText.length;

      // Check if entire document or select-all was deleted
      const isSelectAll =
        docLength > 15 &&
        trimmedSnippet.length >= Math.floor(docLength * 0.75);

      const timeSinceLastTypeMs = now - lastTypeTimeRef.current;

      // Track how long this snippet existed
      const birthTime = textBirthTimesRef.current.get(trimmedSnippet) || (now - 3000);
      const textAgeMs = now - birthTime;

      const ghostType = classifyGhost({
        text: trimmedSnippet,
        totalDocLength: docLength,
        isSelectAll,
        timeSinceLastTypeMs,
        textAgeMs,
      });

      const contextSentence = extractContextSentence(currentFullText, trimmedSnippet);

      if (ghostType === 'poltergeist') {
        const words = trimmedSnippet.split(/\s+/).filter(Boolean);
        spawnPoltergeistBurst({
          words,
          originX,
          originY,
          contextSentence,
          lifeSpanBeforeDeletionMs: textAgeMs,
        });
      } else {
        spawnGhost({
          text: trimmedSnippet,
          type: ghostType,
          originX,
          originY,
          contextSentence,
          lifeSpanBeforeDeletionMs: textAgeMs,
        });
      }
    },
    [classifyGhost, spawnGhost, spawnPoltergeistBurst]
  );

  /**
   * Listen to native beforeinput directly on the DOM node.
   * This bypasses React's synthetic event system which historically filters out deletion inputTypes.
   */
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onNativeBeforeInput = (e: Event) => {
      const inputEvent = e as InputEvent;
      const inputType = inputEvent.inputType || '';

      const isDelete =
        inputType.startsWith('delete') ||
        inputType === 'deleteContentBackward' ||
        inputType === 'deleteContentForward' ||
        inputType === 'deleteWordBackward' ||
        inputType === 'deleteWordForward' ||
        inputType === 'deleteByCut';

      if (!isDelete) {
        lastTypeTimeRef.current = Date.now();
        return;
      }

      let deletedSnippet = '';
      let targetRange: Range | null = null;

      const targetRanges = inputEvent.getTargetRanges?.();
      if (targetRanges && targetRanges.length > 0) {
        const staticRange = targetRanges[0];
        targetRange = document.createRange();
        targetRange.setStart(staticRange.startContainer, staticRange.startOffset);
        targetRange.setEnd(staticRange.endContainer, staticRange.endOffset);
        deletedSnippet = targetRange.toString();
      } else {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const selRange = sel.getRangeAt(0);
          if (!selRange.collapsed) {
            targetRange = selRange.cloneRange();
            deletedSnippet = targetRange.toString();
          }
        }
      }

      if (deletedSnippet && deletedSnippet.trim().length > 0) {
        processDeletion(deletedSnippet, targetRange);
      }
    };

    editor.addEventListener('beforeinput', onNativeBeforeInput);
    return () => editor.removeEventListener('beforeinput', onNativeBeforeInput);
  }, [processDeletion]);

  /**
   * Keydown deletion handler as an airtight companion for Backspace and Delete keys.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle possession shortcuts
    if (possessingGhostId) {
      if (e.key === 'Tab') {
        e.preventDefault();
        acceptPossession(possessingGhostId);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        dismissPossession(possessingGhostId);
        return;
      }
    }

    // Capture deletions on Backspace or Delete
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      let deletedSnippet = '';
      let rangeToMeasure: Range | null = null;

      if (!range.collapsed) {
        // User highlighted a word, sentence, or entire manuscript and deleted it!
        deletedSnippet = range.toString();
        rangeToMeasure = range.cloneRange();
      } else if (e.key === 'Backspace') {
        const node = range.startContainer;
        const offset = range.startOffset;

        if (node.nodeType === Node.TEXT_NODE && offset > 0) {
          const content = node.textContent || '';
          if (e.ctrlKey || e.altKey) {
            // Word deletion (Ctrl + Backspace)
            const before = content.slice(0, offset);
            const match = before.match(/(\S+)\s*$/);
            deletedSnippet = match ? match[0] : before.slice(-1);
            const r = document.createRange();
            r.setStart(node, Math.max(0, offset - deletedSnippet.length));
            r.setEnd(node, offset);
            rangeToMeasure = r;
          } else {
            // Single character backspaced (Wisps!)
            deletedSnippet = content.slice(offset - 1, offset);
            const r = document.createRange();
            r.setStart(node, offset - 1);
            r.setEnd(node, offset);
            rangeToMeasure = r;
          }
        }
      } else if (e.key === 'Delete') {
        const node = range.startContainer;
        const offset = range.startOffset;
        if (node.nodeType === Node.TEXT_NODE) {
          const content = node.textContent || '';
          if (offset < content.length) {
            deletedSnippet = content.slice(offset, offset + 1);
            const r = document.createRange();
            r.setStart(node, offset);
            r.setEnd(node, offset + 1);
            rangeToMeasure = r;
          }
        }
      }

      if (deletedSnippet && deletedSnippet.trim().length > 0) {
        processDeletion(deletedSnippet, rangeToMeasure);
      }
    }
  };

  /**
   * Handle text changes from typing or pasting.
   */
  const handleInput = () => {
    if (!editorRef.current) return;
    const newText = editorRef.current.innerText || '';
    isInternalUpdateRef.current = true;
    setDocumentText(newText, 'insert');

    // Notify caret activity to scatter nearby ghosts
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.top > 0) {
        window.dispatchEvent(
          new CustomEvent('editor-caret-activity', {
            detail: { x: rect.left, y: rect.top, action: 'type' },
          })
        );
      }
    }

    // Record creation timestamp for newly typed words
    const words = newText.split(/\s+/).filter(Boolean);
    const now = Date.now();
    words.forEach((w) => {
      if (!textBirthTimesRef.current.has(w)) {
        textBirthTimesRef.current.set(w, now);
      }
    });
  };

  /**
   * Intercept paste to strip rich formatting and maintain clean plain-text line breaks.
   */
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plainText = e.clipboardData.getData('text/plain');
    if (!plainText) return;

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(plainText);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    handleInput();
  };

  /**
   * Handle cut events (Ctrl + X)
   */
  const handleCut = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const text = range.toString();
      if (text && text.trim().length > 0) {
        processDeletion(text, range);
      }
    }
  };

  const notifyCaretMove = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      if (rect.top > 0) {
        window.dispatchEvent(
          new CustomEvent('editor-caret-activity', {
            detail: { x: rect.left, y: rect.top, action: 'move' },
          })
        );
      }
    }
  };

  const possessingGhost = ghosts.find((g) => g.id === possessingGhostId);

  const fontClass =
    settings.fontFamily === 'typewriter'
      ? 'font-typewriter text-sm sm:text-base leading-8'
      : settings.fontFamily === 'script'
      ? 'font-script text-xl sm:text-2xl leading-8'
      : settings.fontFamily === 'modern'
      ? 'font-modern text-base sm:text-lg leading-8'
      : 'font-gothic text-base sm:text-lg leading-8';

  return (
    <div className="relative w-full max-w-4xl mx-auto my-6 px-4">
      {/* Possession Haunting Floating Prompt */}
      {possessingGhost && (
        <div className="mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-rose-950/90 to-purple-950/90 border border-rose-500/60 shadow-xl shadow-rose-950/40 backdrop-blur-md flex items-center justify-between text-xs text-rose-200 animate-bounce duration-1000">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>
              A wandering spirit seeks rest in your manuscript:{' '}
              <strong className="text-white underline decoration-rose-400 font-serif">
                "{possessingGhost.text}"
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => acceptPossession(possessingGhost.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-serif font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept [Tab]</span>
            </button>
            <button
              type="button"
              onClick={() => dismissPossession(possessingGhost.id)}
              className="p-1 rounded-lg hover:bg-purple-900/60 text-purple-300 hover:text-white transition-colors cursor-pointer"
              title="Dismiss [Esc]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* The Physical Haunted Grimoire / Manuscript Surface */}
      <div className="relative rounded-3xl shadow-2xl shadow-purple-950/70 overflow-hidden border border-purple-800/40 bg-[#12071c]">
        {/* Notebook top binding bar (authentic stationery detailing + font selector) */}
        <div className="h-9 bg-[#180924] border-b border-purple-900/60 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-950 border border-purple-800/80" />
            <div className="w-2 h-2 rounded-full bg-purple-950 border border-purple-800/80" />
            <div className="w-2 h-2 rounded-full bg-purple-950 border border-purple-800/80" />
            <span className="text-[10px] font-mono text-purple-400/80 uppercase tracking-widest ml-1 hidden sm:inline">
              Completely Normal Notepad &bull; No. 404
            </span>
          </div>

          {/* Quick Font Selector Pill */}
          <div className="flex items-center gap-1 bg-black/40 px-1 py-0.5 rounded-lg border border-purple-900/60">
            {(['gothic', 'typewriter', 'script', 'modern'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSetting('fontFamily', f)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                  settings.fontFamily === f
                    ? 'bg-purple-800 text-white font-bold shadow-sm'
                    : 'text-purple-400/70 hover:text-purple-200'
                }`}
                title={`Switch font to ${f}`}
              >
                {f === 'gothic' ? 'Gothic' : f === 'typewriter' ? 'Type' : f === 'script' ? 'Script' : 'Sans'}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-purple-300/80">
            {documentText.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        {/* contenteditable editing surface with ruled lines */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          onInput={handleInput}
          onPaste={handlePaste}
          onCut={handleCut}
          onKeyDown={handleKeyDown}
          onKeyUp={notifyCaretMove}
          onClick={notifyCaretMove}
          aria-label="Completely Normal Notepad Editor"
          className={`paper-lined min-h-[560px] w-full p-8 pl-18 sm:pl-20 text-purple-100 focus:outline-none tracking-normal selection:bg-rose-900/60 selection:text-white cursor-text transition-all duration-300 ${fontClass}`}
        />

        {/* Drop target ghost indicator indicator */}
        {dropTargetOffset !== null && (
          <div
            className="pointer-events-none absolute left-0 right-0 top-12 px-6 py-1.5 bg-rose-950/90 text-rose-200 text-xs font-serif border-y border-rose-600/50 flex items-center gap-2 shadow-lg"
            aria-live="polite"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            <span>Drop spirit to anchor text at character offset {dropTargetOffset}</span>
          </div>
        )}
      </div>

      {/* Sleek bottom control bar */}
      <div className="mt-3 px-3 flex items-center justify-between gap-3 text-[11px] text-purple-400/60 font-serif">
        <span className="italic">
          Deleted words rise as wandering spirits &bull; Catch &amp; drag to re-anchor into text
        </span>
        <button
          type="button"
          onClick={() => {
            const words = ['haunted', 'phantom', 'whisper', 'spectral', 'shadow', 'requiem', 'crimson'];
            const randomWord = words[Math.floor(Math.random() * words.length)];
            spawnGhost({
              text: randomWord,
              type: 'word',
              originX: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
              originY: 260 + (Math.random() - 0.5) * 80,
              contextSentence: `Sample sentence containing ${randomWord}`,
              lifeSpanBeforeDeletionMs: 2500,
            });
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-rose-950/80 text-purple-300 hover:text-rose-200 border border-purple-800/50 hover:border-rose-600/60 transition-all cursor-pointer shadow-sm text-xs font-serif shrink-0"
          title="Spawn a ghost immediately to test"
        >
          <GhostIcon className="w-3.5 h-3.5 text-rose-400" />
          <span>Summon Spirit</span>
        </button>
      </div>
    </div>
  );
};
