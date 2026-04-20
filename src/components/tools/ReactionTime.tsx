import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { Zap, Trophy } from "lucide-react";

type Phase = "idle" | "waiting" | "ready" | "result" | "tooSoon";

export default function ReactionTime() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reaction, setReaction] = useState<number | null>(null);
  const [best, setBest] = useState<number>(() => loadFromStorage("reaction_best", 9999));
  const [last5, setLast5] = useState<number[]>(() => loadFromStorage("reaction_last5", []));
  const startRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const begin = () => {
    if (phase === "waiting" || phase === "ready") return;
    setPhase("waiting");
    setReaction(null);
    const delay = 1200 + Math.random() * 3000;
    timerRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setPhase("ready");
      sounds.tick();
    }, delay);
  };

  const click = () => {
    if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("tooSoon");
      sounds.flip();
      return;
    }
    if (phase === "ready") {
      const r = Math.round(performance.now() - startRef.current);
      setReaction(r);
      setPhase("result");
      const updated = [r, ...last5].slice(0, 5);
      setLast5(updated);
      saveToStorage("reaction_last5", updated);
      if (r < best) {
        setBest(r);
        saveToStorage("reaction_best", r);
        celebrate("medium");
        sounds.win();
      } else {
        sounds.click();
      }
      return;
    }
    if (phase === "result" || phase === "tooSoon" || phase === "idle") begin();
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const bg =
    phase === "ready" ? "bg-neon-green/30 border-neon-green/60"
    : phase === "waiting" ? "bg-destructive/20 border-destructive/40"
    : phase === "tooSoon" ? "bg-destructive/30 border-destructive/60"
    : "bg-muted/20 border-border/40";

  const label =
    phase === "idle" ? "TAP TO START"
    : phase === "waiting" ? "WAIT for green…"
    : phase === "ready" ? "TAP NOW!"
    : phase === "tooSoon" ? "Too soon! Tap to retry."
    : reaction !== null ? `${reaction} ms` : "";

  const avg = last5.length ? Math.round(last5.reduce((a, b) => a + b, 0) / last5.length) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">REFLEX · MILLISECONDS</p>
        <h2 className="text-4xl font-display font-black gradient-text">Reaction Time</h2>
        <p className="text-xs text-muted-foreground">Tap when the box turns green. Don't jump the gun.</p>
      </header>

      <button
        onClick={click}
        className={`w-full h-72 rounded-2xl border-2 transition-colors flex flex-col items-center justify-center gap-3 spring-btn ${bg}`}
      >
        <Zap className={`w-10 h-10 ${phase === "ready" ? "text-neon-green" : phase === "tooSoon" ? "text-destructive" : "text-muted-foreground"}`} />
        <span className="text-3xl font-display font-black">{label}</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1">
            <Trophy className="w-3 h-3 text-neon-cyan" /> Best
          </p>
          <p className="font-display font-black text-2xl neon-text-cyan">{best === 9999 ? "—" : `${best} ms`}</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg (last 5)</p>
          <p className="font-display font-black text-2xl">{avg ? `${avg} ms` : "—"}</p>
        </div>
      </div>

      {last5.length > 0 && (
        <div className="flex gap-2 justify-center text-xs font-mono">
          {last5.map((r, i) => (
            <span key={i} className="px-2 py-1 rounded bg-muted/40 text-muted-foreground">{r}</span>
          ))}
        </div>
      )}
    </div>
  );
}
