import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { TRUTHS, DARES } from "@/data/truthOrDare";
import { pickNoRepeat, resetNoRepeat, noRepeatStats } from "@/lib/noRepeat";
import { RotateCcw } from "lucide-react";

type Mode = "truth" | "dare" | "either";

export default function TruthOrDare() {
  const [mode, setMode] = useState<Mode>("either");
  const [pulled, setPulled] = useState<{ kind: "truth" | "dare"; text: string } | null>(null);
  const [pulling, setPulling] = useState(false);
  const [, setTick] = useState(0);

  const truthStats = noRepeatStats("truths", TRUTHS.length);
  const dareStats = noRepeatStats("dares", DARES.length);

  const pull = () => {
    if (pulling) return;
    setPulling(true);
    setPulled(null);
    sounds.drumroll(900);
    setTimeout(() => {
      const kind: "truth" | "dare" =
        mode === "either" ? (Math.random() < 0.5 ? "truth" : "dare") : mode;
      const key = kind === "truth" ? "truths" : "dares";
      const list = kind === "truth" ? TRUTHS : DARES;
      const { item } = pickNoRepeat(key, list);
      setPulled({ kind, text: item });
      setPulling(false);
      setTick((t) => t + 1);
      sounds.win();
    }, 900);
  };

  const reset = () => {
    resetNoRepeat("truths");
    resetNoRepeat("dares");
    setPulled(null);
    setTick((t) => t + 1);
  };

  return (
    <div className="max-w-xl mx-auto space-y-7 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">PARTY · NO REPEATS</p>
        <h2 className="text-4xl font-display font-black gradient-text">Truth or Dare</h2>
        <p className="text-xs text-muted-foreground">
          Truths {truthStats.remaining}/{truthStats.total} · Dares {dareStats.remaining}/{dareStats.total} left
        </p>
      </header>

      <div className="flex justify-center gap-2">
        {(["truth", "either", "dare"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`spring-btn px-5 py-2 rounded-full text-sm font-semibold uppercase tracking-wider border ${
                active
                  ? m === "truth"
                    ? "bg-primary/25 border-primary/60 text-primary neon-glow-cyan"
                    : m === "dare"
                      ? "bg-destructive/25 border-destructive/60 text-destructive"
                      : "bg-accent/25 border-accent/60 text-accent neon-glow-violet"
                  : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {m === "either" ? "Surprise Me" : m}
            </button>
          );
        })}
      </div>

      <div
        className={`glass-card-highlight glass-card-shimmer min-h-[220px] p-8 flex items-center justify-center text-center ${
          pulled?.kind === "dare" ? "border-destructive/40" : ""
        }`}
      >
        {pulling ? (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : pulled ? (
          <div className="space-y-3 animate-scale-in">
            <p
              className={`text-xs font-mono uppercase tracking-[0.3em] ${
                pulled.kind === "dare" ? "text-destructive" : "neon-text-cyan"
              }`}
            >
              {pulled.kind}
            </p>
            <p className="text-lg font-display font-semibold text-foreground leading-snug">
              {pulled.text}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Pull your first card →</p>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={pull}
          disabled={pulling}
          className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold tracking-wide hover:bg-primary/30 disabled:opacity-50 neon-glow-cyan"
        >
          {pulling ? "Drawing…" : "PULL A CARD"}
        </button>
        <button
          onClick={reset}
          title="Reset deck"
          className="spring-btn px-4 py-3 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
