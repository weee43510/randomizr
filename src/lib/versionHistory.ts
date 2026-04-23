import { loadFromStorage, saveToStorage } from "./storage";
import { CHANGELOGS } from "./version";

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

// ─────────── Version-based rollback ───────────

/** Strip storage to the "shape" of a given app version. Each known version
 * has a list of localStorage keys that DIDN'T exist yet, and we remove them. */
const POST_VERSION_KEYS: Record<string, string[]> = {
  // Anything introduced AFTER v4.0 should be wiped when rolling back to v4.0
  "4.0.0": [
    "randomizr_achievements", "randomizr_tools_used", "randomizr_themes_used",
    "randomizr_sound_pack", "randomizr_custom_trivia", "randomizr_pet_v2",
    "randomizr_pet", "randomizr_favorites", "randomizr_tool_events_v1",
    "randomizr_season_state_v1", "randomizr_welcome_seen", "randomizr_dev_notes",
    "randomizr_dev_mode", "randomizr_rainbow_unlocked",
  ],
  "5.0.0": [
    "randomizr_sound_pack", "randomizr_custom_trivia", "randomizr_pet_v2",
    "randomizr_pet", "randomizr_favorites", "randomizr_tool_events_v1",
    "randomizr_season_state_v1", "randomizr_welcome_seen",
  ],
  "6.0.0": [
    "randomizr_tool_events_v1", "randomizr_season_state_v1",
  ],
  "6.1.0": [
    "randomizr_tool_events_v1", "randomizr_season_state_v1",
  ],
  "6.2.0": [],
};

export interface RollbackTarget {
  version: string;
  date: string;
  label: string;
  removes: number;
}

export function listVersionTargets(): RollbackTarget[] {
  return CHANGELOGS.map((log) => ({
    version: log.version,
    date: log.date,
    label: `v${log.version} · ${log.date}`,
    removes: (POST_VERSION_KEYS[log.version] || []).length,
  }));
}

/** Rolls back the saved state to look like the given version. Returns true if changed. */
export function rollbackToVersion(version: string): boolean {
  const keys = POST_VERSION_KEYS[version];
  if (!keys) return false;
  // Auto-snapshot before destructive change
  takeSnapshot(`Auto · before rollback to v${version}`);
  for (const k of keys) localStorage.removeItem(k);
  // Stamp the version so the UI knows
  saveToStorage("rolled_back_to", version);
  return true;
}
