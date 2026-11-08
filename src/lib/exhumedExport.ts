import { GraveyardRecord, GhostStats } from '../types/ghost';

interface ExportData {
  documentText: string;
  activeGhosts: { text: string; type: string; createdAt: number; contextSentence: string }[];
  graveyard: GraveyardRecord[];
  stats: GhostStats;
  exportedAt: number;
}

/**
 * Builds a beautifully formatted Markdown document containing the active text
 * and the "Exhumed Echoes / Deleted Drafts" appendix with footnotes of everything almost said.
 */
export function generateExhumedMarkdown(data: ExportData): string {
  const { documentText, activeGhosts, graveyard, stats, exportedAt } = data;
  const dateStr = new Date(exportedAt).toLocaleString();

  let markdown = `# Completely Normal Document\n`;
  markdown += `*Nothing unusual here. Recorded on ${dateStr}*\n\n`;
  markdown += `---\n\n`;
  markdown += `## Document Text\n\n`;
  markdown += `${documentText || '*(Empty page)*'}\n\n`;

  markdown += `---\n\n`;
  markdown += `## Appendix: Exhumed Echoes & Deleted Drafts\n\n`;
  markdown += `> *"Every erased word leaves a ghost in the paper grain. Here are the things you almost said."*\n\n`;

  if (activeGhosts.length > 0) {
    markdown += `### Currently Wandering Spirits (${activeGhosts.length})\n\n`;
    activeGhosts.forEach((g, idx) => {
      markdown += `${idx + 1}. **"${g.text}"** — *${g.type.toUpperCase()}*\n`;
      if (g.contextSentence) {
        markdown += `   - Severed from: *"...${g.contextSentence.trim()}..."*\n`;
      }
      markdown += `   - Wandering since: ${new Date(g.createdAt).toLocaleTimeString()}\n\n`;
    });
  }

  if (graveyard.length > 0) {
    markdown += `### The Cemetery Records (Total Ghosts: ${graveyard.length})\n\n`;
    markdown += `| Erased Text | Archetype | Origin Sentence | Fate |\n`;
    markdown += `| :--- | :--- | :--- | :--- |\n`;

    graveyard.forEach((item) => {
      const sanitizedText = item.text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const originSnippet = item.contextSentence
        ? item.contextSentence.slice(0, 45).replace(/\|/g, '\\|').replace(/\n/g, ' ') + '...'
        : 'Unknown snippet';
      const fate = item.wasRestored
        ? 'Restored back into manuscript'
        : item.wasExorcised
        ? 'Exorcised into the ether'
        : 'Still haunting';

      markdown += `| **"${sanitizedText}"** | \`${item.type}\` | *${originSnippet}* | ${fate} |\n`;
    });
    markdown += `\n`;
  }

  markdown += `### Ghostly Statistics\n\n`;
  markdown += `- **Total Ghosts Manifested:** ${stats.totalSpawned}\n`;
  markdown += `- **Souls Restored into Writing:** ${stats.totalRestored}\n`;
  markdown += `- **Spirits Exorcised:** ${stats.totalExorcised}\n`;

  if (stats.mostDeletedWords.length > 0) {
    markdown += `- **Most Deleted Word:** "${stats.mostDeletedWords[0].word}" (${stats.mostDeletedWords[0].count} times)\n`;
  }

  if (stats.longestLingeringRegret) {
    const seconds = Math.round(stats.longestLingeringRegret.durationMs / 1000);
    markdown += `- **Longest Lingering Regret:** "${stats.longestLingeringRegret.text}" (contemplated for ${seconds}s before being struck)\n`;
  }

  return markdown;
}

/**
 * Builds a plain text file version of the document and deleted fragments.
 */
export function generateExhumedPlainText(data: ExportData): string {
  const { documentText, activeGhosts, graveyard, stats, exportedAt } = data;
  const dateStr = new Date(exportedAt).toLocaleString();

  let text = `=======================================================\n`;
  text += `COMPLETELY NORMAL NOTEPAD - EXHUMED EXPORT\n`;
  text += `Exported: ${dateStr}\n`;
  text += `=======================================================\n\n`;

  text += `--- DOCUMENT TEXT ---\n\n`;
  text += `${documentText || '(Empty document)'}\n\n`;

  text += `-------------------------------------------------------\n`;
  text += `--- EXHUMED ECHOES (DELETED DRAFTS & GHOSTS) ---\n`;
  text += `-------------------------------------------------------\n\n`;

  if (activeGhosts.length > 0) {
    text += `[Active Ghosts Still Haunting: ${activeGhosts.length}]\n`;
    activeGhosts.forEach((g) => {
      text += ` - "${g.text}" (${g.type})\n`;
      if (g.contextSentence) {
        text += `   Origin context: "...${g.contextSentence.trim()}..."\n`;
      }
    });
    text += `\n`;
  }

  if (graveyard.length > 0) {
    text += `[All Time Deletion Log: ${graveyard.length} items]\n`;
    graveyard.forEach((item, idx) => {
      const status = item.wasRestored ? '[RESTORED]' : item.wasExorcised ? '[EXORCISED]' : '[LOST]';
      text += ` ${idx + 1}. ${status} "${item.text}" (${item.type})\n`;
    });
    text += `\n`;
  }

  text += `[Paranormal Statistics]\n`;
  text += ` * Total Spawned: ${stats.totalSpawned}\n`;
  text += ` * Restored: ${stats.totalRestored}\n`;
  text += ` * Exorcised: ${stats.totalExorcised}\n`;
  if (stats.mostDeletedWords[0]) {
    text += ` * Most Deleted: "${stats.mostDeletedWords[0].word}" (${stats.mostDeletedWords[0].count}x)\n`;
  }

  return text;
}

/**
 * Initiates a browser file download.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
