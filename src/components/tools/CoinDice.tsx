import { useRef, useState } from "react";
import { sounds } from "@/lib/sounds";
import { celebrate } from "@/lib/confetti";
import { unlock } from "@/lib/achievements";

type Tab = "coin" | "dice";

export default function CoinDice() {
  const [tab, setTab] = useState<Tab>("coin");

  // Coin
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);

  // Dice
  const [diceCount, setDiceCount] = useState(1);
  const [diceResults, setDiceResults] = useState<number[]>([]);
  const [diceRolling, setDiceRolling] = useState(false);

  const flipCoin = () => {
    if (coinFlipping) return;
    setCoinFlipping(true);
    setCoinResult(null);
    sounds.drumroll(1500);
    const result = Math.random() < 0.5 ? "heads" : "tails";
    const flips = 6 + Math.floor(Math.random() * 4);
    setCoinRotation((p) => p + flips * 360 + (result === "tails" ? 180 : 0));
    setTimeout(() => {
      setCoinResult(result);
      setCoinFlipping(false);
      sounds.win();
      celebrate("small");
    }, 1500);
  };

  const sixStreak = useRef(0);
  const rollDice = () => {
    if (diceRolling) return;
    setDiceRolling(true);
    setDiceResults([]);
    sounds.drumroll(1200);
    setTimeout(() => {
      const rolls = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
      setDiceResults(rolls);
      setDiceRolling(false);
      sounds.win();
      celebrate(diceCount >= 4 ? "medium" : "small");
      // Badge triggers
      if (rolls.includes(6)) unlock("dice_six");
      if (diceCount === 1 && rolls[0] === 6) {
        sixStreak.current += 1;
        if (sixStreak.current >= 3) unlock("dice_six_streak");
      } else if (diceCount === 1) {
        sixStreak.current = 0;
      }
    }, 1200);
  };

  const diceFaces: Record<number, number[][]> = {
    1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]], 5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  const total = diceResults.reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <header className="text-center space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground">FLIP · ROLL · DECIDE</p>
        <h2 className="text-4xl font-display font-black gradient-text">Coin & Dice</h2>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-2">
        {(["coin", "dice"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`spring-btn px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wider border ${
              tab === t
                ? "bg-primary/25 border-primary/60 text-primary neon-glow-cyan"
                : "bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "coin" && (
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-36 h-36 rounded-full cursor-pointer"
            style={{ perspective: "600px" }}
            onClick={flipCoin}
          >
            <div
              className="w-full h-full relative"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${coinRotation}deg)`,
                transition: coinFlipping ? "transform 1.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-4xl font-black border-4"
                style={{
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(135deg, hsl(45 80% 55%), hsl(35 90% 45%))",
                  borderColor: "hsl(40 70% 35%)",
                  color: "hsl(35 80% 25%)",
                  boxShadow: "0 0 20px hsla(45 80% 55% / 0.4), inset 0 2px 4px hsla(0 0% 100% / 0.3)",
                }}
              >H</div>
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-4xl font-black border-4"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                  background: "linear-gradient(135deg, hsl(210 30% 55%), hsl(210 25% 45%))",
                  borderColor: "hsl(210 20% 35%)",
                  color: "hsl(210 30% 20%)",
                  boxShadow: "0 0 20px hsla(210 30% 55% / 0.4), inset 0 2px 4px hsla(0 0% 100% / 0.3)",
                }}
              >T</div>
            </div>
          </div>
          <p className="text-xl font-display font-black h-8">
            {coinResult && <span className="neon-text-cyan animate-pop-in">{coinResult.toUpperCase()}</span>}
          </p>
          <button
            onClick={flipCoin}
            disabled={coinFlipping}
            className="spring-btn px-8 py-3 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold hover:bg-primary/30 disabled:opacity-50 neon-glow-cyan"
          >
            {coinFlipping ? "Flipping…" : "FLIP COIN"}
          </button>
        </div>
      )}

      {tab === "dice" && (
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">How many?</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setDiceCount(n)}
                  className={`spring-btn w-9 h-9 rounded-lg text-sm font-bold ${
                    diceCount === n
                      ? "bg-primary/25 border border-primary/60 text-primary neon-glow-cyan"
                      : "bg-muted/30 border border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >{n}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center min-h-[100px] items-center">
            {(diceResults.length > 0 ? diceResults : Array(diceCount).fill(0)).map((face, i) => (
              <div
                key={i}
                className={`w-20 h-20 rounded-xl border-2 border-neon-violet/40 bg-muted/30 grid grid-cols-3 grid-rows-3 gap-1 p-2 ${
                  diceRolling ? "animate-spin" : face ? "animate-pop-in" : ""
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {Array.from({ length: 9 }).map((_, idx) => {
                  const row = Math.floor(idx / 3);
                  const col = idx % 3;
                  const has = face > 0 && diceFaces[face].some(([r, c]) => r === row && c === col);
                  return (
                    <div key={idx} className="flex items-center justify-center">
                      {has && <div className="w-2.5 h-2.5 rounded-full bg-foreground" />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {diceResults.length > 0 && (
            <p className="text-sm font-mono text-muted-foreground">
              Rolls: <span className="text-foreground font-bold">{diceResults.join(" + ")}</span>
              {diceCount > 1 && <> = <span className="neon-text-violet font-black text-lg">{total}</span></>}
            </p>
          )}

          <button
            onClick={rollDice}
            disabled={diceRolling}
            className="spring-btn px-8 py-3 rounded-xl bg-accent/20 border border-accent/40 text-accent font-bold hover:bg-accent/30 disabled:opacity-50"
          >
            {diceRolling ? "Rolling…" : `ROLL ${diceCount}`}
          </button>
        </div>
      )}
    </div>
  );
}
