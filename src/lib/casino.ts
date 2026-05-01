import { loadFromStorage, saveToStorage } from "./storage";

// ─────────────── CHIPS ECONOMY ───────────────
const CHIPS_KEY = "casino_chips";
const STARTING_CHIPS = 100;

export function getChips(): number {
  const v = loadFromStorage<number | null>(CHIPS_KEY, null);
  if (v === null) {
    saveToStorage(CHIPS_KEY, STARTING_CHIPS);
    return STARTING_CHIPS;
  }
  return v;
}

export function setChips(n: number) { saveToStorage(CHIPS_KEY, Math.max(0, Math.floor(n))); }

export function spendChips(n: number): boolean {
  const c = getChips();
  if (c < n) return false;
  setChips(c - n);
  return true;
}

export function awardChips(n: number) { setChips(getChips() + Math.floor(n)); recordChipsEarned(Math.floor(n)); }

// ─────────────── CHIP RECOVERY ───────────────
const FREE_CHIPS_KEY = "casino_free_chips_last";
const DAILY_BONUS_KEY = "casino_daily_bonus_last";
const FREE_CHIPS_AMOUNT = 25;
const FREE_CHIPS_COOLDOWN_MS = 7 * 60 * 1000; // 7 min
const DAILY_BONUS_AMOUNT = 50;

export function freeChipsCooldownLeft(): number {
  const last = loadFromStorage<number>(FREE_CHIPS_KEY, 0);
  return Math.max(0, last + FREE_CHIPS_COOLDOWN_MS - Date.now());
}

export function claimFreeChips(): { ok: boolean; amount?: number; waitMs?: number } {
  const left = freeChipsCooldownLeft();
  if (left > 0) return { ok: false, waitMs: left };
  saveToStorage(FREE_CHIPS_KEY, Date.now());
  awardChips(FREE_CHIPS_AMOUNT);
  return { ok: true, amount: FREE_CHIPS_AMOUNT };
}

function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }

export function dailyBonusAvailable(): boolean {
  return loadFromStorage<string>(DAILY_BONUS_KEY, "") !== todayKey();
}

export function claimDailyBonus(): { ok: boolean; amount?: number } {
  if (!dailyBonusAvailable()) return { ok: false };
  saveToStorage(DAILY_BONUS_KEY, todayKey());
  awardChips(DAILY_BONUS_AMOUNT);
  return { ok: true, amount: DAILY_BONUS_AMOUNT };
}

// ─────────────── CHIP STATS (for unlocks) ───────────────
const STATS_KEY = "casino_stats_v1";
export interface CasinoStats {
  gamesPlayed: number;
  gamesWon: number;
  totalChipsEarned: number;
  eventsCompleted: number;
  coreGamesPlayed: Record<string, number>;
  exclusivesUnlocked: string[];
}

export function getStats(): CasinoStats {
  return loadFromStorage<CasinoStats>(STATS_KEY, {
    gamesPlayed: 0, gamesWon: 0, totalChipsEarned: 0, eventsCompleted: 0,
    coreGamesPlayed: {}, exclusivesUnlocked: [],
  });
}

function saveStats(s: CasinoStats) { saveToStorage(STATS_KEY, s); }

export function recordGamePlayed(coreGameId?: string) {
  const s = getStats();
  s.gamesPlayed += 1;
  if (coreGameId) s.coreGamesPlayed[coreGameId] = (s.coreGamesPlayed[coreGameId] || 0) + 1;
  saveStats(s);
}

export function recordGameWon() { const s = getStats(); s.gamesWon += 1; saveStats(s); }
function recordChipsEarned(n: number) { const s = getStats(); s.totalChipsEarned += n; saveStats(s); }
export function recordEventCompleted() { const s = getStats(); s.eventsCompleted += 1; saveStats(s); }

// ─────────────── NON-CASINO USAGE TRACKING ───────────────
const NON_CASINO_KEY = "casino_non_tools_used";
export function recordNonCasinoToolUsed(toolId: string) {
  const list = loadFromStorage<string[]>(NON_CASINO_KEY, []);
  if (!list.includes(toolId)) {
    list.push(toolId);
    saveToStorage(NON_CASINO_KEY, list);
  }
}
export function getNonCasinoToolsUsedCount(): number {
  return loadFromStorage<string[]>(NON_CASINO_KEY, []).length;
}

