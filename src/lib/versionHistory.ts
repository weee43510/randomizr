import { loadFromStorage, saveToStorage } from "./storage";

/** Snapshot the current localStorage state so the user can roll back. */
export interface VersionSnapshot {
  id: string;
  label: string;
  createdAt: number;
  data: Record<string, string>;
}

const KEY = "version_snapshots";
const MAX = 5;

export function listSnapshots(): VersionSnapshot[] {
  return loadFromStorage<VersionSnapshot[]>(KEY, []);
}

export function takeSnapshot(label: string): VersionSnapshot {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith("randomizr_") && k !== `randomizr_${KEY}`) {
      data[k] = localStorage.getItem(k) ?? "";
    }
  }
  const snap: VersionSnapshot = {
    id: `snap_${Date.now()}`,
    label: label || `Snapshot ${new Date().toLocaleString()}`,
    createdAt: Date.now(),
    data,
  };
  const list = [snap, ...listSnapshots()].slice(0, MAX);
  saveToStorage(KEY, list);
  return snap;
}

export function restoreSnapshot(id: string): boolean {
  const snap = listSnapshots().find((s) => s.id === id);
  if (!snap) return false;
  // Wipe current randomizr_ keys first (except the snapshot list itself)
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith("randomizr_") && k !== `randomizr_${KEY}`) {
      localStorage.removeItem(k);
    }
  }
  Object.entries(snap.data).forEach(([k, v]) => localStorage.setItem(k, v));
  return true;
}

export function deleteSnapshot(id: string) {
  saveToStorage(KEY, listSnapshots().filter((s) => s.id !== id));
}
