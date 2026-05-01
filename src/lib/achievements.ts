import { loadFromStorage, saveToStorage } from "./storage";
import { toast } from "sonner";

/**
 * 🧊 LEGACY MODE NOTICE
 * Achievements are frozen:
 * - Completed achievements remain visible
 * - Uncompleted ones are shown as LOCKED
 * - No new unlocks are possible
 */

const ACHIEVEMENTS_DISABLED = true;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  tool?: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_visit", title: "Welcome", description: "Open app for the first time", icon: "👋", rarity: "common" },
  { id: "all_themes", title: "Chameleon", description: "Try every theme", icon: "🎨", rarity: "rare" },
  { id: "konami", title: "Old School", description: "Enter Konami code", icon: "🕹️", rarity: "epic" },
  { id: "dev_mode", title: "Hacker", description: "Unlock dev mode", icon: "👨‍💻", rarity: "epic" },
  { id: "matrix", title: "Red Pill", description: "Enter the Matrix", icon: "🟢", rarity: "rare" },
  { id: "rainbow", title: "Rainbow", description: "Activate rainbow mode", icon: "🌈", rarity: "rare" },

  { id: "all_tools", title: "Completionist", description: "Used every tool", icon: "🌟", rarity: "epic" },
  { id: "all_legendaries", title: "Untouchable", description: "Unlocked all legendaries", icon: "👑", rarity: "legendary" },
];

export function rarityColor(r: Achievement["rarity"]) {
  const map = {
    common: "hsl(var(--muted-foreground))",
    rare: "hsl(var(--neon-cyan))",
    epic: "hsl(var(--neon-violet))",
    legendary: "hsl(var(--neon-pink))",
  };
  return map[r];
}

/**
 * 🧠 STORAGE
 */
export function getUnlocked(): Record<string, number> {
  return loadFromStorage<Record<string, number>>("achievements", {});
}

/**
 * ✅ CHECK IF UNLOCKED (USED FOR UI STATE)
 */
export function isUnlocked(id: string): boolean {
  return !!getUnlocked()[id];
}

/**
 * 🔒 LOCK STATE (NEW UI HELPER)
 * Everything not unlocked = LOCKED
 */
export function isLocked(id: string): boolean {
  return !isUnlocked(id);
}

/**
 * 🚫 DISABLED UNLOCK SYSTEM (LEGACY FREEZE)
 */
export function unlock(id: string): boolean {
  if (ACHIEVEMENTS_DISABLED) {
    return false;
  }

  const u = getUnlocked();
  if (u[id]) return false;

  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  if (!ach) return false;

  u[id] = Date.now();
  saveToStorage("achievements", u);

  toast.success(`🏅 ${ach.title}`, {
    description: ach.description,
  });

  return true;
}

/**
 * 🎨 TOOL TRACKING (kept active — used by Dashboard for "Recently used")
 */
export function trackToolUsage(toolId: string) {
  const used = loadFromStorage<Record<string, number>>("tools_used", {});
  used[toolId] = (used[toolId] || 0) + 1;
  saveToStorage("tools_used", used);
}

export function getToolUsage(): Record<string, number> {
  return loadFromStorage<Record<string, number>>("tools_used", {});
}

/**
 * 🎭 THEME TRACKING (FROZEN)
 */
export function trackThemeUsage(themeId: string) {
  if (ACHIEVEMENTS_DISABLED) return;

  const used = loadFromStorage<Record<string, boolean>>("themes_used", {});
  used[themeId] = true;
  saveToStorage("themes_used", used);
}
