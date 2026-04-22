import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Rocket, Play, RotateCcw } from "lucide-react";

interface Balloon { id: number; x: number; y: number; speed: number; emoji: string; bomb?: boolean; gold?: boolean; }

const EMOJIS = ["🎈", "🎈", "🎈", "🎈", "🎀", "💖"];

export default function BalloonPop() {
  const [running, setRunning] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [time, setTime] = useState(45);
  const [best, setBest] = useState<number>(() => loadFromStorage("balloonpop_best", 0));
  const idRef = useRef(0);

  // Spawn balloons
  useEffect(() => {
    if (!running) return;
    const spawn = () => {
      const r = Math.random();
      const bomb = r < 0.12;
      const gold = !bomb && r > 0.92;
      setBalloons((prev) => [...prev, {
        id: idRef.current++,
        x: 5 + Math.random() * 85,
        y: 100,
        speed: 0.4 + Math.random() * 0.5 + Math.min(0.6, score * 0.005),
        emoji: bomb ? "💣" : gold ? "🌟" : EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        bomb, gold,
      }]);
    };
    const id = setInterval(spawn, 600);
    return () => clearInterval(id);
  }, [running, score]);

  // Move balloons
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setBalloons((prev) => {
        const next: Balloon[] = [];
        let escaped = 0;
        prev.forEach((b) => {
          const ny = b.y - b.speed;
          if (ny < -8) { if (!b.bomb) escaped++; }
          else next.push({ ...b, y: ny });
        });
        if (escaped > 0) setMisses((m) => m + escaped);
        return next;
      });
    }, 30);
    return () => clearInterval(id);
  }, [running]);

  // Timer
  useEffect(() => {
    if (!running) return;
    if (time <= 0 || misses >= 5) {
      setRunning(false);
      if (score > best) { setBest(score); saveToStorage("balloonpop_best", score); celebrate("medium"); }
      sounds.win();
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [time, misses, running]);

  const pop = (b: Balloon) => {
    setBalloons((prev) => prev.filter((x) => x.id !== b.id));
    if (b.bomb) {
      setMisses((m) => m + 2);
      sounds.flip();
    } else {
      setScore((s) => s + (b.gold ? 5 : 1));
      sounds.click();
    }
  };

  const start = () => {
    setRunning(true); setScore(0); setMisses(0); setBalloons([]); setTime(45);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground inline-flex items-center gap-2">
          <Rocket className="w-3 h-3" /> POP THE 🎈 · AVOID 💣
        </p>
        <h2 className="text-4xl font-display font-black gradient-text">Balloon Pop</h2>
        <p className="text-xs text-muted-foreground">5 misses or 45 seconds — gold stars are worth 5.</p>
      </header>

      <div className="flex justify-center gap-6 text-sm font-mono">
        <span>⏱ {time}s</span>
        <span>Score: <b className="neon-text-cyan">{score}</b></span>
        <span>Misses: <b className={misses >= 3 ? "text-destructive" : ""}>{misses}/5</b></span>
        <span className="text-muted-foreground">Best: {best}</span>
      </div>

      <div className="relative h-96 rounded-2xl glass-card overflow-hidden">
        {balloons.map((b) => (
          <button
            key={b.id}
            onPointerDown={() => running && pop(b)}
            className="absolute text-3xl spring-btn select-none"
            style={{ left: `${b.x}%`, top: `${b.y}%`, transition: "none" }}
          >
            {b.emoji}
          </button>
        ))}
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <button
              onClick={start}
              className="spring-btn px-8 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold neon-glow-cyan inline-flex items-center gap-2"
            >
              {time === 0 || misses >= 5 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {time === 0 || misses >= 5 ? "AGAIN" : "START"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
