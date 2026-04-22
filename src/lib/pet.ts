import { loadFromStorage, saveToStorage } from "./storage";

export interface PetState {
  name: string;
  mood: "happy" | "neutral" | "sleepy" | "hyped" | "hungry";
  energy: number; // 0-100
  hunger: number; // 0-100 (higher = more hungry)
  affection: number; // 0-100
  level: number; // grows from interactions
  xp: number; // 0-100, fills the level bar
  pos: { x: number; y: number }; // bottom/right offset in px
  lastInteract: number;
  lastTick: number;
}

const DEFAULT: PetState = {
  name: "Pip",
  mood: "neutral",
  energy: 60,
  hunger: 30,
  affection: 50,
  level: 1,
  xp: 0,
  pos: { x: 16, y: 16 },
  lastInteract: 0,
  lastTick: Date.now(),
};

function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

function deriveMood(s: Pick<PetState, "energy" | "hunger" | "affection">): PetState["mood"] {
  if (s.hunger > 75) return "hungry";
  if (s.energy < 20) return "sleepy";
  if (s.energy > 80 && s.affection > 60) return "hyped";
  if (s.affection > 50) return "happy";
  return "neutral";
}

function gainXp(s: PetState, amount: number): PetState {
  let xp = s.xp + amount;
  let level = s.level;
  while (xp >= 100) { xp -= 100; level += 1; }
  return { ...s, xp, level };
}

export function getPet(): PetState {
  const stored = loadFromStorage<PetState>("pet_v2", DEFAULT);
  // Merge defaults for old save shapes
  return { ...DEFAULT, ...stored, pos: { ...DEFAULT.pos, ...(stored.pos ?? {}) } };
}

/** Apply passive time-decay (called whenever we read or interact). */
export function tickPet(): PetState {
  const s = getPet();
  const now = Date.now();
  const minutesElapsed = (now - s.lastTick) / 60_000;
  if (minutesElapsed < 0.1) return s;
  // Hunger goes up over time, energy slowly recovers if not hungry
  const hunger = clamp(s.hunger + minutesElapsed * 1.2);
  const energy = clamp(s.energy + (hunger < 60 ? minutesElapsed * 0.6 : -minutesElapsed * 0.3));
  const affection = clamp(s.affection - minutesElapsed * 0.2);
  const next: PetState = {
    ...s,
    hunger,
    energy,
    affection,
    lastTick: now,
    mood: deriveMood({ hunger, energy, affection }),
  };
  saveToStorage("pet_v2", next);
  return next;
}

export function petAction(action: "pet" | "feed" | "play"): PetState {
  let s = tickPet();
  const now = Date.now();
  if (action === "pet") {
    s = { ...s, affection: clamp(s.affection + 8), lastInteract: now };
    s = gainXp(s, 4);
  } else if (action === "feed") {
    s = { ...s, hunger: clamp(s.hunger - 30), energy: clamp(s.energy + 10), lastInteract: now };
    s = gainXp(s, 6);
  } else if (action === "play") {
    s = {
      ...s,
      energy: clamp(s.energy - 10),
      affection: clamp(s.affection + 12),
      hunger: clamp(s.hunger + 5),
      lastInteract: now,
    };
    s = gainXp(s, 10);
  }
  s = { ...s, mood: deriveMood(s) };
  saveToStorage("pet_v2", s);
  return s;
}

export function setPetPosition(x: number, y: number): PetState {
  const s = getPet();
  const next = { ...s, pos: { x, y } };
  saveToStorage("pet_v2", next);
  return next;
}

export function renamePet(name: string): PetState {
  const s = getPet();
  const next = { ...s, name: name.slice(0, 12) || "Pip" };
  saveToStorage("pet_v2", next);
  return next;
}

export function petEmoji(s: Pick<PetState, "mood" | "level">): string {
  // Evolves with level
  if (s.level >= 8) return s.mood === "hyped" ? "🐉" : "🐲";
  if (s.level >= 5) return s.mood === "hyped" ? "🦋" : s.mood === "sleepy" ? "🐛" : "🐝";
  if (s.level >= 3) return { happy: "🐤", neutral: "🐥", sleepy: "😴", hyped: "🐦", hungry: "🍽️" }[s.mood];
  return { happy: "😊", neutral: "🐣", sleepy: "💤", hyped: "🤩", hungry: "🍪" }[s.mood];
}

// Legacy compatibility — still imported by old PixelPet (pre-rework). No-op wrapper.
export function pokePet(): PetState { return petAction("pet"); }
