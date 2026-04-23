import { useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";

const SYMBOLS = ["🍒", "🍋", "🔔", "💎", "7️⃣", "⭐"];

export default function Slots() {
  const [reels, setReels] = useState<string[]>(["🎰", "🎰", "🎰"]);
  const [spinning, setSpinning] = useState(false);
  const [chips, setChips] = useState(100);
  const [last, setLast] = useState<string>("");

  const spin = () => {
    if (spinning || chips < 5) return;
    setSpinning(true);
    setChips((c) => c - 5);
    setLast("");
    sounds.drumroll(1200);
    let ticks = 0;
    const id = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
      ticks += 1;
      if (ticks >= 12) {
        clearInterval(id);
        const final = [
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
          SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        ];
        setReels(final);
        setSpinning(false);
        if (final[0] === final[1] && final[1] === final[2]) {
          const payout = final[0] === "💎" ? 100 : final[0] === "7️⃣" ? 50 : 25;
          setChips((c) => c + payout);
          setLast(`💥 JACKPOT! +${payout}`);
          sounds.win();
          celebrate("big");
        } else if (final[0] === final[1] || final[1] === final[2]) {
          setChips((c) => c + 8);
          setLast("Pair! +8");
          sounds.win();
        } else {
          setLast("No match.");
        }
      }
    }, 90);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">Casino · Exclusive</p>
          <h1 className="font-display font-black text-4xl">🎰 Lucky Slots</h1>
        </div>
        <div className="glass-card px-4 py-2 text-right">
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Chips</p>
          <p className="text-2xl font-display font-black text-amber-400">💰 {chips}</p>
        </div>
      </div>

      <div className="glass-card p-8 flex justify-center gap-3">
        {reels.map((r, i) => (
          <div key={i} className={`w-24 h-28 rounded-2xl border-4 border-amber-500/60 bg-card flex items-center justify-center text-6xl ${
            spinning ? "animate-pulse" : ""
          }`}>
            {r}
          </div>
        ))}
      </div>

      {last && (
        <p className={`text-center text-xl font-bold ${last.includes("JACKPOT") ? "text-amber-400" : last.includes("Pair") ? "text-neon-green" : "text-muted-foreground"}`}>
          {last}
        </p>
      )}

      <div className="text-center space-y-2">
        <button
          onClick={spin}
          disabled={spinning || chips < 5}
          className="spring-btn px-8 py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-lg disabled:opacity-50"
        >
          {spinning ? "Spinning…" : "Pull · Bet 5"}
        </button>
        <p className="text-[10px] text-muted-foreground font-mono">
          3-of-a-kind 💎 = 100 · 7️⃣ = 50 · other = 25 · pair = 8
        </p>
      </div>
    </div>
  );
}
