export const APP_VERSION = "7.1.0";

export interface ChangelogEntry { version: string; date: string; notes: string[]; }

export const CHANGELOGS: ChangelogEntry[] = [
  {
    version: "7.1.0",
    date: "2026-05-01",
    notes: [
      "🎁 Chip recovery: daily +50 bonus, free +25 chips every 7 min — never get stuck",
      "🎟️ Membership reworked into 3 tiers (🥉 Basic · 🥈 Plus · 🥇 Elite) with 10/20/30-level passes",
      "📊 New Membership tab in Settings with XP bar, levels, claimable rewards",
      "🛍️ Shop expanded to 23 items + Owned/Equip states + per-category equipping",
      "📦 New Inventory tab — view, equip, or sell back at 90% refund",
      "🎮 Seasonal exclusives now interactive — pick → suspense reveal → reward",
      "⏱️ Live d/h/m countdown + final-day urgency visuals",
      "🌌 Casino hub ambience: animated glow + drifting particles",
      "🟣 3 new casino themes: Velvet · Obsidian · Gold",
      "🧱 Suggestions reworked into a public Wall (post · vote · sort)",
      "🚫 Achievements temporarily blocked · Roadmap v2 hidden",
    ],
  },
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

// Roadmap v2 has been hidden for now.
export const ROADMAP_V2: RoadmapStop[] = [];
