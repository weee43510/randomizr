import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";

type BetType = "red" | "black" | "green" | null;

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const colorOf = (n: number) => (n === 0 ? "green" : RED.has(n) ? "red" : "black");

export default function RouletteRoyale() {
  const [bet, setBet] = useState<BetType>(null);
  const [amount, setAmount] = useState(10);
  const [chips, setChips] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const spin = () => {
    if (!bet || spinning || amount > chips) return;
    setSpinning(true);
    setChips((c) => c - amount);
    setMsg("");
    sounds.drumroll(1500);
    let ticks = 0;
    const id = setInterval(() => {
      setResult(Math.floor(Math.random() * 37));
      ticks += 1;
      if (ticks >= 18) {
        clearInterval(id);
        const final = Math.floor(Math.random() * 37);
        setResult(final);
        const c = colorOf(final);
        if (c === bet) {
          const mult = bet === "green" ? 14 : 2;
          const win = amount * mult;
          setChips((cc) => cc + win);
          setMsg(`✅ ${final} (${c}) — won ${win}!`);
          celebrate("medium");
          sounds.win();
        } else {
          setMsg(`❌ ${final} (${c}) — house wins.`);
        }
        setSpinning(false);
      }
    }, 80);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Casino · Exclusive</p>
          <h1 className="font-display font-black text-4xl">🔴 Roulette Royale</h1>
        </div>
        <div className="glass-card px-4 py-2 text-right">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Chips</p>
          <p className="text-2xl font-display font-black text-amber-400">💰 {chips}</p>
        </div>
      </div>

      <div className="glass-card p-8 text-center">
        <div className={`mx-auto w-40 h-40 rounded-full border-8 border-amber-500/60 flex items-center justify-center text-6xl font-black ${
          spinning ? "animate-spin" : ""
        }`}
          style={{ background: result === null ? "transparent" : colorOf(result) === "green" ? "hsl(140 70% 35%)" : colorOf(result) === "red" ? "hsl(0 70% 45%)" : "hsl(0 0% 15%)" }}
        >
          {result ?? "?"}
        </div>
        {msg && <p className={`mt-4 text-lg font-bold ${msg.startsWith("✅") ? "text-neon-green" : "text-muted-foreground"}`}>{msg}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(["red", "black", "green"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setBet(c)}
            className={`spring-btn p-4 rounded-xl border-2 font-bold capitalize ${
              bet === c ? "ring-2 ring-amber-500" : "border-border/40"
            }`}
            style={{ background: c === "green" ? "hsl(140 70% 35% / 0.3)" : c === "red" ? "hsl(0 70% 45% / 0.3)" : "hsl(0 0% 15% / 0.5)" }}
          >
            {c} {c === "green" ? "(14×)" : "(2×)"}
          </button>
        ))}
      </div>

      <div className="flex gap-2 items-center justify-center">
        <label className="text-xs font-mono text-muted-foreground">Bet:</label>
        <input
          type="number" value={amount} min={1} max={chips}
          onChange={(e) => setAmount(Math.max(1, Math.min(chips, +e.target.value || 0)))}
          className="w-20 px-2 py-1 rounded bg-muted/40 border border-border/40 text-center"
        />
        <button
          onClick={spin}
          disabled={!bet || spinning || amount > chips}
          className="spring-btn px-6 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold disabled:opacity-50"
        >
          {spinning ? "Spinning…" : "Spin"}
        </button>
      </div>
    </div>
  );
}
