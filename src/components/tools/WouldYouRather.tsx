import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { WYR_PROMPTS } from "@/data/wouldYouRather";
import { pickNoRepeat, resetNoRepeat, noRepeatStats } from "@/lib/noRepeat";
import { RotateCcw } from "lucide-react";

export default function WouldYouRather() {
  const [current, setCurrent] = useState<{ a: string; b: string } | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pick, setPick] = useState<"a" | "b" | null>(null);
  const [, setTick] = useState(0);

  const stats = noRepeatStats("wyr", WYR_PROMPTS.length);

  const pull = () => {
    if (pulling) return;
    setPulling(true);
    setPick(null);
    sounds.drumroll(700);
    setTimeout(() => {
      const { item } = pickNoRepeat("wyr", WYR_PROMPTS);
      setCurrent(item);
      setPulling(false);
      sounds.tada();
      setTick((t) => t + 1);
    }, 700);
  };

  const reset = () => {
    resetNoRepeat("wyr");
    setCurrent(null);
    setPick(null);
    setTick((t) => t + 1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">DILEMMA · NO REPEATS</p>
        <h2 className="text-4xl font-display font-black gradient-text">Would You Rather</h2>
        <p className="text-xs text-muted-foreground">{stats.remaining} of {stats.total} dilemmas left</p>
      </header>

      {!current ? (
        <div className="glass-card-highlight p-10 text-center space-y-4">
          <p className="text-sm text-muted-foreground">Tap below to pull your first dilemma.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {(["a", "b"] as const).map((side) => {
            const text = side === "a" ? current.a : current.b;
            const isPick = pick === side;
            return (
              <button
                key={side}
                onClick={() => {
                  setPick(side);
                  sounds.click();
                }}
                disabled={pulling}
                className={`spring-btn glass-card-shimmer relative p-6 text-left min-h-[160px] flex flex-col justify-between transition-all ${
                  isPick
                    ? side === "a"
                      ? "border-neon-cyan/60 neon-glow-cyan"
                      : "border-neon-pink/60"
                    : ""
                }`}
                style={
                  isPick && side === "b"
                    ? { boxShadow: "0 0 18px hsla(var(--neon-pink) / 0.4)" }
                    : undefined
                }
              >
                <span
                  className="text-[10px] font-mono uppercase tracking-[0.3em]"
                  style={{ color: side === "a" ? "hsl(var(--neon-cyan))" : "hsl(var(--neon-pink))" }}
                >
                  Option {side.toUpperCase()}
                </span>
                <p className="text-base font-display font-semibold leading-snug">{text}</p>
                {isPick && <span className="text-[10px] text-muted-foreground">✓ Your pick</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-center gap-3">
        <button
          onClick={pull}
          disabled={pulling}
          className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold tracking-wide hover:bg-primary/30 disabled:opacity-50 neon-glow-cyan"
        >
          {pulling ? "Loading…" : current ? "NEXT DILEMMA" : "START"}
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
