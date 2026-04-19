import { useState } from "react";
import { sounds } from "@/lib/sounds";

export default function CoinDice() {
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  const [diceRotation, setDiceRotation] = useState({ x: 0, y: 0 });

  const flipCoin = () => {
    if (coinFlipping) return;
    setCoinFlipping(true);
    setCoinResult(null);
    sounds.drumroll(1500);

    const result = Math.random() < 0.5 ? "heads" : "tails";
    const flips = 6 + Math.floor(Math.random() * 4);
    setCoinRotation(prev => prev + flips * 360 + (result === "tails" ? 180 : 0));

    setTimeout(() => {
      setCoinResult(result);
      setCoinFlipping(false);
      sounds.win();
    }, 1500);
  };

  const rollDice = () => {
    if (diceRolling) return;
    setDiceRolling(true);
    setDiceResult(null);
    sounds.drumroll(1700);

    const result = Math.floor(Math.random() * 6) + 1;
    // Container rotation needed to bring each face to the front
    // (inverse of each face's mounted transform).
    const faceRotations: Record<number, { x: number; y: number }> = {
      1: { x: 0,    y: 0 },
      2: { x: -90,  y: 0 },
      3: { x: 0,    y: 90 },
      4: { x: 0,    y: -90 },
      5: { x: 90,   y: 0 },
      6: { x: 180,  y: 0 },
    };
    const target = faceRotations[result];
    // Add full rotations only (multiples of 360) so we always land on the chosen face.
    setDiceRotation({
      x: target.x + 720,
      y: target.y + 720,
    });

    setTimeout(() => {
      setDiceResult(result);
      setDiceRolling(false);
      sounds.win();
    }, 1800);
  };

  const diceFaces: Record<number, number[][]> = {
    1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]], 5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };

  return (
    <div className="flex flex-col items-center gap-10 animate-fade-in">
      <h2 className="text-xl font-bold neon-text-violet">Coin & Dice</h2>

      <div className="flex flex-col sm:flex-row gap-12 items-center">
        {/* Coin */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-32 h-32 rounded-full cursor-pointer"
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
              {/* Heads */}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-3xl font-black border-4"
                style={{
                  backfaceVisibility: "hidden",
                  background: "linear-gradient(135deg, hsl(45 80% 55%), hsl(35 90% 45%))",
                  borderColor: "hsl(40 70% 35%)",
                  color: "hsl(35 80% 25%)",
                  boxShadow: "0 0 20px hsla(45 80% 55% / 0.4), inset 0 2px 4px hsla(0 0% 100% / 0.3)",
                }}
              >
                H
              </div>
              {/* Tails */}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center text-3xl font-black border-4"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateX(180deg)",
                  background: "linear-gradient(135deg, hsl(210 30% 55%), hsl(210 25% 45%))",
                  borderColor: "hsl(210 20% 35%)",
                  color: "hsl(210 30% 20%)",
                  boxShadow: "0 0 20px hsla(210 30% 55% / 0.4), inset 0 2px 4px hsla(0 0% 100% / 0.3)",
                }}
              >
                T
              </div>
            </div>
          </div>
          <p className="text-sm font-semibold h-5">
            {coinResult && <span className="neon-text-cyan animate-scale-in">{coinResult.toUpperCase()}</span>}
          </p>
          <button
            onClick={flipCoin}
            disabled={coinFlipping}
            className="spring-btn px-6 py-2 rounded-lg bg-primary/20 border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/30 disabled:opacity-50"
          >
            Flip Coin
          </button>
        </div>

        {/* Dice */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-28 h-28 cursor-pointer"
            style={{ perspective: "600px" }}
            onClick={rollDice}
          >
            <div
              className="w-full h-full relative"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${diceRotation.x}deg) rotateY(${diceRotation.y}deg)`,
                transition: diceRolling ? "transform 1.8s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((face) => {
                const transforms: Record<number, string> = {
                  1: "translateZ(56px)",
                  2: "rotateX(90deg) translateZ(56px)",
                  3: "rotateY(-90deg) translateZ(56px)",
                  4: "rotateY(90deg) translateZ(56px)",
                  5: "rotateX(-90deg) translateZ(56px)",
                  6: "rotateX(180deg) translateZ(56px)",
                };
                return (
                  <div
                    key={face}
                    className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{
                      transform: transforms[face],
                      backfaceVisibility: "hidden",
                      background: "linear-gradient(135deg, hsl(230 20% 18%), hsl(230 15% 14%))",
                      border: "2px solid hsla(var(--neon-violet) / 0.4)",
                      boxShadow: "0 0 15px hsla(var(--neon-violet) / 0.2)",
                    }}
                  >
                    <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-16 h-16">
                      {Array.from({ length: 9 }).map((_, idx) => {
                        const row = Math.floor(idx / 3);
                        const col = idx % 3;
                        const hasDot = diceFaces[face].some(([r, c]) => r === row && c === col);
                        return (
                          <div key={idx} className="flex items-center justify-center">
                            {hasDot && <div className="w-3 h-3 rounded-full bg-foreground" style={{ boxShadow: "0 0 4px hsla(0 0% 100% / 0.5)" }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-sm font-semibold h-5">
            {diceResult && <span className="neon-text-violet animate-scale-in">{diceResult}</span>}
          </p>
          <button
            onClick={rollDice}
            disabled={diceRolling}
            className="spring-btn px-6 py-2 rounded-lg bg-accent/20 border border-accent/40 text-accent text-sm font-semibold hover:bg-accent/30 disabled:opacity-50"
          >
            Roll Dice
          </button>
        </div>
      </div>
    </div>
  );
}
