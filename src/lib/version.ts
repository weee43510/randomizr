export const APP_VERSION = "7.0.0";

export interface ChangelogEntry { version: string; date: string; notes: string[]; }

export const CHANGELOGS: ChangelogEntry[] = [
  {
    version: "7.0.0",
    date: "2026-04-24",
    notes: [
      "🎰 CASINO REWORK — full premium casino layer with toolbar redesign",
      "🎲 5 brand-new permanent core games (Flip Duel · Neon Roulette · Dealer's Bluff · Chip Cascade · Mind Arena)",
      "🎁 12 fresh seasonal exclusives, each with clear unlock-status panels",
      "🔓 Once unlocked, exclusives stay forever — even after the season ends",
      "💰 Chips economy: persistent currency, risk/reward in every game",
      "🛍️ Chip Shop — spend chips on cosmetic themes, FX, sound packs, UI skins",
      "🎟️ Casino Membership unlocks at 100 chips earned or 3 games played",
      "🌍 14 daily casino events with unique modifiers (multipliers, visuals, bonus chips)",
      "🚫 Rollback system fully removed — code & UI cleaned up",
    ],
  },
  {
    version: "6.2.0",
    date: "2026-04-23",
    notes: [
      "🎰 SEASONS BEGIN — Season 1: The Casino is now live for 14 days",
      "🃏 4 Casino games in main lineup + 10 exclusive locked games",
      "⏳ Miss the season? Locked games are gone forever — true FOMO",
      "🔥 Discovery: Trending · 🌟 Hot Now · 🧠 Most Replayed homepage sections",
      "💌 Suggestions box reworked — save, copy, edit, send via email",
      "📔 Developer Notes restored & expanded (10+ entries)",
      "🐣 Pixel Pet removed (sorry Pip — you weren't pulling weight)",
      "🔥 Daily Streaks removed (no more guilt-tripping)",
      "🏅 Fixed: missing badge triggers for streaks, dice 6, all themes",
      "🎨 7 new themes: Inferno, Glacier, Sakura, Honey, Royal, Mint, Carbon",
      "✍️ \"Note from Elias\" lives in Settings → About",
    ],
  },
  {
    version: "6.1.0",
    date: "2026-04-22",
    notes: [
      "🎮 NEW GAMES: Rhythm Tap, Balloon Pop, Math Sprint",
      "🌟 Game of the Week — featured tool on the homepage",
      "🪪 Welcome screen — pick your device on first launch",
      "💡 Suggestions box — send ideas to Elias",
      "🗺️ Roadmap v2 published",
    ],
  },
  {
    version: "6.0.0",
    date: "2026-04-21",
    notes: [
      "🚀 Roadmap v1 fully shipped — 9 features in one drop",
      "🏆 Bingo Tournament · 🏅 Achievements · 🎧 Sound Studio",
      "🧠 Custom Trivia · 🎡 Wheel Templates · 🐣 Pixel Pet",
      "📸 Photo Mode · 🎙️ Voice Commands · 🏠 Dashboard",
      "📱 3D tilt Device Picker",
    ],
  },
  {
    version: "5.0.0",
    date: "2026-04-21",
    notes: [
      "Settings fullscreen with tabs · Theme Editor with HSL sliders",
      "Daily Streaks (later removed in 6.2) · Tic-Tac-Toe · Color Match",
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
  { day: 4, title: "Daily Streaks", detail: "(removed in v6.2)", icon: "🔥", status: "shipped" },
  { day: 6, title: "Tic-Tac-Toe", detail: "Vs AI · 3 difficulties", icon: "❌", status: "shipped" },
  { day: 8, title: "Color Match", detail: "Reflex grid", icon: "🎯", status: "shipped" },
  { day: 10, title: "v5.0 Settings", detail: "Fullscreen tabs", icon: "⚙️", status: "shipped" },
  { day: 12, title: "Bingo Tournament", detail: "8-player bracket", icon: "🏆", status: "shipped" },
  { day: 14, title: "Achievements", detail: "30 unlockable badges", icon: "🏅", status: "shipped" },
  { day: 16, title: "Sound Studio", detail: "4 SFX packs", icon: "🎧", status: "shipped" },
  { day: 18, title: "Custom Trivia", detail: "Paste JSON or text", icon: "🧠", status: "shipped" },
  { day: 20, title: "Wheel Templates", detail: "6 one-click presets", icon: "🎡", status: "shipped" },
  { day: 22, title: "Pixel Pet", detail: "(removed in v6.2)", icon: "🐣", status: "shipped" },
  { day: 24, title: "Photo Mode", detail: "Export as PNG", icon: "📸", status: "shipped" },
  { day: 26, title: "Voice Commands", detail: "Spin/Roll/Flip by voice", icon: "🎙️", status: "shipped" },
  { day: 28, title: "v6.0 Dashboard", detail: "Homepage + 3D picker", icon: "🏠", status: "shipped" },
];

// Roadmap v2.0 — mixed bag (NOT all multiplayer).
export const ROADMAP_V2: RoadmapStop[] = [
  { day: 0, title: "v6.1 Polish", detail: "3 new games + GOTW", icon: "✨", status: "shipped" },
  { day: 2, title: "Game of the Week", detail: "Rotating featured tool", icon: "🌟", status: "shipped" },
  { day: 4, title: "v6.2 Seasons", detail: "Season 1 · The Casino", icon: "🎰", status: "shipped" },
  { day: 6,  title: "Discovery feed",      detail: "Trending · Hot · Replayed", icon: "🔥", status: "shipped" },
  { day: 8,  title: "v7.0 Casino Rework",  detail: "5 core games, chips, shop", icon: "🎰", status: "shipped" },
  { day: 10, title: "Daily Casino Events", detail: "14 modifiers across season", icon: "📅", status: "shipped" },
  { day: 12, title: "Chip Shop",           detail: "Cosmetics for chips",       icon: "🛍️", status: "shipped" },
  { day: 14, title: "Casino Membership",   detail: "Season pass cosmetic perks",icon: "🎟️", status: "shipped" },
  { day: 16, title: "Word Games Pack",     detail: "Anagrams, Hangman, Wordle-lite", icon: "🔤", status: "next" },
  { day: 18, title: "Season 2: Cyber Heist", detail: "Hacker theme + 14 new games", icon: "💾", status: "planned" },
  { day: 20, title: "Music Player",        detail: "Lo-fi background tunes",    icon: "🎵", status: "planned" },
  { day: 22, title: "Stat Dashboard",      detail: "All-time scores & charts",  icon: "📊", status: "planned" },
  { day: 24, title: "Theme Marketplace",   detail: "Share custom themes by code", icon: "🎨", status: "planned" },
  { day: 26, title: "Replay System",       detail: "Save & re-watch best runs", icon: "⏪", status: "planned" },
  { day: 28, title: "v8.0 Social",         detail: "Friends, leaderboards, profiles", icon: "🌍", status: "planned" },
];
