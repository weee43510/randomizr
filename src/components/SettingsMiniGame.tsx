import { useEffect, useRef, useState } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Bug } from "lucide-react";

interface Bugger { id: number; x: number; y: number; born: number; }

/** Hidden mini-game inside settings. Simple 15s "squash the bug". */
export default function SettingsMiniGame() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(15);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [bugs, setBugs] = useState<Bugger[]>([]);
  const [best, setBest] = useState<number>(() => loadFromStorage("bugsquash_best", 0));
  const idRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      setBugs([]);
      if (score > best) { setBest(score); saveToStorage("bugsquash_best", score); }
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time, running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setBugs((prev) => {
        const fresh = prev.filter((b) => Date.now() - b.born < 1500);
        if (fresh.length >= 3) return fresh;
        return [...fresh, { id: idRef.current++, x: 5 + Math.random() * 85, y: 5 + Math.random() * 80, born: Date.now() }];
      });
    }, 400);
    return () => clearInterval(id);
  }, [running]);

  const start = () => { setTime(15); setScore(0); setRunning(true); setBugs([]); };
  const squash = (id: number) => { setBugs((b) => b.filter((x) => x.id !== id)); setScore((s) => s + 1); };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="spring-btn flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <Bug className="w-3.5 h-3.5" /> {open ? "Hide" : "Hidden"} mini-game · Bug Squash
      </button>

      {open && (
        <div className="glass-card p-3 space-y-2 animate-fade-in">
          <div className="flex justify-between text-xs font-mono">
            <span>{time}s</span>
            <span>Score: {score}</span>
            <span className="neon-text-cyan">Best: {best}</span>
          </div>
          <div className="relative h-44 rounded-lg bg-muted/30 overflow-hidden border border-border/40">
            {bugs.map((b) => (
              <button
                key={b.id}
                onClick={() => squash(b.id)}
                className="absolute text-2xl spring-btn animate-pop-in"
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
              >
                🐛
              </button>
            ))}
            {!running && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                <button
                  onClick={start}
                  className="px-6 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary text-sm font-bold spring-btn"
                >
                  {time === 0 ? "AGAIN" : "START"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
