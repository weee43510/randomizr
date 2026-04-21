export const APP_VERSION = "5.0.0";

export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

export const CHANGELOGS: ChangelogEntry[] = [
  {
    version: "5.0.0",
    date: "2026-04-21",
    notes: [
      "🚀 MAJOR: Settings now opens fullscreen with tabs (Themes · Device · Roadmap · Secrets · About)",
      "🎨 NEW: Live Theme Editor — tweak primary/accent/bg HSL sliders & save your custom theme",
      "🔥 NEW: Daily Streak system — opens-in-a-row counter with bonus confetti every 7 days",
      "🎮 2 NEW games: Tic-Tac-Toe vs AI (3 difficulties) & Color Match reflex grid",
      "📱 Tablet layout now has a dedicated Settings button in the sidebar",
      "🔢 Version chip now visible on the Device Picker welcome screen",
      "🥚 Konami code FIXED — case-insensitive, captured globally (try ↑↑↓↓←→←→ B A)",
      "🥚 NEW eggs: type 'rainbow' or 'free' anywhere · 7-tap version still unlocks Dev Mode",
      "🛣️ Roadmap updated — Theme Editor, Daily Streaks & Bingo Tournaments shipped",
      "💨 Confetti rebuilt — same delight, way less lag (capped ticks + particle counts)",
    ],
  },
  {
    version: "4.0.0",
    date: "2026-04-20",
    notes: [
      "💎 MAJOR: 10 themes total — including no-neon Midnight, Daylight & Classic Blue",
      "🎮 6 NEW games: Reaction Time, Memory Sequence, Word Chain, Speed Tap, Number Hunt, Emoji Story",
      "🎨 Every existing tool reworked — confetti, multi-modes, animations, polish",
      "⚙️ Settings rebuilt — bigger theme cards, device switcher, 30-day roadmap (15 stops!)",
      "🥚 Hidden easter eggs: Konami unlock, version-tap dev mode, /matrix code rain",
      "🕹️ Settings hides 2 mini-games: Bug Squash & Click The Dot",
      "🎉 Confetti everywhere on wins (canvas-confetti)",
      "🔊 Smarter sound system with per-tool variations",
    ],
  },
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

// 30-day roadmap, 1 stop every 2 days = 15 stops
export interface RoadmapStop {
  day: number; // 0,2,4...28
  title: string;
  detail: string;
  icon: string;
  status: "shipped" | "next" | "planned";
}

export const ROADMAP: RoadmapStop[] = [
  { day: 0, title: "v4.0 Launch", detail: "10 themes, 6 new games, full rework", icon: "🚀", status: "shipped" },
  { day: 2, title: "Theme Editor", detail: "Build your own theme with live HSL sliders", icon: "🎨", status: "shipped" },
  { day: 4, title: "Daily Streaks", detail: "Login streak counter + bonus rewards", icon: "🔥", status: "shipped" },
  { day: 6, title: "Tic-Tac-Toe", detail: "Vs AI on 3 difficulties — easy/normal/impossible", icon: "❌", status: "shipped" },
  { day: 8, title: "Color Match", detail: "Reflex grid: tap the matching swatch fast", icon: "🎯", status: "shipped" },
  { day: 10, title: "v5.0 Settings Overhaul", detail: "Fullscreen tabs · tablet access · new eggs", icon: "⚙️", status: "shipped" },
  { day: 12, title: "Bingo Tournaments", detail: "Bracket mode vs 8 AI personalities", icon: "🏆", status: "next" },
  { day: 14, title: "Achievements", detail: "Unlock 30+ badges across all games", icon: "🏅", status: "planned" },
  { day: 16, title: "Sound Studio", detail: "Pick & remix the SFX pack per tool", icon: "🎧", status: "planned" },
  { day: 18, title: "Custom Trivia Packs", detail: "Import your own Q&A as JSON or paste", icon: "🧠", status: "planned" },
  { day: 20, title: "Wheel Templates", detail: "One-click presets: lunch, chores, dares", icon: "🎡", status: "planned" },
  { day: 22, title: "Pixel Pet", detail: "A tiny mascot reacts to your activity", icon: "🐣", status: "planned" },
  { day: 24, title: "Photo Mode", detail: "Export any result as a shareable card", icon: "📸", status: "planned" },
  { day: 26, title: "Voice Commands", detail: "Spin / Roll / Call by saying it", icon: "🎙️", status: "planned" },
  { day: 28, title: "v6.0 Multiplayer", detail: "Real-time rooms — bring everyone in", icon: "🌐", status: "planned" },
];
