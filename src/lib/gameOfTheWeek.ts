import { TOOLS, type ToolId } from "./toolMeta";

/** ISO week number — used to deterministically pick a featured tool each week. */
function getWeekNumber(d = new Date()): number {
  const onejan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - onejan.getTime()) / 86_400_000) + onejan.getDay() + 1) / 7);
}

/** Picks one tool per ISO week deterministically. Excludes "dashboard". */
export function getGameOfTheWeek() {
  const candidates = TOOLS.filter((t) => t.id !== "dashboard");
  const week = getWeekNumber();
  const tool = candidates[week % candidates.length];
  return { tool, week };
}

export function isGameOfTheWeek(id: ToolId): boolean {
  return getGameOfTheWeek().tool.id === id;
}
