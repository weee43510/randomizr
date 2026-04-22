import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Music2, Play, RotateCcw } from "lucide-react";

interface Note { id: number; lane: number; spawnedAt: number; }

const LANES = 4;
const FALL_MS = 1800; // time from spawn to hit zone
const HIT_WINDOW = 220; // ms
const PERFECT_WINDOW = 90;
const LANE_KEYS = ["A", "S", "D", "F"];

export default function RhythmTap() {
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; lane: number; key: number } | null>(null);
  const [time, setTime] = useState(30);
  const [best, setBest] = useState<number>(() => loadFromStorage("rhythmtap_best", 0));
  const idRef = useRef(0);
  const fbKey = useRef(0);

  // Spawner
  useEffect(() => {
    if (!running) return;
    const spawn = () => {
      setNotes((prev) => [
        ...prev,
        { id: idRef.current++, lane: Math.floor(Math.random() * LANES), spawnedAt: Date.now() },
      ]);
    };
    spawn();
    const id = setInterval(spawn, 700 - Math.min(300, score * 4));
    return () => clearInterval(id);
  }, [running, score]);

  // Cleanup missed notes + tick countdown
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setNotes((prev) => {
        const now = Date.now();
        const missed = prev.filter((n) => now - n.spawnedAt > FALL_MS + HIT_WINDOW);
        if (missed.length > 0) {
          setCombo(0);
        }
        return prev.filter((n) => now - n.spawnedAt <= FALL_MS + HIT_WINDOW);
      });
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      if (score > best) { setBest(score); saveToStorage("rhythmtap_best", score); celebrate("medium"); }
      sounds.win();
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, running]);

  // Keyboard input
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      const idx = LANE_KEYS.indexOf(e.key.toUpperCase());
      if (idx === -1) return;
      hit(idx);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, notes]);

  const hit = (lane: number) => {
    const now = Date.now();
    let bestNote: Note | null = null;
    let bestDelta = Infinity;
    notes.forEach((n) => {
      if (n.lane !== lane) return;
      const delta = Math.abs(now - n.spawnedAt - FALL_MS);
      if (delta < HIT_WINDOW && delta < bestDelta) { bestNote = n; bestDelta = delta; }
    });
    if (!bestNote) {
      setCombo(0);
      sounds.flip();
      return;
    }
    const isPerfect = bestDelta < PERFECT_WINDOW;
    const points = isPerfect ? 10 : 5;
    setScore((s) => s + points + Math.floor(combo / 5));
    setCombo((c) => { const n = c + 1; setMaxCombo((m) => Math.max(m, n)); return n; });
    setNotes((prev) => prev.filter((n) => n.id !== bestNote!.id));
    sounds.click();
    setFeedback({ text: isPerfect ? "PERFECT" : "GOOD", lane, key: ++fbKey.current });
    setTimeout(() => setFeedback((f) => f && f.key === fbKey.current ? null : f), 500);
  };

  const start = () => {
    setRunning(true); setScore(0); setCombo(0); setMaxCombo(0);
    setNotes([]); setTime(30);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground inline-flex items-center gap-2">
          <Music2 className="w-3 h-3" /> 30 SECONDS · KEYS A S D F
        </p>
        <h2 className="text-4xl font-display font-black gradient-text">Rhythm Tap</h2>
        <p className="text-xs text-muted-foreground">Tap or press the lane key when notes hit the line.</p>
      </header>

      <div className="flex justify-center gap-6 text-sm font-mono">
        <span>⏱ {time}s</span>
        <span>Score: <b className="neon-text-cyan">{score}</b></span>
        <span>Combo: <b>{combo}</b></span>
        <span className="text-muted-foreground">Best: {best}</span>
      </div>

      <div className="relative h-80 rounded-2xl glass-card overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4">
          {Array.from({ length: LANES }).map((_, i) => (
            <div key={i} className="border-r border-border/20 last:border-r-0 relative">
              {/* Falling notes */}
              {notes.filter((n) => n.lane === i).map((n) => {
                const elapsed = Date.now() - n.spawnedAt;
                const pct = Math.min(100, (elapsed / FALL_MS) * 100);
                return (
                  <div
                    key={n.id}
                    className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl"
                    style={{
                      top: `calc(${pct}% - 24px)`,
                      background: `hsl(var(--neon-${["cyan","violet","pink","green"][i]}) / 0.7)`,
                      boxShadow: `0 0 20px hsl(var(--neon-${["cyan","violet","pink","green"][i]}) / 0.5)`,
                      transition: "none",
                    }}
                  />
                );
              })}
              {/* Hit feedback */}
              {feedback && feedback.lane === i && (
                <span
                  key={feedback.key}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 text-xs font-mono font-bold animate-pop-in"
                  style={{ color: feedback.text === "PERFECT" ? "hsl(var(--neon-green))" : "hsl(var(--neon-cyan))" }}
                >
                  {feedback.text}
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Hit line */}
        <div className="absolute left-0 right-0 bottom-12 h-0.5 bg-neon-cyan/60" style={{ boxShadow: "0 0 12px hsl(var(--neon-cyan))" }} />

        {/* Lane buttons */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-4">
          {Array.from({ length: LANES }).map((_, i) => (
            <button
              key={i}
              onPointerDown={() => running && hit(i)}
              className="h-12 border-r border-border/30 last:border-r-0 spring-btn font-mono text-sm font-bold text-muted-foreground hover:bg-muted/30 active:bg-primary/20"
              disabled={!running}
            >
              {LANE_KEYS[i]}
            </button>
          ))}
        </div>

        {!running && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <button
              onClick={start}
              className="spring-btn px-8 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold neon-glow-cyan inline-flex items-center gap-2"
            >
              {time === 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {time === 0 ? `AGAIN · max combo ${maxCombo}` : "START"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