// ─────────────── MEMBERSHIP TIERS ───────────────
export type MemberTier = "none" | "basic" | "plus" | "elite";

export interface TierDef {
  id: MemberTier;
  label: string;
  emoji: string;
  color: string;
  passLevels: number;
  description: string;
  /** Returns { reached, progress, target, hint } for current state. */
  unlockCheck: () => { reached: boolean; progress: number; target: number; hint: string };
}

export const TIERS: TierDef[] = [
  {
    id: "basic", label: "Casino Membership", emoji: "🥉", color: "180 50% 60%", passLevels: 10,
    description: "Your first step into the casino.",
    unlockCheck: () => {
      const tools = getNonCasinoToolsUsedCount();
      const earned = getStats().totalChipsEarned;
      const a = tools >= 5;
      const b = earned >= 250;
      const reached = a || b;
      // best progress side
      const aPct = tools / 5, bPct = earned / 250;
      if (aPct >= bPct) return { reached, progress: tools, target: 5, hint: "Use 5 different non-casino tools" };
      return { reached, progress: earned, target: 250, hint: "Earn 250 lifetime chips" };
    },
  },
  {
    id: "plus", label: "Casino+", emoji: "🥈", color: "45 95% 55%", passLevels: 20,
    description: "Premium tier. Better rewards, sharper visuals.",
    unlockCheck: () => {
      const earned = getStats().totalChipsEarned;
      return { reached: earned >= 750, progress: earned, target: 750, hint: "Earn 750 lifetime chips" };
    },
  },
  {
    id: "elite", label: "Casino Elite", emoji: "🥇", color: "0 80% 55%", passLevels: 30,
    description: "Top of the house. Exclusive everything.",
    unlockCheck: () => {
      const earned = getStats().totalChipsEarned;
      return { reached: earned >= 1500, progress: earned, target: 1500, hint: "Earn 1500 lifetime chips" };
    },
  },
];

const MEMBER_KEY = "casino_member_tiers_v2";
const MEMBER_XP_KEY = "casino_member_xp_v2";

interface MemberState { unlocked: MemberTier[]; }

export function getMemberState(): MemberState {
  return loadFromStorage<MemberState>(MEMBER_KEY, { unlocked: [] });
}

export function highestTier(): MemberTier {
  const u = getMemberState().unlocked;
  if (u.includes("elite")) return "elite";
  if (u.includes("plus")) return "plus";
  if (u.includes("basic")) return "basic";
  return "none";
}

/** Legacy compat. */
export function isMember(): boolean { return highestTier() !== "none"; }

/** XP per tier. Each level = 100 XP. */
export function getTierXP(tier: MemberTier): number {
  if (tier === "none") return 0;
  const m = loadFromStorage<Record<string, number>>(MEMBER_XP_KEY, {});
  return m[tier] || 0;
}

export function addTierXP(amount: number) {
  const tier = highestTier();
  if (tier === "none") return;
  const m = loadFromStorage<Record<string, number>>(MEMBER_XP_KEY, {});
  const prev = m[tier] || 0;
  const tdef = TIERS.find((t) => t.id === tier)!;
  const cap = tdef.passLevels * 100;
  m[tier] = Math.min(cap, prev + amount);
  saveToStorage(MEMBER_XP_KEY, m);
}

export function tierLevel(tier: MemberTier): number {
  if (tier === "none") return 0;
  return Math.floor(getTierXP(tier) / 100);
}

export function tierProgressInLevel(tier: MemberTier): { pct: number; current: number; needed: number } {
  if (tier === "none") return { pct: 0, current: 0, needed: 100 };
  const xp = getTierXP(tier);
  const inLevel = xp % 100;
  return { pct: inLevel, current: inLevel, needed: 100 };
}

/** Newly unlocked tiers since last check. */
export function checkTierUnlocks(): MemberTier[] {
  const state = getMemberState();
  const newly: MemberTier[] = [];
  for (const t of TIERS) {
    if (state.unlocked.includes(t.id)) continue;
    if (t.unlockCheck().reached) {
      state.unlocked.push(t.id);
      newly.push(t.id);
      // Bonus chips on tier unlock
      awardChips(50);
    }
  }
  if (newly.length) saveToStorage(MEMBER_KEY, state);
  return newly;
}

