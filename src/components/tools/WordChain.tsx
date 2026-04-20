import { useEffect, useRef, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const STARTERS = ["apple","banana","cat","dragon","eagle","forest","ghost","horse","island","jungle","kitten","lemon","mountain","ninja","ocean","piano","quartz","river","star","tiger"];

export default function WordChain() {
  const [chain, setChain] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [time, setTime] = useState(60);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState<number>(() => loadFromStorage("wordchain_best", 0));
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      sounds.flip();
      if (chain.length > best) {
        setBest(chain.length);
        saveToStorage("wordchain_best", chain.length);
        celebrate("medium");
      }
      return;
    }
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, running]);

  const start = () => {
    const seed = STARTERS[Math.floor(Math.random() * STARTERS.length)];
    setChain([seed]);
    setInput("");
    setTime(60);
    setRunning(true);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!running) return;
    const word = input.trim().toLowerCase();
    if (word.length < 3) { setError("3+ letters please"); return; }
    const last = chain[chain.length - 1];
    const required = last[last.length - 1].toLowerCase();
    if (word[0] !== required) { setError(`Must start with "${required.toUpperCase()}"`); sounds.flip(); return; }
    if (chain.includes(word)) { setError("Already used!"); sounds.flip(); return; }
    setChain((c) => [...c, word]);
    setInput("");
    setError(null);
    setTime((t) => Math.min(60, t + 3));
    sounds.tick();
  };

  const last = chain[chain.length - 1];
  const required = last ? last[last.length - 1].toUpperCase() : "—";

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">CHAIN · 60 SECONDS</p>
        <h2 className="text-4xl font-display font-black gradient-text">Word Chain</h2>
        <p className="text-xs text-muted-foreground">Each word starts with the last letter of the previous. +3s per word. Best: {best}</p>
      </header>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="glass-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Time</p>
          <p className="font-display font-black text-2xl neon-text-cyan">{time}s</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Words</p>
          <p className="font-display font-black text-2xl">{chain.length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Next</p>
          <p className="font-display font-black text-2xl neon-text-violet">{required}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(null); }}
          disabled={!running}
          placeholder={running ? `Word starting with ${required}…` : "Press START"}
          className="flex-1 px-4 py-3 rounded-xl bg-muted/40 border border-border/50 outline-none focus:border-primary/50"
        />
        {!running ? (
          <button type="button" onClick={start} className="spring-btn px-6 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold neon-glow-cyan">
            START
          </button>
        ) : (
          <button type="submit" className="spring-btn px-6 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold">
            SEND
          </button>
        )}
      </form>

      {error && <p className="text-center text-xs text-destructive animate-pop-in">{error}</p>}

      <div className="glass-card p-4 max-h-60 overflow-y-auto">
        {chain.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center">Your chain will appear here…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chain.map((w, i) => (
              <span key={i} className="px-2.5 py-1 rounded-lg bg-muted/40 text-sm font-mono">
                {w}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
