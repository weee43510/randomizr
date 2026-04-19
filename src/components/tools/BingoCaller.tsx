import { useState } from "react";
import { sounds } from "@/lib/sounds";

const MAX = 75;

function letterFor(n: number) {
  if (n <= 15) return "B";
  if (n <= 30) return "I";
  if (n <= 45) return "N";
  if (n <= 60) return "G";
  return "O";
}

const COLORS: Record<string, string> = {
  B: "hsl(var(--neon-cyan))",
  I: "hsl(var(--neon-violet))",
  N: "hsl(var(--neon-pink))",
  G: "hsl(var(--neon-green))",
  O: "hsl(40 90% 55%)",
};

export default function BingoCaller() {
  const [called, setCalled] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const remaining = Array.from({ length: MAX }, (_, i) => i + 1).filter(
    (n) => !called.includes(n)
  );

  const callNext = () => {
    if (rolling || remaining.length === 0) return;
    setRolling(true);
    sounds.drumroll(700);
    let ticks = 0;
    const interval = setInterval(() => {
      const r = remaining[Math.floor(Math.random() * remaining.length)];
      setCurrent(r);
      ticks++;
      if (ticks > 6) {
        clearInterval(interval);
        const final = remaining[Math.floor(Math.random() * remaining.length)];
        setCurrent(final);
        setCalled((c) => [...c, final]);
        setRolling(false);
        sounds.win();
      }
    }, 110);
  };

  const reset = () => {
    setCalled([]);
    setCurrent(null);
  };

  const letter = current ? letterFor(current) : "—";
  const color = current ? COLORS[letter] : "hsl(var(--muted-foreground))";

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-1">
        <h2 className="text-3xl font-bold gradient-text">Bingo Caller</h2>
        <p className="text-sm text-muted-foreground">
          {called.length} of {MAX} called
        </p>
      </div>

      {/* Big call display */}
      <div className="glass-card-highlight glass-card-shimmer p-8 flex flex-col items-center gap-3">
        <span
          className="font-mono text-sm tracking-[0.5em] uppercase"
          style={{ color }}
        >
          {letter}
        </span>
        <div
          className="font-display font-black text-8xl sm:text-9xl leading-none"
          style={{ color, textShadow: `0 0 30px ${color}` }}
        >
          {current ?? "—"}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={callNext}
          disabled={rolling || remaining.length === 0}
          className="spring-btn px-8 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold hover:bg-primary/30 disabled:opacity-40 neon-glow-cyan"
        >
          {remaining.length === 0 ? "All Called!" : rolling ? "Calling…" : "CALL NEXT"}
        </button>
        <button
          onClick={reset}
          className="spring-btn px-6 py-3 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground font-semibold hover:text-foreground"
        >
          Reset
        </button>
      </div>

      {/* Board */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-[auto_1fr] gap-3">
          {(["B", "I", "N", "G", "O"] as const).map((L, rowIdx) => {
            const start = rowIdx * 15 + 1;
            const nums = Array.from({ length: 15 }, (_, i) => start + i);
            return (
              <div key={L} className="contents">
                <div
                  className="font-display font-black text-2xl flex items-center justify-center w-10"
                  style={{ color: COLORS[L] }}
                >
                  {L}
                </div>
                <div className="grid grid-cols-15 gap-1" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
                  {nums.map((n) => {
                    const isCalled = called.includes(n);
                    const isCurrent = current === n;
                    return (
                      <div
                        key={n}
                        className={`aspect-square rounded-md flex items-center justify-center font-mono text-[10px] sm:text-xs transition-all ${
                          isCurrent
                            ? "bg-primary text-primary-foreground neon-glow-cyan scale-110"
                            : isCalled
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-muted/30 text-muted-foreground border border-border/20"
                        }`}
                      >
                        {n}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
