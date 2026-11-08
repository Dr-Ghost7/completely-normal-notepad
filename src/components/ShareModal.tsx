'use client';

import React, { useState, useEffect } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { encodeShareableUrl } from '../lib/urlShare';
import { X, Share2, Copy, Check, ExternalLink, Ghost as GhostIcon } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const showShare = useGhostStore((state) => state.settings.showShare);
  const toggleModal = useGhostStore((state) => state.toggleModal);
  const documentText = useGhostStore((state) => state.documentText);
  const ghosts = useGhostStore((state) => state.ghosts);

  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (showShare) {
      const url = encodeShareableUrl(documentText, ghosts);
      setShareUrl(url);
    }
  }, [showShare, documentText, ghosts]);

  if (!showShare) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#11071c] border border-purple-900/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-purple-100">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between bg-[#0a0312]/95">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/80 text-rose-400">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif font-semibold text-base text-purple-100 flex items-center gap-2">
                Share a Haunted Page
              </h2>
              <p className="text-xs text-purple-400/70 font-serif italic">
                Generate a link that opens your manuscript with its wandering spirits still alive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleModal('showShare')}
            className="p-1.5 rounded-lg hover:bg-purple-900/40 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0a0312]/80 border border-purple-900/60 flex items-center gap-3">
            <GhostIcon className="w-8 h-8 text-rose-400 shrink-0 animate-bounce duration-1000" />
            <div className="text-xs space-y-1 font-serif">
              <p className="text-purple-100 font-medium">
                {ghosts.length > 0
                  ? `Your manuscript contains ${ghosts.length} wandering ghost${ghosts.length > 1 ? 's' : ''}.`
                  : 'Your manuscript is currently calm with 0 active ghosts.'}
              </p>
              <p className="text-purple-400/80">
                Anyone opening this link will see your exact document along with every ghost drifting in its current state.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-purple-400 font-mono">Haunted Note URL:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2 text-xs font-mono rounded-xl bg-[#0a0312] border border-purple-800 text-rose-300 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-800 to-rose-700 hover:from-purple-700 hover:to-rose-600 text-white font-serif text-xs transition-colors cursor-pointer shrink-0 shadow-md shadow-rose-950"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 text-xs font-serif">
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-purple-400 hover:text-rose-300 transition-colors"
            >
              <span>Test link in new tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
