import { useEffect, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const COLORS = [
  { name: "cyan",   hex: "#00f0ff" },
  { name: "pink",   hex: "#ff00ea" },
  { name: "lime",   hex: "#7cff00" },
  { name: "amber",  hex: "#ffb300" },
  { name: "violet", hex: "#a855f7" },
  { name: "rose",   hex: "#fb7185" },
];

const DURATION = 20;

export default function ColorMatch() {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState(COLORS[0]);
  const [grid, setGrid] = useState<typeof COLORS>([]);
  const [best, setBest] = useState<number>(() => loadFromStorage("colormatch_best", 0));
  const [flash, setFlash] = useState<"good"|"bad"|null>(null);

  const newRound = () => {
    const t = COLORS[Math.floor(Math.random() * COLORS.length)];
    const others = COLORS.filter((c) => c.name !== t.name).sort(() => Math.random() - 0.5).slice(0, 5);
    const g = [...others, t].sort(() => Math.random() - 0.5);
    setTarget(t);
    setGrid(g);
  };

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      sounds.win();
      if (score > best) { setBest(score); saveToStorage("colormatch_best", score); celebrate("big"); }
      return;
    }
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, running, score, best]);

  const start = () => { setRunning(true); setTime(DURATION); setScore(0); newRound(); };

  const tap = (name: string) => {
    if (!running) return;
    if (name === target.name) {
      setScore((s) => s + 1);
      sounds.click();
      setFlash("good");
      newRound();
    } else {
      setScore((s) => Math.max(0, s - 1));
      sounds.tick();
      setFlash("bad");
    }
    setTimeout(() => setFlash(null), 120);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">MINI-GAME · NEW</p>
        <h1 className="font-display font-black text-4xl gradient-text">Color Match</h1>
        <p className="text-sm text-muted-foreground mt-1">Tap the swatch that matches the word. Wrong = -1.</p>
      </div>

      <div className="flex gap-3 text-sm font-mono">
        <div className="glass-card px-3 py-2"><span className="text-muted-foreground">TIME </span><span className="text-neon-cyan font-bold">{time}s</span></div>
        <div className="glass-card px-3 py-2"><span className="text-muted-foreground">SCORE </span><span className="text-neon-pink font-bold">{score}</span></div>
        <div className="glass-card px-3 py-2"><span className="text-muted-foreground">BEST </span><span className="text-neon-green font-bold">{best}</span></div>
      </div>

      {!running ? (
        <button onClick={start} className="spring-btn w-full py-6 rounded-xl bg-primary/20 text-primary border-2 border-primary/40 font-display font-black text-2xl">
          {time === 0 || score > 0 ? "PLAY AGAIN" : "START"}
        </button>
      ) : (
        <>
          <div
            className={`glass-card p-8 text-center transition-all ${flash === "good" ? "neon-glow-cyan" : flash === "bad" ? "ring-4 ring-destructive/60" : ""}`}
          >
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Tap the color</p>
            <p
              className="font-display font-black text-6xl uppercase"
              style={{ color: COLORS[(COLORS.findIndex(c => c.name === target.name) + 2) % COLORS.length].hex }}
            >
              {target.name}
            </p>
            <p className="text-[10px] text-muted-foreground mt-2 font-mono">(ignore the text color — match the WORD)</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {grid.map((c) => (
              <button
                key={c.name}
                onClick={() => tap(c.name)}
                className="spring-btn aspect-square rounded-xl border-2 border-white/10"
                style={{ background: c.hex, boxShadow: `0 0 24px ${c.hex}55` }}
                aria-label={c.name}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
