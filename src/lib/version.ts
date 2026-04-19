export const APP_VERSION = "3.2.0";

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

export const CHANGELOGS: ChangelogEntry[] = [
  {
    version: "3.2.0",
    date: "2026-04-19",
    notes: [
      "MAJOR: Bingo fully reworked — play on a real 5×5 card vs 1–5 AI bots, with announcer commentary",
      "NEW: Would You Rather — 50 dilemmas, no repeats per session",
      "NEW: Trivia Quiz — 60 questions across 6 categories, scoring + no repeats",
      "NEW: Sticky Wall — infinite pannable canvas, drop one editable sticky note",
      "NEW: Notepad — local scratchpad with autosave every 3 seconds",
      "Truth or Dare now guarantees no repeat cards (truths + dares pools tracked separately)",
      "Device picker fully revamped — neon orbs, accent-tinted cards, fresh hero",
      "All tool headers refreshed with mono kicker labels and gradient display titles",
      "Versioning policy: +0.0.1 visual/UI/bug · +0.1.0 regular update · +1.0.0 major",
    ],
  },
  {
    version: "2.2.0",
    date: "2026-04-19",
    notes: [
      "New game tool: Truth or Dare (50+ prompts)",
      "New game tool: Bingo Caller with full B-I-N-G-O board",
      "New game tool: Rock Paper Scissors vs. a learning AI",
      "Softer drumroll — less aggressive, lower volume",
      "Screen shake now only on Finger Roulette (and gentler)",
      "Cooler UI: Space Grotesk display font, gradient headlines, dot-grid backdrop",
      "New shimmer accent on highlight cards",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-04-19",
    notes: [
      "Rebranded from Pickr to Randomizr",
      "Added Vibe Themes: Cyberpunk, Matrix, Sunset",
      "Added drumroll + tada hype sounds with screen shake on win",
      "Spring animations on all buttons + juicier glassmorphism",
      "Fixed: dice text result now always matches the 3D face",
      "Hidden easter egg in AI Mystic 👀",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-04-15",
    notes: [
      "Added smooth page transitions between tools",
      "Added settings panel with sound toggle & data reset",
      "Full mobile optimization with hamburger menu",
      "Added device picker on first visit",
      "Added version number & developer notes changelog",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-04-14",
    notes: [
      "Initial release",
      "AI Mystic 8-Ball with sassy responses",
      "Finger Roulette with multi-touch support",
      "Photo Wheel with weights & elimination mode",
      "Ranking Board with drag-and-drop & PNG export",
      "Smart Team Splitter for 2-5 balanced teams",
      "3D Coin & Dice with physics animations",
      "Glassmorphism UI with neon accents",
      "LocalStorage persistence for all tools",
      "Synthesized sound effects via Web Audio API",
    ],
  },
];
