import { loadFromStorage, saveToStorage } from "@/lib/storage";

/**
 * Returns a random index from `pool` that hasn't been used yet (per `key`).
 * When all are used, the used set resets automatically.
 */
export function pickNoRepeat<T>(key: string, pool: T[]): { item: T; index: number; cycled: boolean } {
  if (pool.length === 0) throw new Error("Empty pool");
  let used = loadFromStorage<number[]>(`used_${key}`, []);
  let cycled = false;
  if (used.length >= pool.length) {
    used = [];
    cycled = true;
  }
  const available: number[] = [];
  for (let i = 0; i < pool.length; i++) if (!used.includes(i)) available.push(i);
  const idx = available[Math.floor(Math.random() * available.length)];
  used.push(idx);
  saveToStorage(`used_${key}`, used);
  return { item: pool[idx], index: idx, cycled };
}

export function resetNoRepeat(key: string) {
  saveToStorage(`used_${key}`, [] as number[]);
}

export function noRepeatStats(key: string, total: number) {
  const used = loadFromStorage<number[]>(`used_${key}`, []);
  return { used: used.length, total, remaining: Math.max(0, total - used.length) };
}
