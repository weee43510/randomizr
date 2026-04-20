import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { ArrowDown, ArrowUp, Flame, Snowflake } from "lucide-react";

export default function NumberHunt() {
  const [target, setTarget] = useState<number | null>(null);
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<{ n: number; hint: string }[]>([]);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number>(() => loadFromStorage("numhunt_best", 99));

  const start = () => {
    setTarget(Math.floor(Math.random() * 100) + 1);
    setHistory([]);
    setGuess("");
    setDone(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(guess, 10);
    if (isNaN(n) || n < 1 || n > 100 || target === null) return;
    let hint = "";
    if (n === target) hint = "EXACT!";
    else {
      const diff = Math.abs(n - target);
      const dir = n < target ? "higher" : "lower";
      const heat = diff <= 3 ? "🔥 burning" : diff <= 8 ? "🌶️ hot" : diff <= 20 ? "😐 warm" : "🥶 cold";
      hint = `${dir} · ${heat}`;
    }
    const entry = { n, hint };
    setHistory((h) => [entry, ...h]);
    setGuess("");
    if (n === target) {
      setDone(true);
      sounds.win();
      celebrate("big");
      const turns = history.length + 1;
      if (turns < best) { setBest(turns); saveToStorage("numhunt_best", turns); }
    } else {
      sounds.tick();
    }
  };

  const lastDir = history[0] ? (history[0].n < (target ?? 0) ? "up" : "down") : null;

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">1–100 · HOT OR COLD</p>
        <h2 className="text-4xl font-display font-black gradient-text">Number Hunt</h2>
        <p className="text-xs text-muted-foreground">Best: {best === 99 ? "—" : `${best} guesses`}</p>
      </header>

      {target === null ? (
        <div className="glass-card-highlight p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">I'm thinking of a number 1–100. Find it.</p>
          <button onClick={start} className="spring-btn px-10 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold neon-glow-cyan">
            START
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={submit} className="flex gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={guess}
              disabled={done}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="1–100"
              className="flex-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/50 outline-none focus:border-primary/50 text-center font-mono text-lg"
            />
            <button
              type="submit"
              disabled={done}
              className="spring-btn px-6 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold disabled:opacity-50"
            >
              GUESS
            </button>
          </form>

          {!done && lastDir && (
            <div className="flex justify-center">
              {lastDir === "up" ? <ArrowUp className="w-10 h-10 text-neon-cyan animate-bounce" /> : <ArrowDown className="w-10 h-10 text-neon-pink animate-bounce" />}
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((h, i) => {
              const isBurn = h.hint.includes("burning") || h.hint.includes("EXACT");
              const isCold = h.hint.includes("cold");
              return (
                <div key={i} className={`glass-card p-3 flex items-center justify-between ${i === 0 ? "animate-pop-in" : ""}`}>
                  <span className="font-mono text-lg font-bold">{h.n}</span>
                  <span className={`text-xs flex items-center gap-1 ${isBurn ? "text-neon-pink" : isCold ? "text-neon-cyan" : "text-muted-foreground"}`}>
                    {isBurn && <Flame className="w-3 h-3" />}
                    {isCold && <Snowflake className="w-3 h-3" />}
                    {h.hint}
                  </span>
                </div>
              );
            })}
          </div>

          {done && (
            <div className="text-center space-y-3 animate-pop-in">
              <p className="font-display font-black text-2xl neon-text-cyan">🎯 Got it in {history.length}!</p>
              <button onClick={start} className="spring-btn px-8 py-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold">
                NEW NUMBER
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
