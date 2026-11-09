'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { useGhostStore } from '../store/ghostStore';
import { useGhostStats } from '../hooks/useGhostStats';
import {
  generateExhumedMarkdown,
  generateExhumedPlainText,
  downloadFile,
} from '../lib/exhumedExport';
import { X, Download, Copy, Check } from 'lucide-react';

const emptySubscribe = () => () => {};
const getNow = () => Date.now();

export const ExportModal: React.FC = () => {
  const showExport = useGhostStore((state) => state.settings.showExport);
  const toggleModal = useGhostStore((state) => state.toggleModal);
  const documentText = useGhostStore((state) => state.documentText);
  const ghosts = useGhostStore((state) => state.ghosts);
  const graveyard = useGhostStore((state) => state.graveyard);
  const stats = useGhostStats();

  const [activeTab, setActiveTab] = useState<'markdown' | 'text'>('markdown');
  const [copied, setCopied] = useState(false);
  const exportTime = useSyncExternalStore(emptySubscribe, getNow, () => 0);

  if (!showExport) return null;

  const exportData = {
    documentText,
    activeGhosts: ghosts.map((g) => ({
      text: g.text,
      type: g.type,
      createdAt: g.createdAt,
      contextSentence: g.contextSentence,
    })),
    graveyard,
    stats,
    exportedAt: exportTime,
  };

  const markdownContent = generateExhumedMarkdown(exportData);
  const plainTextContent = generateExhumedPlainText(exportData);
  const currentContent = activeTab === 'markdown' ? markdownContent : plainTextContent;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy export to clipboard:', err);
    }
  };

  const handleDownload = () => {
    if (activeTab === 'markdown') {
      downloadFile(markdownContent, 'exhumed-manuscript.md', 'text/markdown');
    } else {
      downloadFile(plainTextContent, 'exhumed-manuscript.txt', 'text/plain');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#11071c] border border-purple-900/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-purple-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-purple-900/50 flex items-center justify-between bg-[#0a0312]/95">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/80 text-rose-400">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-serif font-semibold text-base text-purple-100 flex items-center gap-2">
                Exhumed Export
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 font-mono">
                  Deleted Drafts Appendix
                </span>
              </h2>
              <p className="text-xs text-purple-400/70 font-serif italic">
                Package your final manuscript with everything you almost said attached
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleModal('showExport')}
            className="p-1.5 rounded-lg hover:bg-purple-900/40 text-purple-400 hover:text-purple-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#160924]/60 border-b border-purple-900/40">
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`px-3 py-1.5 rounded-xl font-serif transition-colors cursor-pointer ${
                activeTab === 'markdown'
                  ? 'bg-rose-950/80 text-rose-200 border border-rose-700/60 shadow-sm'
                  : 'bg-purple-950/40 text-purple-400 hover:text-purple-200'
              }`}
            >
              Markdown (.md)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-xl font-serif transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-rose-950/80 text-rose-200 border border-rose-700/60 shadow-sm'
                  : 'bg-purple-950/40 text-purple-400 hover:text-purple-200'
              }`}
            >
              Plain Text (.txt)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-200 text-xs font-serif transition-colors cursor-pointer border border-purple-800/50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-rose-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-800 to-rose-700 hover:from-purple-700 hover:to-rose-600 text-white font-serif text-xs transition-colors cursor-pointer shadow-md shadow-rose-950"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Live Preview Text Area */}
        <div className="p-6 flex-1 overflow-y-auto bg-[#0a0312]/80 font-mono text-xs text-purple-200/90 whitespace-pre-wrap leading-relaxed select-all">
          {currentContent}
        </div>
      </div>
    </div>
  );
};
