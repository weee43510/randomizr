import { loadFromStorage, saveToStorage } from "./storage";
import { celebrate } from "./confetti";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  tool?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  // General
  { id: "first_visit", title: "Welcome", description: "Open Randomizr for the first time", icon: "👋", rarity: "common" },
  { id: "all_themes", title: "Chameleon", description: "Try every theme", icon: "🎨", rarity: "rare" },
  { id: "konami", title: "Old School", description: "Enter the Konami code", icon: "🕹️", rarity: "epic" },
  { id: "dev_mode", title: "Hacker", description: "Unlock dev mode (7 taps)", icon: "👨‍💻", rarity: "epic" },
  { id: "matrix", title: "Red Pill", description: "Enter the Matrix", icon: "🟢", rarity: "rare" },
  { id: "rainbow", title: "Over the Rainbow", description: "Activate rainbow mode", icon: "🌈", rarity: "rare" },
  // Seasonal (NEW)
  { id: "season_first_unlock", title: "High Roller", description: "Unlock your first season-exclusive game", icon: "🎰", rarity: "rare" },
  { id: "season_all_unlock", title: "Casino Royale", description: "Unlock all 10 Casino games", icon: "👑", rarity: "legendary" },
  { id: "season_visit", title: "VIP", description: "Visit the Season Hub", icon: "💎", rarity: "common" },
  // Game-specific
  { id: "mystic_10", title: "Truth Seeker", description: "Get 10 mystic readings", icon: "🔮", rarity: "common", tool: "mystic" },
  { id: "wheel_50", title: "Spin Doctor", description: "Spin the wheel 50 times", icon: "🎡", rarity: "rare", tool: "wheel" },
  { id: "dice_six", title: "Lucky 6", description: "Roll a 6", icon: "🎲", rarity: "common", tool: "coinDice" },
  { id: "dice_six_streak", title: "Cursed Dice", description: "Roll three 6s in a row", icon: "🎰", rarity: "epic", tool: "coinDice" },
  { id: "trivia_streak_5", title: "Brainiac", description: "5 trivia answers in a row", icon: "🧠", rarity: "rare", tool: "trivia" },
  { id: "trivia_streak_10", title: "Quiz Master", description: "10 trivia answers in a row", icon: "🎓", rarity: "epic", tool: "trivia" },
  { id: "reaction_200", title: "Lightning", description: "Reaction time under 200ms", icon: "⚡", rarity: "rare", tool: "reaction" },
  { id: "reaction_150", title: "Inhuman", description: "Reaction time under 150ms", icon: "👁️", rarity: "legendary", tool: "reaction" },
  { id: "memory_10", title: "Total Recall", description: "Memory sequence of 10", icon: "🧩", rarity: "epic", tool: "memory" },
  { id: "speedtap_30", title: "Trigger Finger", description: "30+ taps in Speed Tap", icon: "💥", rarity: "rare", tool: "speedtap" },
  { id: "wordchain_15", title: "Word Wizard", description: "15-word chain", icon: "🔤", rarity: "rare", tool: "wordchain" },
  { id: "ttt_impossible", title: "Mind Game", description: "Beat Tic-Tac-Toe Impossible", icon: "❌", rarity: "legendary", tool: "tictactoe" },
  { id: "bingo_win", title: "BINGO!", description: "Win a Bingo round", icon: "🎉", rarity: "common", tool: "bingo" },
  { id: "bingo_tourney", title: "Tournament Champ", description: "Win a Bingo tournament", icon: "🏆", rarity: "legendary", tool: "bingo" },
  { id: "rps_streak_5", title: "Hand Reader", description: "5 RPS wins in a row", icon: "✊", rarity: "rare", tool: "rps" },
  { id: "colormatch_30", title: "Eagle Eye", description: "30+ Color Match score", icon: "🎯", rarity: "rare", tool: "colormatch" },
  { id: "balloon_25", title: "Pop Star", description: "Pop 25 balloons in one round", icon: "🎈", rarity: "rare", tool: "balloonpop" },
  { id: "math_20", title: "Calculator", description: "20 correct in Math Sprint", icon: "🧮", rarity: "rare", tool: "mathsprint" },
  { id: "rhythm_perfect", title: "On Beat", description: "Perfect Rhythm Tap round", icon: "🎵", rarity: "epic", tool: "rhythmtap" },
  { id: "all_tools", title: "Completionist", description: "Use every tool at least once", icon: "🌟", rarity: "epic" },
  { id: "custom_theme", title: "Designer", description: "Save a custom theme", icon: "✨", rarity: "rare" },
  { id: "snapshot", title: "Memory Maker", description: "Export a result card (Photo Mode)", icon: "📸", rarity: "rare" },
  { id: "voice_used", title: "Loud and Clear", description: "Use voice commands", icon: "🎙️", rarity: "rare" },
  { id: "secret_party", title: "Party Animal", description: "Type the 'party' secret", icon: "🎉", rarity: "rare" },
  { id: "all_legendaries", title: "Untouchable", description: "Unlock every legendary", icon: "👑", rarity: "legendary" },
];

const RARITY_COLORS: Record<Achievement["rarity"], string> = {
  common: "hsl(var(--muted-foreground))",
  rare: "hsl(var(--neon-cyan))",
  epic: "hsl(var(--neon-violet))",
  legendary: "hsl(var(--neon-pink))",
};

export function rarityColor(r: Achievement["rarity"]) { return RARITY_COLORS[r]; }

export function getUnlocked(): Record<string, number> {
  return loadFromStorage<Record<string, number>>("achievements", {});
}

export function isUnlocked(id: string): boolean {
  return !!getUnlocked()[id];
}

export function unlock(id: string): boolean {
  const u = getUnlocked();
  if (u[id]) return false;
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return false;
  u[id] = Date.now();
  saveToStorage("achievements", u);
  toast.success(`🏅 ${ach.title}`, { description: ach.description });
  if (ach.rarity === "legendary" || ach.rarity === "epic") celebrate("medium");
  setTimeout(() => {
    const all = getUnlocked();
    const legendaries = ACHIEVEMENTS.filter((a) => a.rarity === "legendary" && a.id !== "all_legendaries");
    if (legendaries.every((a) => all[a.id]) && !all["all_legendaries"]) {
      unlock("all_legendaries");
    }
  }, 100);
  return true;
}

export function trackToolUsage(toolId: string) {
  const used = loadFromStorage<Record<string, number>>("tools_used", {});
  used[toolId] = (used[toolId] || 0) + 1;
  saveToStorage("tools_used", used);
  // Per-tool milestone badges
  const count = used[toolId];
  if (toolId === "wheel" && count >= 50) unlock("wheel_50");
  if (toolId === "mystic" && count >= 10) unlock("mystic_10");
  if (toolId === "season") unlock("season_visit");
  // Distinct tools — there are 27 tools (incl. dashboard + season).
  // Use 24 as threshold for "used most things".
  const distinct = Object.keys(used).length;
  if (distinct >= 24) unlock("all_tools");
}

export function getToolUsage(): Record<string, number> {
  return loadFromStorage<Record<string, number>>("tools_used", {});
}

export function trackThemeUsage(themeId: string) {
  const used = loadFromStorage<Record<string, boolean>>("themes_used", {});
  used[themeId] = true;
  saveToStorage("themes_used", used);
  // 17 base themes now
  const base = [
    "cyberpunk","matrix","sunset","ocean","bloodmoon","vaporwave","forest","midnight","daylight","classic",
    "inferno","glacier","sakura","honey","royal","mint","carbon",
  ];
  if (base.every((t) => used[t])) unlock("all_themes");
}
