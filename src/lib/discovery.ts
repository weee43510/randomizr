/** Tracking for Trending / Hot / Most-replayed homepage categories. */
import { loadFromStorage, saveToStorage } from "./storage";
import { TOOLS, type ToolId } from "./toolMeta";

interface UsageEvent { id: string; ts: number; }
const EVENTS_KEY = "tool_events_v1";
const MAX_EVENTS = 500;

export function recordToolEvent(id: string) {
  const events = loadFromStorage<UsageEvent[]>(EVENTS_KEY, []);
  events.push({ id, ts: Date.now() });
  // trim
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  saveToStorage(EVENTS_KEY, events);
}

function getEvents(): UsageEvent[] {
  return loadFromStorage<UsageEvent[]>(EVENTS_KEY, []);
}

/** Trending = most opened in last 7 days, weighted by recency */
export function getTrending(limit = 4): { id: ToolId; score: number }[] {
  const events = getEvents();
  const cutoff = Date.now() - 7 * 86400000;
  const recent = events.filter((e) => e.ts >= cutoff);
  const scores: Record<string, number> = {};
  for (const e of recent) {
    const ageDays = (Date.now() - e.ts) / 86400000;
    const weight = Math.max(0.2, 1 - ageDays / 7);
    scores[e.id] = (scores[e.id] || 0) + weight;
  }
  return Object.entries(scores)
    .map(([id, score]) => ({ id: id as ToolId, score }))
    .filter(({ id }) => TOOLS.some((t) => t.id === id))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Hot right now = most opened in last 24h */
export function getHotNow(limit = 4): { id: ToolId; count: number }[] {
  const events = getEvents();
  const cutoff = Date.now() - 86400000;
  const recent = events.filter((e) => e.ts >= cutoff);
  const counts: Record<string, number> = {};
  for (const e of recent) counts[e.id] = (counts[e.id] || 0) + 1;
  return Object.entries(counts)
    .map(([id, count]) => ({ id: id as ToolId, count }))
    .filter(({ id }) => TOOLS.some((t) => t.id === id))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Most replayed = highest "return rate": multiple sessions on different days */
export function getMostReplayed(limit = 4): { id: ToolId; days: number }[] {
  const events = getEvents();
  const dayBuckets: Record<string, Set<string>> = {};
  for (const e of events) {
    const day = new Date(e.ts).toISOString().slice(0, 10);
    if (!dayBuckets[e.id]) dayBuckets[e.id] = new Set();
    dayBuckets[e.id].add(day);
  }
  return Object.entries(dayBuckets)
    .map(([id, set]) => ({ id: id as ToolId, days: set.size }))
    .filter(({ id, days }) => days >= 2 && TOOLS.some((t) => t.id === id))
    .sort((a, b) => b.days - a.days)
    .slice(0, limit);
}