/** Pass-level reward registry. */
export interface PassReward {
  level: number;
  label: string;
  emoji: string;
  type: "shop_item" | "chips" | "cosmetic";
  payload: string | number;
}

function buildPassRewards(tier: MemberTier): PassReward[] {
  if (tier === "none") return [];
  const tdef = TIERS.find((t) => t.id === tier)!;
  const rewards: PassReward[] = [];
  for (let i = 1; i <= tdef.passLevels; i++) {
    if (i % 5 === 0) rewards.push({ level: i, label: `+${i * 10} chips`, emoji: "💰", type: "chips", payload: i * 10 });
    else if (i % 3 === 0) rewards.push({ level: i, label: `${tdef.label} Cosmetic`, emoji: "✨", type: "cosmetic", payload: `${tier}_cos_${i}` });
    else rewards.push({ level: i, label: `+${20 + i * 2} chips`, emoji: "🪙", type: "chips", payload: 20 + i * 2 });
  }
  return rewards;
}

const PASS_CLAIMED_KEY = "casino_pass_claimed_v1";
export function getPassRewards(tier: MemberTier): PassReward[] { return buildPassRewards(tier); }
export function getClaimedPassLevels(tier: MemberTier): number[] {
  const m = loadFromStorage<Record<string, number[]>>(PASS_CLAIMED_KEY, {});
  return m[tier] || [];
}
export function claimPassReward(tier: MemberTier, level: number): { ok: boolean; reason?: string; reward?: PassReward } {
  if (tierLevel(tier) < level) return { ok: false, reason: "Level not reached yet" };
  const claimed = getClaimedPassLevels(tier);
  if (claimed.includes(level)) return { ok: false, reason: "Already claimed" };
  const reward = buildPassRewards(tier).find((r) => r.level === level);
  if (!reward) return { ok: false, reason: "No such reward" };
  if (reward.type === "chips") awardChips(reward.payload as number);
  const m = loadFromStorage<Record<string, number[]>>(PASS_CLAIMED_KEY, {});
  m[tier] = [...claimed, level];
  saveToStorage(PASS_CLAIMED_KEY, m);
  return { ok: true, reward };
}

/** Legacy export — kept for callers that still test on win. */
export function checkMembership(): boolean {
  const newly = checkTierUnlocks();
  return newly.length > 0;
}

