# Completely Normal Notepad

A client-side text editor where deleted writing does not disappear into a void, but instead materializes into interactive floating entities that linger across the screen.

**Live Deployment:** [completely-normal-notepad-beige.vercel.app](https://completely-normal-notepad-beige.vercel.app)

---

## Overview

Completely Normal Notepad explores the permanence of deleted thought. When text is removed from the canvas, the application captures the severed fragment, determines its classification based on length and lifespan, and spawns it as a dynamic physical element.

Users can interact with floating fragments, drag them back into the manuscript to restore them at any cursor point, or seal them away in a specimen container. The application runs entirely in the browser with local persistence, procedural sound synthesis, and interactive room elements that react to movement.

---

## Key Features

### Dynamic Deletion Mechanics

Deletions are classified based on character count, deletion speed, and time spent on the page before removal:

| Archetype | Trigger Condition | Visual & Kinetic Behavior |
| :--- | :--- | :--- |
| **Wisp** | Single-character backspaces | Lightweight, twitchy spark that flutters erratically near the caret |
| **Word** | Individual words or short phrases | Steady, buoyant drift across the viewport |
| **Sentence** | Complete sentences or clauses | Broad, slow oceanic drift with wide oscillations |
| **Regret** | Repeatedly typed and deleted words, or long-standing text | Tethered by an elastic spring force to its exact deletion coordinate |
| **Poltergeist** | Mass select-all deletions or rapid multi-paragraph cuts | Bursts outward into clusters of independent wandering word fragments |

Floating fragments can be dragged directly back into the editor to re-insert them into the text, or restored with a single click.

### Room Environment & Physical Objects
Surrounding the editor is a series of interactive elements that respond to cursor interaction and passing text entities:
- **Specimen Jar**: A glass container that traps drifting text fragments, keeping them floating and suspended in liquid ectoplasm.
- **Apothecary Phials**: A row of flat-bottomed reagent bottles and poison flasks.
- **Swivel Hourglass**: A wrought-iron balance hourglass filled with bone ash that trickles continuously and swivels 180 degrees upon kinetic collision or click.
- **Wall Shelves & Objects**: Wall shelves holding stacks of clothbound books and ceramic tableware that can be displaced or toppled and manually restacked.
- **Besom Broom & Candelabra**: Wall fixtures and candles whose flames flicker and draft away from nearby cursor velocity and passing entities.

### Procedural Audio Engine
Audio is synthesized dynamically using the Web Audio API without pre-recorded sound samples:
- Real-time frequency modulation and decay curves for glass clinks, ceramic impacts, candle snuffing, and paper rustling.
- Subtle wind gusts triggered by rapid typing cadence.
- Fully togglable sound effects with volume control and muted defaults.

### Archival & Exporting
- **The Graveyard Ledger**: A searchable slide-over history drawer recording every deletion, timestamps, context sentences, and resurrection status.
- **Writing Statistics**: Tracks frequently erased words, retyped phrases, and lingering regrets.
- **Exhumed Export**: Exports the document as Markdown or Plain Text with an annotated appendix listing every discarded thought and origin context.
- **URL Serialization**: Encodes the notepad text and active entities into compressed URL fragments for sharing without server storage.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Architecture**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand with local storage persistence
- **Audio**: Web Audio API (procedural oscillator and gain synthesis)
- **Physics**: Custom requestAnimationFrame vector simulation
- **Testing**: Vitest with unit tests for classifiers, caret positioning, and state stores

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Dr-Ghost7/completely-normal-notepad.git
cd completely-normal-notepad
npm install
```

### Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verification & Testing

Execute unit tests:

```bash
npm test
```

Run TypeScript validation:

```bash
npx tsc --noEmit
```

Run ESLint checks:

```bash
npm run lint
```

### Production Build

Create an optimized static production build:

```bash
npm run build
```
