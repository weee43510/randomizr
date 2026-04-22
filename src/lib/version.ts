export const APP_VERSION = "6.1.0";

export interface ChangelogEntry { version: string; date: string; notes: string[]; }

export const CHANGELOGS: ChangelogEntry[] = [
  {
    version: "6.1.0",
    date: "2026-04-22",
    notes: [
      "🎮 NEW GAMES: Rhythm Tap, Balloon Pop, Math Sprint — 3 quick-play modes",
      "🌟 NEW: Game of the Week — featured tool right on the homepage",
      "🐣 Pixel Pet reworked — feed, pet, drag it around, and watch it grow",
      "🪪 Welcome screen — one-time intro before picking your device",
      "💡 Suggestions box in Settings — send ideas straight to Elias",
      "↩️ Version rollback — restore older snapshots of your data",
      "🗺️ Roadmap v2 visible (and not all multiplayer this time)",
      "📸 Photo Snap wired into Coin & Dice, Wheel, and Trivia results",
      "🎡 Wheel Templates now show inside the Photo Wheel tool",
      "🧠 Custom Trivia panel surfaced in Settings → Tools",
      "🏅 Achievements panel + 🎧 Sound Studio added as Settings tabs",
      "✍️ Cleaner copy across the app — no more edgy filler",
    ],
  },
  {
    version: "6.0.0",
    date: "2026-04-21",
    notes: [
      "🚀 MAJOR: Roadmap v1 fully shipped — 9 new features in one drop",
      "🏆 NEW: Bingo Tournament — 8-player single-elim bracket vs 7 AI personalities",
      "🏅 NEW: Achievements — 30 unlockable badges with rarity tiers",
      "🎧 NEW: Sound Studio — 4 SFX packs (Modern, Retro 8-bit, Silly, Muted)",
      "🧠 NEW: Custom Trivia Packs — paste JSON or text, used by Trivia tool",
      "🎡 NEW: Wheel Templates — 6 one-click presets (lunch, chores, dares, etc.)",
      "🐣 NEW: Pixel Pet — floating mascot, mood-aware, poke for energy",
      "📸 NEW: Photo Mode — snapshot any result as a shareable PNG",
      "🎙️ NEW: Voice Commands — say 'spin', 'roll', 'flip', 'next'",
      "🏠 NEW: Homepage Dashboard — search, favorites, recently used, all tools",
      "📱 Reworked Device Picker — 3D tilt cards, magazine layout, sticker badges",
      "🛣️ Roadmap v2.0 published — 15 new stops",
    ],
  },
  {
    version: "5.0.0",
    date: "2026-04-21",
    notes: [
      "Settings fullscreen with 5 tabs",
      "Theme Editor with live HSL sliders",
      "Daily Streaks with 7-day confetti",
      "Tic-Tac-Toe & Color Match",
      "Konami code fixed",
    ],
  },
  {
    version: "4.0.0",
    date: "2026-04-20",
    notes: ["10 themes, 6 new mini-games, 30-day roadmap, easter eggs"],
  },
];

export interface RoadmapStop {
  day: number; title: string; detail: string; icon: string;
  status: "shipped" | "next" | "planned";
}

export const ROADMAP: RoadmapStop[] = [
  { day: 0, title: "v4.0 Launch", detail: "10 themes, 6 new games", icon: "🚀", status: "shipped" },
  { day: 2, title: "Theme Editor", detail: "Live HSL sliders", icon: "🎨", status: "shipped" },
  { day: 4, title: "Daily Streaks", detail: "Login streak + bonuses", icon: "🔥", status: "shipped" },
  { day: 6, title: "Tic-Tac-Toe", detail: "Vs AI · 3 difficulties", icon: "❌", status: "shipped" },
  { day: 8, title: "Color Match", detail: "Reflex grid", icon: "🎯", status: "shipped" },
  { day: 10, title: "v5.0 Settings", detail: "Fullscreen tabs", icon: "⚙️", status: "shipped" },
  { day: 12, title: "Bingo Tournament", detail: "8-player bracket vs AI", icon: "🏆", status: "shipped" },
  { day: 14, title: "Achievements", detail: "30 unlockable badges", icon: "🏅", status: "shipped" },
  { day: 16, title: "Sound Studio", detail: "4 SFX packs", icon: "🎧", status: "shipped" },
  { day: 18, title: "Custom Trivia", detail: "Paste JSON or text", icon: "🧠", status: "shipped" },
  { day: 20, title: "Wheel Templates", detail: "6 one-click presets", icon: "🎡", status: "shipped" },
  { day: 22, title: "Pixel Pet 2.0", detail: "Feed, pet, drag", icon: "🐣", status: "shipped" },
  { day: 24, title: "Photo Mode", detail: "Export as PNG", icon: "📸", status: "shipped" },
  { day: 26, title: "Voice Commands", detail: "Spin/Roll/Flip by voice", icon: "🎙️", status: "shipped" },
  { day: 28, title: "v6.0 Dashboard", detail: "Homepage + 3D device picker", icon: "🏠", status: "shipped" },
];

// Roadmap v2.0 — mixed bag: new games, polish, social. NOT all multiplayer.
export const ROADMAP_V2: RoadmapStop[] = [
  { day: 0, title: "v6.1 Polish", detail: "3 new games + Game of the Week", icon: "✨", status: "shipped" },
  { day: 2, title: "Pet Evolutions", detail: "Pet grows into 5 forms", icon: "🦋", status: "next" },
  { day: 4, title: "Game of the Week", detail: "Rotating featured tool", icon: "🌟", status: "shipped" },
  { day: 6, title: "Daily Challenges", detail: "One puzzle a day, scored", icon: "📅", status: "planned" },
  { day: 8, title: "Tournament Mode v2", detail: "Cross-game brackets", icon: "🥇", status: "planned" },
  { day: 10, title: "Custom Backgrounds", detail: "Upload your own wallpaper", icon: "🖼️", status: "planned" },
  { day: 12, title: "Word Games Pack", detail: "Anagrams, Hangman, Wordle-lite", icon: "🔤", status: "planned" },
  { day: 14, title: "Music Player", detail: "Lo-fi background while you play", icon: "🎵", status: "planned" },
  { day: 16, title: "Stat Dashboard", detail: "All-time scores & charts", icon: "📊", status: "planned" },
  { day: 18, title: "Friend Codes", detail: "Share scores by 4-letter code", icon: "🔑", status: "planned" },
  { day: 20, title: "Replay System", detail: "Save & re-watch your best runs", icon: "⏪", status: "planned" },
  { day: 22, title: "Theme Marketplace", detail: "Share your custom themes", icon: "🎨", status: "planned" },
  { day: 24, title: "Live Bingo Rooms", detail: "Up to 16 friends, shared caller", icon: "📡", status: "planned" },
  { day: 26, title: "Mobile App", detail: "Native iOS/Android wrapper", icon: "📱", status: "planned" },
  { day: 28, title: "v7.0 Social", detail: "Friends, leaderboards, profiles", icon: "🌍", status: "planned" },
];
