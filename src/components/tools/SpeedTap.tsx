import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

interface Target { id: number; x: number; y: number; size: number; born: number; }

const DURATION = 10; // seconds

export default function SpeedTap() {
  const [time, setTime] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [best, setBest] = useState<number>(() => loadFromStorage("speedtap_best", 0));
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      setTargets([]);
      sounds.win();
      if (score > best) { setBest(score); saveToStorage("speedtap_best", score); celebrate("big"); }
      return;
    }
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, running]);

  // Spawn targets
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTargets((prev) => {
        // remove old
        const fresh = prev.filter((t) => Date.now() - t.born < 1100);
        if (fresh.length >= 4) return fresh;
        return [...fresh, {
          id: Date.now() + Math.random(),
          x: 5 + Math.random() * 85,
          y: 5 + Math.random() * 85,
          size: 40 + Math.random() * 30,
          born: Date.now(),
        }];
      });
    }, 320);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    setTime(DURATION);
    setScore(0);
    setCombo(0);
    setRunning(true);
    setTargets([]);
  };

  const tap = (id: number) => {
    setTargets((t) => t.filter((x) => x.id !== id));
    setScore((s) => s + 1 + Math.floor(combo / 3));
    setCombo((c) => c + 1);
    sounds.tick();
  };

  const miss = () => {
    if (!running) return;
    setCombo(0);
    sounds.flip();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">10 SECONDS · TAP IT ALL</p>
        <h2 className="text-4xl font-display font-black gradient-text">Speed Tap</h2>
      </header>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="glass-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Time</p>
          <p className="font-display font-black text-2xl neon-text-cyan">{time}s</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</p>
          <p className="font-display font-black text-2xl">{score}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Combo</p>
          <p className="font-display font-black text-2xl neon-text-violet">×{1 + Math.floor(combo / 3)}</p>
        </div>
      </div>

      <div
        onClick={miss}
        className="relative w-full h-[55vh] min-h-[350px] glass-card-highlight rounded-2xl overflow-hidden cursor-crosshair"
      >
        {targets.map((t) => (
          <button
            key={t.id}
            onClick={(e) => { e.stopPropagation(); tap(t.id); }}
            className="absolute rounded-full bg-neon-cyan border-2 border-foreground animate-pop-in spring-btn"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: t.size,
              height: t.size,
              boxShadow: "0 0 20px hsla(var(--neon-cyan) / 0.6)",
            }}
          />
        ))}

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">Best score: <span className="neon-text-cyan font-bold">{best}</span></p>
            <button
              onClick={start}
              className="spring-btn px-10 py-3 rounded-xl bg-primary/25 border border-primary/50 text-primary font-bold tracking-wide hover:bg-primary/35 neon-glow-cyan"
            >
              {time === 0 ? "PLAY AGAIN" : "START"}
            </button>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Miss = combo reset</p>
          </div>
        )}
      </div>
    </div>
  );
}
