import { loadFromStorage, saveToStorage } from "./storage";
import { celebrate } from "./confetti";
import { toast } from "sonner";

interface StreakState {
  current: number;
  best: number;
  lastDay: string; // YYYY-MM-DD
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export function getStreak(): StreakState {
  return loadFromStorage<StreakState>("daily_streak", { current: 0, best: 0, lastDay: "" });
}

/** Call once per app boot. Updates streak based on today's visit. */
export function tickDailyStreak(): StreakState {
  const s = getStreak();
  const today = todayStr();
  if (s.lastDay === today) return s; // already counted today
  let next: StreakState;
  if (s.lastDay === yesterdayStr()) {
    next = { current: s.current + 1, best: Math.max(s.best, s.current + 1), lastDay: today };
  } else {
    next = { current: 1, best: Math.max(s.best, 1), lastDay: today };
  }
  saveToStorage("daily_streak", next);
  // Celebrate every 7 days
  if (next.current > 1 && next.current % 7 === 0) {
    setTimeout(() => {
      celebrate("big");
      toast.success(`🔥 ${next.current}-day streak! You're on fire.`);
    }, 800);
  } else if (next.current > 1) {
    setTimeout(() => toast(`🔥 Day ${next.current} — keep it up!`), 800);
  }
  return next;
}