// ─────────────── CHIP SHOP (EXPANDED) ───────────────
export interface ShopItem {
  id: string;
  label: string;
  emoji: string;
  cost: number;
  category: "theme" | "fx" | "sound" | "ui";
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Themes
  { id: "theme_velvet",    label: "Velvet Casino",       emoji: "🟣", cost: 50,  category: "theme",  description: "Deep purple felt + gold trim." },
  { id: "theme_obsidian",  label: "Obsidian VIP",        emoji: "⚫", cost: 80,  category: "theme",  description: "Pitch-black UI with neon-gold accents." },
  { id: "theme_emerald",   label: "Emerald Lounge",      emoji: "🟢", cost: 90,  category: "theme",  description: "High-roller emerald with brass details." },
  { id: "theme_ruby",      label: "Ruby Pit",            emoji: "🔴", cost: 110, category: "theme",  description: "Saturated ruby reds — pure intensity." },
  { id: "theme_platinum",  label: "Platinum Suite",      emoji: "⚪", cost: 150, category: "theme",  description: "Cool platinum + cream — millionaire vibes." },
  { id: "theme_midnight",  label: "Midnight Vault",      emoji: "🌑", cost: 70,  category: "theme",  description: "Black-on-black with subtle gold pulse." },
  // FX
  { id: "fx_chip_rain",    label: "Chip Rain on Win",    emoji: "💸", cost: 40,  category: "fx",     description: "Cascading chips fall on every win." },
  { id: "fx_neon_pulse",   label: "Neon Pulse Borders",  emoji: "💡", cost: 35,  category: "fx",     description: "Glowing pulse around your chip counter." },
  { id: "fx_gold_sparks",  label: "Gold Sparks Trail",   emoji: "✨", cost: 45,  category: "fx",     description: "Gold sparks follow your cursor in the casino." },
  { id: "fx_screen_shake", label: "Big-Win Screen Shake",emoji: "📳", cost: 60,  category: "fx",     description: "Adds satisfying shake on jackpots." },
  { id: "fx_card_burn",    label: "Burning Card Reveal", emoji: "🔥", cost: 75,  category: "fx",     description: "Cards reveal with a flame animation." },
  { id: "fx_starfield",    label: "Starfield Backdrop",  emoji: "🌌", cost: 90,  category: "fx",     description: "Animated starfield behind the casino hub." },
  // Sound
  { id: "sound_velvet",    label: "Velvet Dealer Voice", emoji: "🎙️", cost: 60,  category: "sound",  description: "Smooth cinematic announcements on big wins." },
  { id: "sound_jackpot",   label: "Jackpot Sirens Pack", emoji: "🚨", cost: 45,  category: "sound",  description: "Old-school sirens replace win chimes." },
  { id: "sound_lounge",    label: "Lounge Ambience",     emoji: "🎷", cost: 55,  category: "sound",  description: "Soft jazz hum across casino games." },
  { id: "sound_arcade",    label: "Arcade Bleeps",       emoji: "🕹️", cost: 40,  category: "sound",  description: "Retro 8-bit pings on every action." },
  // UI
  { id: "ui_gold_ring",    label: "Gold Ring Cursor",    emoji: "💍", cost: 30,  category: "ui",     description: "Cursor leaves a faint gold trail." },
  { id: "ui_chip_skin",    label: "Antique Chip Skin",   emoji: "🪙", cost: 55,  category: "ui",     description: "Vintage casino chip icon." },
  { id: "ui_neon_chip",    label: "Neon Chip Skin",      emoji: "💠", cost: 65,  category: "ui",     description: "Glowing neon chip icon." },
  { id: "ui_diamond_chip", label: "Diamond Chip Skin",   emoji: "💎", cost: 120, category: "ui",     description: "Diamond-cut chip icon — premium look." },
  { id: "ui_velvet_cards", label: "Velvet Card Backs",   emoji: "🃏", cost: 50,  category: "ui",     description: "Plush velvet pattern card backs." },
  { id: "ui_gold_buttons", label: "Gold Button Frames",  emoji: "🟡", cost: 70,  category: "ui",     description: "All casino buttons get gold borders." },
  { id: "ui_neon_buttons", label: "Neon Button Frames",  emoji: "🟦", cost: 70,  category: "ui",     description: "All casino buttons get neon borders." },
];

const OWNED_KEY = "casino_shop_owned";
const EQUIPPED_KEY = "casino_shop_equipped_v1";

export function getOwned(): string[] { return loadFromStorage<string[]>(OWNED_KEY, []); }
export function isOwned(id: string): boolean { return getOwned().includes(id); }

export function getEquipped(): Record<string, string | null> {
  return loadFromStorage<Record<string, string | null>>(EQUIPPED_KEY, {});
}

export function isEquipped(id: string): boolean {
  const item = SHOP_ITEMS.find((i) => i.id === id);
  if (!item) return false;
  return getEquipped()[item.category] === id;
}

/** Equip an item (one per category). */
export function equip(id: string): boolean {
  const item = SHOP_ITEMS.find((i) => i.id === id);
  if (!item || !isOwned(id)) return false;
  const e = getEquipped();
  e[item.category] = id;
  saveToStorage(EQUIPPED_KEY, e);
  return true;
}

export function unequip(category: ShopItem["category"]) {
  const e = getEquipped();
  e[category] = null;
  saveToStorage(EQUIPPED_KEY, e);
}

export function buy(id: string): { ok: boolean; reason?: string } {
  if (isOwned(id)) return { ok: false, reason: "Already owned" };
  const item = SHOP_ITEMS.find((i) => i.id === id);
  if (!item) return { ok: false, reason: "Unknown item" };
  if (!spendChips(item.cost)) return { ok: false, reason: "Not enough chips" };
  saveToStorage(OWNED_KEY, [...getOwned(), id]);
  return { ok: true };
}

/** Sell back at 90% (rounded). */
export function sellBack(id: string): { ok: boolean; refund?: number; reason?: string } {
  if (!isOwned(id)) return { ok: false, reason: "You don't own it" };
  const item = SHOP_ITEMS.find((i) => i.id === id);
  if (!item) return { ok: false, reason: "Unknown item" };
  const refund = Math.floor(item.cost * 0.9);
  awardChips(refund);
  saveToStorage(OWNED_KEY, getOwned().filter((x) => x !== id));
  // Auto-unequip if equipped
  if (isEquipped(id)) unequip(item.category);
  return { ok: true, refund };
}

