# 📝 Completely Normal Notepad (Nothing Unusual Here)

> *A seemingly mundane notepad where deleted words refuse to vanish. Instead, they rise from the paper as interactive, translucent ghosts haunting your manuscript.*

Built as a premier **Frontend Engineering Portfolio Project** demonstrating advanced DOM manipulation, Web API mastery, vector physics simulations, and procedural audio synthesis using **React 19**, **Next.js (App Router)**, **TypeScript (Strict)**, and **Tailwind CSS**.

---

## 👻 The Core Loop & Philosophy

In an ordinary text editor, backspacing an idea destroys it permanently. In **Completely Normal Notepad**:
1. You write your thoughts on a vintage legal ruled pad.
2. When you hit `Backspace`, `Delete`, or `Cut`, the words do not disappear into a void.
3. They rise off the page as ethereal, interactive spirits floating at the exact sub-pixel coordinates where they were erased.
4. You can grab a ghost with your cursor or finger and **drop it back into the text** at any caret insertion point, or leave them wandering the screen.

---

## 🔮 The 5 Ghost Archetypes

The application classifies deletions deterministically using context, timing, and document metrics:

| Archetype | Trigger Condition | Behavior & Physics | Visual Identity |
| :--- | :--- | :--- | :--- |
| **Wisp** 🐝 | Rapid typos (< 800ms between typing & backspacing, 1–3 chars) | High-frequency jitter, erratic flutter like gnats | Amber / Yellow glowing flicker |
| **Word Ghost** 👻 | Standard deleted word or snippet | Gentle wandering; **dodges your mouse cursor** when you reach for it | Ethereal Cyan luminescence |
| **Sentence Ghost** 📜 | Deleted sentence (> 32 chars or ending with punctuation `.!?\n`) | Heavy, graceful oceanic drift in the background | Atmospheric Slate & Indigo aura |
| **Regret Ghost** 🕯️ | Text written, stared at (> 5s without editing), then deleted | **Anchored spring physics** hovering mournfully near its deletion spot | Deep Mournful Violet / Purple glow |
| **Poltergeist** 🌪️ | Select-all and delete (`Ctrl+A` $\to$ `Backspace`), or mass document purge | The manuscript fractures: every word erupts outward in a radial blast | Spectral Crimson & Rose flare |

Hovering over any ghost inspects its **Spectral Memory**: the sentence it was severed from, how long it lived before being deleted, and its exact deletion timestamp.

---

## 🛠️ The Technical Interview Story: Core Front-End Challenges

This project was intentionally engineered to highlight core web platform competencies rarely demonstrated in boilerplate apps:

### 1. The `contenteditable` Coordinates Problem (`beforeinput` + `Range.getClientRects()`)
A standard HTML `<textarea>` or `<input>` is a black-box text container; the browser does not expose the viewport coordinates of individual words inside them.
* **Solution**: A managed `contenteditable` element intercepting the DOM Level 3 `beforeinput` event (`inputType: deleteContentBackward`, `deleteWordBackward`, etc.).
* Before the text disappears from the DOM, we call `event.getTargetRanges()` to capture the target range.
* We invoke `Range.getClientRects()` to compute the exact sub-pixel viewport coordinates `(originX, originY)` where the text lived.
* Fallbacks dynamically construct a character-level boundary range when the caret is collapsed, guaranteeing 100% reliable coordinate tracking across Chromium, Firefox, Safari, and mobile touch keyboards.

### 2. Dropping Spirits Back Into The Text (`caretPositionFromPoint`)
Re-inserting a moving physics entity back into an arbitrary point in the manuscript requires reverse-resolving viewport coordinates to text node offsets.
* **Solution**: Supports modern standard `document.caretPositionFromPoint(x, y)` with fallback to WebKit's `document.caretRangeFromPoint(x, y)`.
* Recursively traverses DOM text nodes to calculate zero-indexed character offsets, previewing a glowing drop indicator in real time.
* Uses the modern **Pointer Events API** with `setPointerCapture` to provide continuous, jitter-free dragging on mobile touchscreens without page scrolling interference.

### 3. 60 FPS Vector Physics Engine
* Runs on a decoupled `requestAnimationFrame` simulation loop.
* Implements vector math for velocity damping, screen boundary reflection, sinusoidal wandering, cursor evasion repulsive vectors (for Word ghosts), and Hooke's Law spring forces (for Regret ghosts).
* During the **Exorcism Chamber**, all spirits experience a gravitational whirlpool vortex pulling them into the center with angular momentum.

### 4. Zero-Asset Procedural Web Audio API
* No external MP3 or WAV audio assets are downloaded over the network.
* Uses the browser's native **Web Audio API**:
  * Wisps trigger high-frequency triangle wave sweeps.
  * Regrets play mournful three-voice minor chord swells.
  * Restoring a spirit rings an ethereal glass bell chime.
  * Holding Exorcism synthesizes a rising low-frequency sawtooth drone filtered through an opening resonant `BiquadFilterNode`.

### 5. Accessibility (a11y) & Reduced Motion Mode
* Respects the user's `prefers-reduced-motion` system setting and provides a manual toggle.
* When active, physics loops pause, and spirits dock neatly in an accessible cemetery shelf where they remain fully reviewable and restorable without visual motion sickness.
* Fully keyboard operable (Hold `Space`/`Enter` to exorcise, `Tab` to accept ghost possessions, `Esc` to dismiss).

---

## ✨ Features & Interactive Modes

1. **The Physical Ruled Notepad**: Authentic stationery styling with ruled paper margins, word counter, and smooth caret handling.
2. **Possession Mode**: Occasionally, an idle ghost haunts your writing, hovering near a spot it believes it belongs. Press `Tab` or click the prompt to welcome it back into the manuscript.
3. **Séance Timeline Replay**: A timeline scrubber that plays back your entire writing journey. Scrub back and forth to watch text appear, disappear, and ghosts emerge in historical synchronization.
4. **Hold to Exorcise**: A tactile radial progress button. Hold for 2 seconds while spirits swirl into an ethereal vortex and dissolve into peace.
5. **Dynamic Haunting Atmosphere**: As deletions accumulate, the room subtly darkens with increasing vignette and authentic candle flicker.
6. **The Graveyard Ledger**: Margin drawer tracking all-time deletion statistics:
   * *Most Deleted Word*
   * *Words Killed and Retyped* (detecting ideas you abandoned and secretly rewrote)
   * *Longest-Lingering Regret* (how many seconds you stared before deleting)
7. **Exhumed Export**: Download your finished manuscript as Markdown (`.md`) or Plain Text (`.txt`) with an attached *"Deleted Drafts & Echoes"* appendix and footnotes.
8. **Shareable Haunted Link**: Compresses the document and active drifting ghosts into a URL hash using `LZ-String` compression—zero backend required!

---

## 🧪 Unit Testing Suite

The project includes unit tests written in **Vitest** covering:
* Ghost classification edge cases (rapid typing intervals, multi-line blocks, selection sizes)
* Graveyard analytical aggregation and retyped words detection
* Caret context sentence extraction

Run tests with:
```bash
npm test
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ (tested on Node 20 & 26)
* npm 9+

### Installation
```bash
# Clone or navigate to the repository
cd completely-normal-notepad

# Install dependencies
npm install

# Start development server
npm run dev

# Run Vitest test suite
npm test

# Build production bundle
npm run build
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start writing!
