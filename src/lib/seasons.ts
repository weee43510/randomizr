import { loadFromStorage, saveToStorage } from "./storage";
import type { ToolId } from "./toolMeta";

export interface Season {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  /** Days from epoch start of this season's run (set when season activates) */
  durationDays: number;
  /** Theme accent color (HSL string for css var) */
  accent: string;
  /** Background gradient hex (just for the season banner) */
  bannerGradient: string;
  /** 4 main-section game ids that are "core" to the season */
  mainGames: ToolId[];
  /** 10 exclusive game ids you can unlock during the season */
  exclusiveGames: SeasonExclusiveGame[];
}

export interface SeasonExclusiveGame {
  id: string; // unique per season
  label: string;
  emoji: string;
  description: string;
  /** What you must do to unlock (free text) */
  unlockHint: string;
  /** Run this predicate against tool usage / state to auto-detect unlock */
  autoUnlock?: (ctx: UnlockContext) => boolean;
}

export interface UnlockContext {
  toolUsage: Record<string, number>;
  achievements: Record<string, number>;
}

// ───────────────── Season 1: The Casino ─────────────────
const SEASON_1: Season = {
  id: "casino",
  name: "The Casino",
  emoji: "🎰",
  tagline: "High rollers only. Place your bets.",
  durationDays: 14,
  accent: "45 95% 55%", // gold
  bannerGradient: "linear-gradient(135deg, hsl(45 95% 55% / 0.25), hsl(0 80% 50% / 0.25), hsl(45 95% 35% / 0.3))",
  mainGames: ["coinDice", "wheel", "rps", "trivia"],
  exclusiveGames: [
    { id: "casino_blackjack", label: "Blackjack", emoji: "♠️", description: "Beat the dealer to 21.", unlockHint: "Roll a dice 10 times.", autoUnlock: (c) => (c.toolUsage["coinDice"] || 0) >= 10 },
    { id: "casino_slots", label: "Lucky Slots", emoji: "🎰", description: "Pull the lever, hit a jackpot.", unlockHint: "Spin the wheel 5 times.", autoUnlock: (c) => (c.toolUsage["wheel"] || 0) >= 5 },
    { id: "casino_roulette", label: "Roulette Royale", emoji: "🔴", description: "Pick red, black, or a number.", unlockHint: "Use Finger Roulette 3 times.", autoUnlock: (c) => (c.toolUsage["roulette"] || 0) >= 3 },
    { id: "casino_poker", label: "Video Poker", emoji: "🃏", description: "Five-card draw vs the house.", unlockHint: "Play Rock Paper Scissors 8 times.", autoUnlock: (c) => (c.toolUsage["rps"] || 0) >= 8 },
    { id: "casino_baccarat", label: "Mini Baccarat", emoji: "💎", description: "Player or banker — call it.", unlockHint: "Win 3 RPS games in a row." },
    { id: "casino_keno", label: "Keno", emoji: "🔢", description: "Pick numbers, hope for matches.", unlockHint: "Play Number Hunt 3 times.", autoUnlock: (c) => (c.toolUsage["numhunt"] || 0) >= 3 },
    { id: "casino_craps", label: "Craps", emoji: "🎲", description: "Roll the bones, ride the line.", unlockHint: "Roll dice 25 times total.", autoUnlock: (c) => (c.toolUsage["coinDice"] || 0) >= 25 },
    { id: "casino_scratch", label: "Scratch Cards", emoji: "🎫", description: "Reveal three matching symbols.", unlockHint: "Open the app 3 days in a row.", autoUnlock: (c) => Object.keys(c.toolUsage).length >= 5 },
    { id: "casino_highlow", label: "High or Low", emoji: "📈", description: "Will the next card be higher?", unlockHint: "Win 5 trivia in a row.", autoUnlock: (c) => !!c.achievements["trivia_streak_5"] },
    { id: "casino_jackpot", label: "Mega Jackpot", emoji: "💰", description: "One spin. Massive payout. Maybe.", unlockHint: "Unlock 5 other Casino games first." },
  ],
};

export const ALL_SEASONS: Season[] = [SEASON_1];

// ───────────────── Active season tracking ─────────────────
interface SeasonState {
  /** Map of seasonId → { startedAt, endedAt? } */
  seasons: Record<string, { startedAt: number; endedAt?: number }>;
  /** Map of "seasonId:gameId" → unlockedAt */
  unlocks: Record<string, number>;
  currentSeasonId: string;
}

const KEY = "season_state_v1";

function loadState(): SeasonState {
  return loadFromStorage<SeasonState>(KEY, {
    seasons: { casino: { startedAt: Date.now() } },
    unlocks: {},
    currentSeasonId: "casino",
  });
}

function saveState(s: SeasonState) { saveToStorage(KEY, s); }

export function getCurrentSeason(): { season: Season; daysLeft: number; daysIn: number } | null {
  const state = loadState();
  const season = ALL_SEASONS.find((s) => s.id === state.currentSeasonId);
  if (!season) return null;
  const meta = state.seasons[season.id];
  if (!meta) return null;
  const elapsedMs = Date.now() - meta.startedAt;
  const daysIn = Math.floor(elapsedMs / 86400000);
  const daysLeft = Math.max(0, season.durationDays - daysIn);
  return { season, daysLeft, daysIn };
}

export function isGameUnlocked(seasonId: string, gameId: string): boolean {
  return !!loadState().unlocks[`${seasonId}:${gameId}`];
}

export function isSeasonActive(seasonId: string): boolean {
  const cur = getCurrentSeason();
  return cur?.season.id === seasonId && cur.daysLeft > 0;
}

export function unlockSeasonGame(seasonId: string, gameId: string): boolean {
  if (!isSeasonActive(seasonId)) return false;
  const state = loadState();
  const key = `${seasonId}:${gameId}`;
  if (state.unlocks[key]) return false;
  state.unlocks[key] = Date.now();
  saveState(state);
  return true;
}

export function getUnlockedSeasonGames(seasonId: string): string[] {
  const state = loadState();
  return Object.keys(state.unlocks)
    .filter((k) => k.startsWith(`${seasonId}:`))
    .map((k) => k.split(":")[1]);
}

/** Auto-unlock logic — call on app boot and after tool usage */
export function checkAutoUnlocks(ctx: UnlockContext): string[] {
  const cur = getCurrentSeason();
  if (!cur || cur.daysLeft <= 0) return [];
  const newly: string[] = [];
  for (const game of cur.season.exclusiveGames) {
    if (isGameUnlocked(cur.season.id, game.id)) continue;
    if (game.autoUnlock?.(ctx)) {
      if (unlockSeasonGame(cur.season.id, game.id)) newly.push(game.id);
    }
  }
  // Mega jackpot auto-unlocks at 5 unlocks
  const unlocked = getUnlockedSeasonGames(cur.season.id);
  if (unlocked.length >= 5 && !unlocked.includes("casino_jackpot")) {
    if (unlockSeasonGame(cur.season.id, "casino_jackpot")) newly.push("casino_jackpot");
  }
  return newly;
}