// ─────────────── DAILY EVENTS ───────────────
export interface DailyEvent {
  day: number;
  name: string;
  emoji: string;
  description: string;
  winMultiplier: number;
  bonusOnPlay: number;
  visualMode?: "neon" | "gold" | "silent" | "chaos" | "cinematic";
}

export const DAILY_EVENTS: DailyEvent[] = [
  { day: 1,  name: "Grand Opening",   emoji: "🎉", description: "+5 bonus chips every game.",        winMultiplier: 1,    bonusOnPlay: 5 },
  { day: 2,  name: "Lucky Doubles",   emoji: "🍀", description: "All payouts ×2.",                   winMultiplier: 2,    bonusOnPlay: 0 },
  { day: 3,  name: "Neon Surge",      emoji: "💡", description: "Visuals turn neon. Pure vibes.",    winMultiplier: 1.1,  bonusOnPlay: 0, visualMode: "neon" },
  { day: 4,  name: "Dealer Shift",    emoji: "🎩", description: "AI dealers play smarter.",          winMultiplier: 1.5,  bonusOnPlay: 0 },
  { day: 5,  name: "Golden Night",    emoji: "🌙", description: "Casino bathed in gold.",            winMultiplier: 1.25, bonusOnPlay: 0, visualMode: "gold" },
  { day: 6,  name: "High Stakes Day", emoji: "🔥", description: "Wins ×3, losses sting more.",       winMultiplier: 3,    bonusOnPlay: 0 },
  { day: 7,  name: "Mid-Season Boost",emoji: "🎁", description: "+10 chips per game.",               winMultiplier: 1,    bonusOnPlay: 10 },
  { day: 8,  name: "Silent Casino",   emoji: "🤫", description: "Sound dialed back. Focus mode.",    winMultiplier: 1.2,  bonusOnPlay: 0, visualMode: "silent" },
  { day: 9,  name: "Jackpot Week",    emoji: "🎰", description: "Rare wins are 4× more frequent.",   winMultiplier: 1.5,  bonusOnPlay: 0 },
  { day: 10, name: "Wild Mode",       emoji: "🌀", description: "Random multipliers per session.",   winMultiplier: 2,    bonusOnPlay: 0, visualMode: "chaos" },
  { day: 11, name: "VIP Preview",     emoji: "🎟️", description: "Locked games briefly playable.",    winMultiplier: 1,    bonusOnPlay: 0 },
  { day: 12, name: "Double Stakes",   emoji: "💰", description: "Bets ×2, payouts ×2.",              winMultiplier: 2,    bonusOnPlay: 0 },
  { day: 13, name: "Final Build-Up",  emoji: "⚡", description: "Progress accelerated.",             winMultiplier: 1.5,  bonusOnPlay: 5 },
  { day: 14, name: "Grand Finale",    emoji: "🏆", description: "Cinematic finish — wins ×5.",       winMultiplier: 5,    bonusOnPlay: 15, visualMode: "cinematic" },
];

export function getActiveEvent(daysIn: number): DailyEvent {
  const d = Math.max(1, Math.min(14, daysIn + 1));
  return DAILY_EVENTS.find((e) => e.day === d) || DAILY_EVENTS[0];
}

export function applyEventPayout(rawPayout: number, daysIn: number): number {
  const e = getActiveEvent(daysIn);
  return Math.floor(rawPayout * e.winMultiplier + e.bonusOnPlay);
}

// ─────────────── PERMANENT SEASONAL UNLOCKS ───────────────
const PERM_UNLOCK_KEY = "casino_perm_unlocks_v1";

export function getPermanentlyUnlocked(): string[] {
  return loadFromStorage<string[]>(PERM_UNLOCK_KEY, []);
}

export function permanentlyUnlock(id: string): boolean {
  const list = getPermanentlyUnlocked();
  if (list.includes(id)) return false;
  saveToStorage(PERM_UNLOCK_KEY, [...list, id]);
  const s = getStats();
  if (!s.exclusivesUnlocked.includes(id)) {
    s.exclusivesUnlocked.push(id);
    saveStats(s);
  }
  return true;
}

export function isPermanentlyUnlocked(id: string): boolean {
  return getPermanentlyUnlocked().includes(id);
}
